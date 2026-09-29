-- Archive successful teacher feedback and clear the live revision message on approval.
begin;

alter table public.student_progress
  drop constraint if exists student_progress_feedback_check;
alter table public.student_progress
  add constraint student_progress_feedback_check check (char_length(feedback) <= 12000),
  add column if not exists rejection_count integer not null default 0
    check (rejection_count >= 0),
  add column if not exists feedback_history jsonb not null default '[]'::jsonb
    check (jsonb_typeof(feedback_history) = 'array');

create or replace function public.shelterlab_review_progress(
  p_student_id uuid,
  p_week smallint,
  p_decision text,
  p_generation integer,
  p_version integer,
  p_feedback text default ''
) returns void language plpgsql security definer set search_path = '' as $$
declare
  s public.profiles%rowtype;
  w public.student_progress%rowtype;
  v_reviewed_at timestamptz := now();
begin
  if auth.uid() is null then raise exception 'Not authorized' using errcode = '42501'; end if;
  select * into s from public.profiles where id = p_student_id and role = 'student' for update;
  if not found or not public.shelterlab_teaches(s.class_id) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_generation is distinct from s.progress_generation then
    raise exception 'Stale progress' using errcode = '40001';
  end if;
  if p_week is null or p_week not between 1 and 6 or p_decision not in ('approve', 'reject') then
    raise exception 'Invalid review' using errcode = '22023';
  end if;
  if p_feedback is null or char_length(p_feedback) > 12000 then
    raise exception 'Invalid feedback' using errcode = '22023';
  end if;

  select * into w from public.student_progress
  where student_id = p_student_id and week_number = p_week for update;
  if not found or w.status <> 'Pending' or p_version is distinct from w.version then
    raise exception 'Only pending work can be reviewed' using errcode = '23514';
  end if;

  if p_decision = 'reject' then
    if char_length(btrim(p_feedback)) = 0 then raise exception 'Feedback required' using errcode = '22023'; end if;
    update public.student_progress set
      status = 'In Progress', submitted_at = null, reviewed_at = v_reviewed_at, reviewed_by = auth.uid(),
      feedback = p_feedback, version = version + 1,
      rejection_count = rejection_count + 1,
      feedback_history = feedback_history || jsonb_build_array(jsonb_build_object(
        'decision', 'reject',
        'rejectionNumber', w.rejection_count + 1,
        'feedback', p_feedback,
        'reviewedAt', v_reviewed_at,
        'reviewedBy', auth.uid(),
        'generation', p_generation,
        'submittedVersion', p_version,
        'submittedAt', w.submitted_at,
        'questionSet', w.question_set,
        'answers', w.answers,
        'gameAudit', w.game_audit
      ))
    where student_id = p_student_id and week_number = p_week;
  else
    update public.student_progress set
      status = 'Completed', reviewed_at = v_reviewed_at, reviewed_by = auth.uid(),
      feedback = '', version = version + 1,
      feedback_history = feedback_history || jsonb_build_array(jsonb_build_object(
        'decision', 'approve',
        'feedback', p_feedback,
        'reviewedAt', v_reviewed_at,
        'reviewedBy', auth.uid(),
        'generation', p_generation,
        'rejectionCount', w.rejection_count,
        'submittedVersion', p_version
      ))
    where student_id = p_student_id and week_number = p_week;
    if p_week < 6 then
      update public.student_progress set status = 'In Progress', version = version + 1
      where student_id = p_student_id and week_number = p_week + 1 and status = 'Locked';
      if not found then raise exception 'Next week is not locked' using errcode = '23514'; end if;
    else
      update public.profiles set is_course_completed = true, course_completed_at = v_reviewed_at
      where id = p_student_id;
    end if;
  end if;

  insert into public.progress_audit(student_id, actor_id, week_number, action, generation, details)
  values (p_student_id, auth.uid(), p_week, case when p_decision = 'reject' then 'return' else 'approve' end, p_generation,
    jsonb_build_object(
      'feedback', p_feedback,
      'previous_version', p_version,
      'rejection_number', case when p_decision = 'reject' then w.rejection_count + 1 else w.rejection_count end,
      'submitted_at', w.submitted_at,
      'question_set', case when p_decision = 'reject' then w.question_set else null end,
      'answers', case when p_decision = 'reject' then w.answers else null end,
      'game_audit', case when p_decision = 'reject' then w.game_audit else null end
    ));
end;
$$;

revoke all on function public.shelterlab_review_progress(uuid,smallint,text,integer,integer,text) from public, anon;
grant execute on function public.shelterlab_review_progress(uuid,smallint,text,integer,integer,text) to authenticated;

-- A reset starts a new generation. Only the selected week and later weeks lose
-- their active review history; earlier completed work remains intact.
create or replace function public.shelterlab_clear_review_history_on_reset()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_start smallint := coalesce(nullif(current_setting('shelterlab.reset_start_week', true), '')::smallint, 1);
begin
  if new.progress_generation > old.progress_generation then
    update public.student_progress
    set rejection_count = 0,
        feedback_history = '[]'::jsonb
    where student_id = new.id and week_number >= v_start;
  end if;
  return new;
