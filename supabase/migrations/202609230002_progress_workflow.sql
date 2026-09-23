-- Step 4. Apply AFTER the Step 1 foundation; the foundation must not be rerun.
begin;
alter table public.profiles add column is_course_completed boolean not null default false;
alter table public.profiles add column course_completed_at timestamptz;
alter table public.profiles add constraint course_completion_consistent check
  (is_course_completed = (course_completed_at is not null));
alter table public.student_progress add column question_set jsonb;
alter table public.student_progress add column answers jsonb;
alter table public.classes add column school_id text;
alter table public.classes add column school_name text;
alter table public.classes add column county text;
alter table public.classes add column grade text;
alter table public.classes add column student_count integer not null default 200 check (student_count between 1 and 200);

-- Older accounts may predate the display-name fallback. Use the non-domain
-- portion of their verified Auth email so teachers have a recognizable account
-- label without exposing full email addresses to classmates or clients.
update public.profiles p
set display_name = left(coalesce(nullif(split_part(u.email, '@', 1), ''), '學生-' || left(p.id::text, 8)), 100)
from auth.users u
where p.id = u.id and btrim(p.display_name) = '';

-- Preserve existing completed courses during upgrade.
update public.profiles p set is_course_completed = true, course_completed_at = now()
where p.role = 'student' and (select count(*) from public.student_progress s
  where s.student_id = p.id and s.status = 'Completed') = 6;

-- Remove the old callable overload so no client can bypass the new guards.
drop function public.shelterlab_progress_action(uuid,smallint,text,integer,integer,text);
create function public.shelterlab_progress_action(
  p_student_id uuid, p_week smallint, p_action text,
  p_generation integer, p_version integer, p_feedback text default '',
  p_answers jsonb default null, p_question_set jsonb default null
) returns void language plpgsql security definer set search_path = '' as $$
declare
  s public.profiles%rowtype;
  w public.student_progress%rowtype;
  a jsonb;
  v_before jsonb;
