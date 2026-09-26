-- Complete the weekly review loop: text-only revisions, approval milestones,
-- one-time reward celebrations, and strict next-week unlocking.
begin;

create table if not exists public.student_review_history (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  week_number smallint not null check (week_number between 1 and 6),
  generation integer not null check (generation >= 0),
  feedback text not null default '' check (char_length(feedback) <= 12000),
  reviewed_by uuid not null references public.profiles(id) on delete restrict,
  reviewed_at timestamptz not null default now(),
  unique (student_id, week_number, generation)
);
create index if not exists student_review_history_student_idx
  on public.student_review_history(student_id, reviewed_at desc);

create table if not exists public.student_reward_claims (
  student_id uuid not null references public.profiles(id) on delete cascade,
  week_number smallint not null check (week_number between 1 and 6),
  generation integer not null check (generation >= 0),
  earned_at timestamptz not null default now(),
  claimed_at timestamptz,
  primary key (student_id, week_number, generation)
);
create index if not exists student_reward_claims_pending_idx
  on public.student_reward_claims(student_id, earned_at)
  where claimed_at is null;

-- Existing completions predate the approval celebration workflow. Mark them as
-- already acknowledged so students only see a modal for future approvals.
insert into public.student_reward_claims(student_id, week_number, generation, earned_at, claimed_at)
select p.student_id, p.week_number, s.progress_generation,
  coalesce(p.reviewed_at, p.updated_at, now()), now()
from public.student_progress p
join public.profiles s on s.id = p.student_id
where p.status = 'Completed'
on conflict (student_id, week_number, generation) do nothing;

-- A returned submission remains the authoritative snapshot for revision. Only
-- a full reset (empty feedback and no reviewer) clears the stored game state.
create or replace function public.shelterlab_clear_game_audit_on_reset()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status = 'In Progress'
    and new.feedback = ''
    and new.reviewed_at is null
    and new.reviewed_by is null
    and (old.status <> 'In Progress' or new.version > old.version) then
    new.game_audit = null;
  end if;
  return new;
end;
$$;

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
  if (select count(*) from public.student_progress where student_id = p_student_id
      and week_number < p_week and status = 'Completed') <> p_week - 1 then
    raise exception 'Previous weeks are not completed' using errcode = '23514';
  end if;
  if p_game_audit is null or jsonb_typeof(p_game_audit) <> 'object'
    or (p_game_audit ->> 'version')::integer is distinct from 1
    or (p_game_audit ->> 'week')::integer is distinct from p_week
    or (p_game_audit ->> 'completed')::boolean is distinct from true
    or jsonb_typeof(p_game_audit -> 'entries') is distinct from 'array'
    or jsonb_array_length(p_game_audit -> 'entries') not between 1 and 500
    or not exists (
      select 1 from jsonb_array_elements(p_game_audit -> 'entries') entry
      where entry ->> 'kind' = 'text'
        and (entry ->> 'answered')::boolean is true
        and jsonb_array_length(entry -> 'answers') > 0
    ) then
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
    if char_length(btrim(p_feedback)) = 0 then
      raise exception 'Feedback required' using errcode = '22023';
    end if;
    update public.student_progress set
      status = 'In Progress', submitted_at = null, reviewed_at = now(), reviewed_by = auth.uid(),
      feedback = p_feedback, version = version + 1
    where student_id = p_student_id and week_number = p_week;
  else
    insert into public.student_review_history(
      student_id, week_number, generation, feedback, reviewed_by, reviewed_at
    ) values (
      p_student_id, p_week, p_generation, p_feedback, auth.uid(), now()
    )
    on conflict (student_id, week_number, generation) do update set
      feedback = excluded.feedback,
      reviewed_by = excluded.reviewed_by,
      reviewed_at = excluded.reviewed_at;

    -- The current-feedback slot is exclusively for actionable revision notes.
    -- Approval feedback lives in the immutable milestone history instead.
    update public.student_progress set
      status = 'Completed', reviewed_at = now(), reviewed_by = auth.uid(),
      feedback = '', version = version + 1
    where student_id = p_student_id and week_number = p_week;

    -- Once approved, prior rejection comments are no longer active drafts.
    delete from public.progress_audit
    where student_id = p_student_id and week_number = p_week
      and generation = p_generation and action = 'return';

    insert into public.student_reward_claims(student_id, week_number, generation, earned_at)
    values (p_student_id, p_week, p_generation, now())
    on conflict (student_id, week_number, generation) do nothing;

    if p_week < 6 then
      update public.student_progress set status = 'In Progress', version = version + 1
      where student_id = p_student_id and week_number = p_week + 1 and status = 'Locked';
      if not found then raise exception 'Next week is not locked' using errcode = '23514'; end if;
    else
      update public.profiles set is_course_completed = true, course_completed_at = now()
      where id = p_student_id;
    end if;
  end if;

  insert into public.progress_audit(student_id, actor_id, week_number, action, generation, details)
  values (p_student_id, auth.uid(), p_week,
    case when p_decision = 'reject' then 'return' else 'approve' end,
    p_generation, jsonb_build_object('feedback', p_feedback, 'previous_version', p_version));
end;
$$;

create or replace function public.shelterlab_claim_reward(p_week smallint)
returns void language plpgsql security definer set search_path = '' as $$
declare v_generation integer;
begin
  if auth.uid() is null or p_week is null or p_week not between 1 and 6 then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  select progress_generation into v_generation from public.profiles
  where id = auth.uid() and role = 'student' for update;
  if not found then raise exception 'Not authorized' using errcode = '42501'; end if;
  update public.student_reward_claims set claimed_at = coalesce(claimed_at, now())
  where student_id = auth.uid() and week_number = p_week
    and generation = v_generation and claimed_at is null;
  if not found then raise exception 'Reward is not available' using errcode = '23514'; end if;
end;
$$;

-- Resetting a course starts a new generation and removes old active UI state.
create or replace function public.shelterlab_clear_completion_records_on_reset()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.progress_generation > old.progress_generation then
    delete from public.student_review_history where student_id = new.id;
    delete from public.student_reward_claims where student_id = new.id;
  end if;
  return new;
end;
$$;
drop trigger if exists clear_completion_records_on_reset on public.profiles;
create trigger clear_completion_records_on_reset after update of progress_generation on public.profiles
for each row execute function public.shelterlab_clear_completion_records_on_reset();

alter table public.student_review_history enable row level security;
alter table public.student_reward_claims enable row level security;
revoke all on public.student_review_history, public.student_reward_claims from public, anon, authenticated;
grant select on public.student_review_history, public.student_reward_claims to authenticated;
grant all on public.student_review_history, public.student_reward_claims to service_role;

create policy student_review_history_read on public.student_review_history for select to authenticated
  using (public.shelterlab_can_read_student(student_id));
create policy student_reward_claims_read on public.student_reward_claims for select to authenticated
  using (student_id = (select auth.uid()));

revoke all on function public.shelterlab_submit_game_audit(uuid,smallint,integer,integer,jsonb),
  public.shelterlab_review_progress(uuid,smallint,text,integer,integer,text),
  public.shelterlab_claim_reward(smallint) from public, anon;
grant execute on function public.shelterlab_submit_game_audit(uuid,smallint,integer,integer,jsonb),
  public.shelterlab_review_progress(uuid,smallint,text,integer,integer,text),
  public.shelterlab_claim_reward(smallint) to authenticated;

notify pgrst, 'reload schema';
commit;