end;
$$;

drop trigger if exists shelterlab_clear_review_history_on_reset on public.profiles;
create trigger shelterlab_clear_review_history_on_reset
after update of progress_generation on public.profiles
for each row execute function public.shelterlab_clear_review_history_on_reset();

revoke all on function public.shelterlab_clear_review_history_on_reset() from public, anon, authenticated;

-- Preserve completion milestones before the selected reset week, remove the
-- affected milestones, and carry earlier earned rewards into the new generation.
create or replace function public.shelterlab_clear_completion_records_on_reset()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_start smallint := coalesce(nullif(current_setting('shelterlab.reset_start_week', true), '')::smallint, 1);
begin
  if new.progress_generation > old.progress_generation then
    delete from public.student_review_history
    where student_id = new.id and week_number >= v_start;

    insert into public.student_reward_claims(student_id, week_number, generation, earned_at, claimed_at)
    select student_id, week_number, new.progress_generation, earned_at, claimed_at
    from public.student_reward_claims
    where student_id = new.id and generation = old.progress_generation and week_number < v_start
    on conflict (student_id, week_number, generation) do update set
      earned_at = least(student_reward_claims.earned_at, excluded.earned_at),
      claimed_at = coalesce(student_reward_claims.claimed_at, excluded.claimed_at);

    delete from public.student_reward_claims
    where student_id = new.id and generation = old.progress_generation;
  end if;
  return new;
end;
$$;

-- Reset one or more authorized students to a precise week in a single
-- transaction. The UI submits one student, while the array keeps the original
-- RPC contract compatible with earlier classroom tooling.
create or replace function public.shelterlab_reset_class_progress(p_class_id uuid, p_targets jsonb)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  t jsonb;
  s public.profiles%rowtype;
  v_start smallint;
  v_before jsonb;
  v_rows integer;
  n integer := 0;
begin
  if auth.uid() is null or not public.shelterlab_teaches(p_class_id) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_targets is null or jsonb_typeof(p_targets) <> 'array'
    or jsonb_array_length(p_targets) not between 1 and 200 then
    raise exception 'Invalid reset targets' using errcode = '22023';
  end if;
  if (select count(distinct x ->> 'studentId') from jsonb_array_elements(p_targets) x)
    <> jsonb_array_length(p_targets) then
    raise exception 'Duplicate targets' using errcode = '22023';
  end if;

  for t in select value from jsonb_array_elements(p_targets) order by value ->> 'studentId' loop
    begin
      v_start := (t ->> 'startWeek')::smallint;
    exception when others then
      raise exception 'Invalid reset week' using errcode = '22023';
    end;
    if v_start is null or v_start not between 1 and 6 then
      raise exception 'Invalid reset week' using errcode = '22023';
    end if;

    select * into s from public.profiles
    where id = (t ->> 'studentId')::uuid and class_id = p_class_id and role = 'student'
    for update;
    if not found then raise exception 'Not authorized' using errcode = '42501'; end if;
    if (t ->> 'generation')::integer is distinct from s.progress_generation then
      raise exception 'Stale progress' using errcode = '40001';
    end if;
    if (select count(*) from public.student_progress
        where student_id = s.id and week_number < v_start and status = 'Completed') <> v_start - 1 then
      raise exception 'Previous weeks are not completed' using errcode = '23514';
    end if;

    select jsonb_agg(to_jsonb(p) order by p.week_number) into v_before
    from public.student_progress p where p.student_id = s.id and p.week_number >= v_start;
    if coalesce(jsonb_array_length(v_before), 0) <> 7 - v_start then
      raise exception 'Incomplete six-week progress' using errcode = '23514';
    end if;

    perform set_config('shelterlab.reset_start_week', v_start::text, true);
    update public.profiles set
      progress_generation = progress_generation + 1,
      is_course_completed = false,
      course_completed_at = null
    where id = s.id;

    update public.student_progress set
      status = case when week_number = v_start then 'In Progress'::public.shelterlab_progress_status else 'Locked'::public.shelterlab_progress_status end,
      version = version + 1,
      submitted_at = null,
      reviewed_at = null,
      reviewed_by = null,
      feedback = '',
      answers = null,
      question_set = null,
      game_audit = null,
      rejection_count = 0,
      feedback_history = '[]'::jsonb
    where student_id = s.id and week_number >= v_start;
    get diagnostics v_rows = row_count;
    if v_rows <> 7 - v_start then
      raise exception 'Incomplete six-week progress' using errcode = '23514';
    end if;

    insert into public.progress_audit(student_id, actor_id, week_number, action, generation, details)
    values (s.id, auth.uid(), v_start, 'reset', s.progress_generation + 1,
      jsonb_build_object('reset_from_week', v_start, 'previous_progress', v_before));
    n := n + 1;
  end loop;
  return n;
end;
$$;

revoke all on function public.shelterlab_reset_class_progress(uuid,jsonb) from public, anon;
grant execute on function public.shelterlab_reset_class_progress(uuid,jsonb) to authenticated;

notify pgrst, 'reload schema';
commit;