begin
  if auth.uid() is null then raise exception 'Not authorized' using errcode = '42501'; end if;
  -- All operations take the SAME student lock before touching progress.
  select * into s from public.profiles where id = p_student_id for update;
  if not found or s.role <> 'student' then raise exception 'Not authorized' using errcode = '42501'; end if;
  if p_action = 'submit' then
    if auth.uid() <> p_student_id then raise exception 'Not authorized' using errcode = '42501'; end if;
  elsif p_action in ('approve', 'reset') then
    if not public.shelterlab_teaches(s.class_id) then raise exception 'Not authorized' using errcode = '42501'; end if;
  else raise exception 'Invalid action' using errcode = '22023'; end if;
  if p_generation is distinct from s.progress_generation then raise exception 'Stale progress' using errcode = '40001'; end if;
  if (select count(*) from public.student_progress where student_id = s.id) <> 6 then
    raise exception 'Incomplete six-week progress' using errcode = '23514';
  end if;
  if p_action = 'reset' then
    if p_week is not null or p_version is not null then raise exception 'Invalid reset' using errcode = '22023'; end if;
    select jsonb_agg(to_jsonb(t) order by t.week_number) into v_before from public.student_progress t where student_id = s.id;
    update public.profiles set progress_generation = progress_generation + 1,
      is_course_completed = false, course_completed_at = null where id = s.id;
    update public.student_progress set
      status = case when week_number = 1 then 'In Progress'::public.shelterlab_progress_status else 'Locked'::public.shelterlab_progress_status end,
      version = version + 1, submitted_at = null, reviewed_at = null, reviewed_by = null,
      feedback = '', answers = null, question_set = null where student_id = s.id;
  else
    if p_week is null or p_week not between 1 and 6 then raise exception 'Invalid week' using errcode = '22023'; end if;
    select * into w from public.student_progress where student_id = s.id and week_number = p_week for update;
    if p_version is distinct from w.version then raise exception 'Stale progress' using errcode = '40001'; end if;
    -- Count predecessors, not just non-completed rows: missing rows also fail closed.
    if (select count(*) from public.student_progress where student_id = s.id
        and week_number < p_week and status = 'Completed') <> p_week - 1 then
      raise exception 'Previous weeks are not completed' using errcode = '23514';
    end if;
    if p_action = 'submit' then
      if w.status <> 'In Progress' then raise exception 'Week cannot be submitted' using errcode = '23514'; end if;
      if p_answers is null or jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) <> 3
        or p_question_set is null or jsonb_typeof(p_question_set -> 'questions') is distinct from 'array'
        or jsonb_typeof(p_question_set -> 'cases') is distinct from 'array' then
        raise exception 'Invalid answers' using errcode = '22023';
      end if;
      if jsonb_array_length(p_question_set -> 'questions') <> 3
        or jsonb_array_length(p_question_set -> 'cases') not between 2 and 4
        or (p_question_set ->> 'week')::integer is distinct from p_week
        or (select count(distinct x ->> 'questionId') from jsonb_array_elements(p_answers) x
          where x ->> 'questionId' in ('compare','limits','causality')) <> 3 then
        raise exception 'Invalid answers' using errcode = '22023';
      end if;
      for a in select * from jsonb_array_elements(p_answers) loop
        if jsonb_typeof(a -> 'text') is distinct from 'string' or char_length(btrim(a ->> 'text')) not between 10 and 3000
          or jsonb_typeof(a -> 'selectedAnimalIds') is distinct from 'array' then
          raise exception 'Invalid answers' using errcode = '22023';
        end if;
        if jsonb_array_length(a -> 'selectedAnimalIds') not between (case when a ->> 'questionId' = 'compare' then 2 else 1 end) and 4
          or (select count(distinct value) from jsonb_array_elements_text(a -> 'selectedAnimalIds')) <> jsonb_array_length(a -> 'selectedAnimalIds')
          or exists (select 1 from jsonb_array_elements_text(a -> 'selectedAnimalIds') selected
            where not exists (select 1 from jsonb_array_elements(p_question_set -> 'cases') c where c ->> 'id' = selected.value)) then
          raise exception 'Invalid case references' using errcode = '22023';
        end if;
      end loop;
      update public.student_progress set status = 'Pending', submitted_at = now(),
        reviewed_at = null, reviewed_by = null, feedback = '', version = version + 1,
        question_set = p_question_set, answers = p_answers where student_id = s.id and week_number = p_week;
    else
      if w.status <> 'Pending' then raise exception 'Only pending work can be approved' using errcode = '23514'; end if;
      if p_feedback is null or char_length(p_feedback) > 3000 then raise exception 'Invalid feedback' using errcode = '22023'; end if;
      update public.student_progress set status = 'Completed', reviewed_at = now(), reviewed_by = auth.uid(),
        feedback = p_feedback, version = version + 1 where student_id = s.id and week_number = p_week;
      if p_week < 6 then
        update public.student_progress set status = 'In Progress', version = version + 1
          where student_id = s.id and week_number = p_week + 1 and status = 'Locked';
        if not found then raise exception 'Next week is not locked' using errcode = '23514'; end if;
      else
        update public.profiles set is_course_completed = true, course_completed_at = now() where id = s.id;
      end if;
    end if;
  end if;
  insert into public.progress_audit(student_id, actor_id, week_number, action, generation, details)
  values (s.id, auth.uid(), p_week, p_action, s.progress_generation + case when p_action = 'reset' then 1 else 0 end,
    jsonb_build_object('feedback', p_feedback, 'previous_version', p_version, 'previous_progress', v_before));
end;
$$;

