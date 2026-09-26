-- Archive successful teacher feedback and clear the live revision message on approval.
begin;

alter table public.student_progress
  drop constraint if exists student_progress_feedback_check;
alter table public.student_progress
  add constraint student_progress_feedback_check check (char_length(feedback) <= 12000),
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
      feedback = p_feedback, version = version + 1
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
    jsonb_build_object('feedback', p_feedback, 'previous_version', p_version));
end;
$$;

revoke all on function public.shelterlab_review_progress(uuid,smallint,text,integer,integer,text) from public, anon;
grant execute on function public.shelterlab_review_progress(uuid,smallint,text,integer,integer,text) to authenticated;

notify pgrst, 'reload schema';
commit;
