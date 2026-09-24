-- Store the complete six-week game interaction record for teacher review.
begin;

alter table public.student_progress add column if not exists game_audit jsonb;

create or replace function public.shelterlab_submit_game_audit(
  p_student_id uuid,
  p_week smallint,
  p_generation integer,
  p_version integer,
  p_game_audit jsonb
) returns void language plpgsql security definer set search_path = '' as $$
declare
  s public.profiles%rowtype;
  w public.student_progress%rowtype;
begin
  if auth.uid() is null or auth.uid() <> p_student_id then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  select * into s from public.profiles where id = p_student_id and role = 'student' for update;
  if not found or p_generation is distinct from s.progress_generation then
    raise exception 'Stale progress' using errcode = '40001';
  end if;
  if p_week is null or p_week not between 1 and 6 then
    raise exception 'Invalid week' using errcode = '22023';
  end if;
  select * into w from public.student_progress where student_id = p_student_id and week_number = p_week for update;
  if not found or w.status <> 'In Progress' or p_version is distinct from w.version then
    raise exception 'Week cannot be submitted' using errcode = '23514';
  end if;
  if (select count(*) from public.student_progress where student_id = p_student_id and week_number < p_week and status = 'Completed') <> p_week - 1 then
    raise exception 'Previous weeks are not completed' using errcode = '23514';
  end if;
  if p_game_audit is null or jsonb_typeof(p_game_audit) <> 'object'
    or (p_game_audit ->> 'version')::integer is distinct from 1
    or (p_game_audit ->> 'week')::integer is distinct from p_week
    or (p_game_audit ->> 'completed')::boolean is distinct from true
    or jsonb_typeof(p_game_audit -> 'entries') is distinct from 'array'
    or jsonb_array_length(p_game_audit -> 'entries') not between 1 and 500 then
    raise exception 'Invalid game audit' using errcode = '22023';
  end if;

  update public.student_progress set
    status = 'Pending', submitted_at = now(), reviewed_at = null, reviewed_by = null,
    feedback = '', version = version + 1, game_audit = p_game_audit,
    question_set = null, answers = null
  where student_id = p_student_id and week_number = p_week;

  insert into public.progress_audit(student_id, actor_id, week_number, action, generation, details)
  values (p_student_id, auth.uid(), p_week, 'submit', p_generation,
    jsonb_build_object('source', 'complete_week_game', 'previous_version', p_version,
      'entry_count', jsonb_array_length(p_game_audit -> 'entries')));
end;
$$;

create or replace function public.shelterlab_clear_game_audit_on_reset()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status = 'In Progress' and (old.status <> 'In Progress' or new.version > old.version) then
    new.game_audit = null;
  end if;
  return new;
end;
$$;

drop trigger if exists clear_game_audit_on_reset on public.student_progress;
create trigger clear_game_audit_on_reset before update on public.student_progress
for each row execute function public.shelterlab_clear_game_audit_on_reset();

revoke all on function public.shelterlab_submit_game_audit(uuid,smallint,integer,integer,jsonb) from public, anon;
grant execute on function public.shelterlab_submit_game_audit(uuid,smallint,integer,integer,jsonb) to authenticated;

notify pgrst, 'reload schema';
commit;