-- The complete requested roster is reset in ONE transaction, never partial loops in HTTP.
create function public.shelterlab_reset_class_progress(p_class_id uuid, p_targets jsonb)
returns integer language plpgsql security definer set search_path = '' as $$
declare t jsonb; n integer := 0;
begin
  if not public.shelterlab_teaches(p_class_id) then raise exception 'Not authorized' using errcode = '42501'; end if;
  if p_targets is null or jsonb_typeof(p_targets) <> 'array' or jsonb_array_length(p_targets) not between 1 and 200 then
    raise exception 'Invalid reset targets' using errcode = '22023';
  end if;
  if (select count(distinct x ->> 'studentId') from jsonb_array_elements(p_targets) x) <> jsonb_array_length(p_targets) then
    raise exception 'Duplicate targets' using errcode = '22023';
  end if;
  -- A stable lock order also prevents deadlocks between two whole-class resets.
  for t in select value from jsonb_array_elements(p_targets) order by value ->> 'studentId' loop
    perform 1 from public.profiles where id = (t ->> 'studentId')::uuid and class_id = p_class_id and role = 'student' for update;
    if not found then raise exception 'Not authorized' using errcode = '42501'; end if;
    perform public.shelterlab_progress_action((t ->> 'studentId')::uuid, null, 'reset', (t ->> 'generation')::integer, null);
    n := n + 1;
  end loop;
  return n;
end;
$$;

create function public.shelterlab_save_class(p_class_id uuid, p_school_id text, p_school_name text, p_county text, p_grade text, p_student_count integer)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not exists(select 1 from public.profiles where id = auth.uid() and role = 'teacher') then
    raise exception 'Not authorized' using errcode = '42501'; end if;
  if coalesce(char_length(p_school_id),0) not between 1 and 40 or coalesce(char_length(p_school_name),0) not between 1 and 100
    or coalesce(char_length(p_county),0) not between 1 and 10 or p_grade is null or p_grade not in ('高一','高二','高三')
    or p_student_count is null or p_student_count not between 1 and 200 then raise exception 'Invalid settings' using errcode = '22023'; end if;
  if p_class_id is null then
    insert into public.classes(name, class_code, teacher_id, school_id, school_name, county, grade, student_count)
    values (left(p_school_name || ' ' || p_grade,100), upper(replace(gen_random_uuid()::text,'-','')), auth.uid(), p_school_id,p_school_name,p_county,p_grade,p_student_count)
    returning id into v_id;
  else
    perform 1 from public.classes where id = p_class_id and teacher_id = auth.uid() for update;
    if not found then raise exception 'Not authorized' using errcode = '42501'; end if;
    if (select count(*) from public.profiles where class_id = p_class_id) > p_student_count then
      raise exception 'Class capacity below enrollment' using errcode = '23514'; end if;
    if exists(select 1 from public.profiles where class_id = p_class_id) and exists(
      select 1 from public.classes where id = p_class_id and school_id is not null and school_id <> p_school_id) then
      raise exception 'Cannot change enrolled school' using errcode = '23514'; end if;
    update public.classes set school_id=p_school_id,school_name=p_school_name,county=p_county,grade=p_grade,student_count=p_student_count where id=p_class_id;
    v_id := p_class_id;
  end if;
  return v_id;
end;
$$;
revoke all on function public.shelterlab_progress_action(uuid,smallint,text,integer,integer,text,jsonb,jsonb),
  public.shelterlab_reset_class_progress(uuid,jsonb), public.shelterlab_save_class(uuid,text,text,text,text,integer) from public, anon;
grant execute on function public.shelterlab_progress_action(uuid,smallint,text,integer,integer,text,jsonb,jsonb),
  public.shelterlab_reset_class_progress(uuid,jsonb), public.shelterlab_save_class(uuid,text,text,text,text,integer) to authenticated;
-- Preserve read policies and explicitly prohibit bypassing the guarded RPC writes.
revoke insert, update, delete on public.student_progress, public.progress_audit, public.classes from authenticated;
revoke update on public.profiles from authenticated;
grant update(display_name) on public.profiles to authenticated;
notify pgrst, 'reload schema';
commit;
