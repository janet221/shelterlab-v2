-- ShelterLab: Supabase Auth / class / six-week progress foundation.
-- Run ONCE as postgres in Supabase SQL Editor, after reviewing existing tables.
-- This is additive to the existing Prisma app_user / learning_* models.
-- It does not migrate existing users, sessions, answers or learning history.
begin;

create type public.shelterlab_role as enum ('student', 'teacher', 'shelter');
create type public.shelterlab_progress_status as enum
  ('Locked', 'In Progress', 'Pending', 'Completed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.shelterlab_role not null default 'student',
  display_name text not null default '' check (char_length(display_name) <= 100),
  class_id uuid,
  progress_generation integer not null default 0 check (progress_generation >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_requires_class check (
    (role = 'student' and class_id is not null) or
    (role <> 'student' and class_id is null)
  ),
  unique (id, role)
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  class_code text not null unique check (
    class_code = upper(btrim(class_code)) and
    class_code ~ '^[A-Z0-9][A-Z0-9-]{7,63}$'
  ),
  teacher_id uuid not null,
  -- Composite FK enforces teacher role even for privileged database writes.
  teacher_role public.shelterlab_role not null default 'teacher'
    check (teacher_role = 'teacher'),
  registration_open boolean not null default true,
  registration_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (teacher_id, teacher_role) references public.profiles(id, role)
    on delete restrict
);
alter table public.profiles add constraint profiles_class_fk
  foreign key (class_id) references public.classes(id) on delete restrict;
create index profiles_class_idx on public.profiles(class_id);
create index classes_teacher_idx on public.classes(teacher_id);

-- One row per student/week. Question-level answers/reviews belong in a later
-- migration; never equate a weekly approval here with per-question approval.
create table public.student_progress (
  student_id uuid not null,
  student_role public.shelterlab_role not null default 'student'
    check (student_role = 'student'),
  week_number smallint not null check (week_number between 1 and 6),
  status public.shelterlab_progress_status not null default 'Locked',
  version integer not null default 0 check (version >= 0),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete restrict,
  feedback text not null default '' check (char_length(feedback) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (student_id, week_number),
  foreign key (student_id, student_role) references public.profiles(id, role)
    on delete cascade,
  check ((reviewed_at is null) = (reviewed_by is null)),
  check (status not in ('Pending', 'Completed') or submitted_at is not null),
  check (status <> 'Completed' or reviewed_at is not null)
);
create index progress_pending_idx on public.student_progress(student_id, submitted_at)
  where status = 'Pending';

-- Audit survives a progress reset. Account deletion deletes that student's log.
create table public.progress_audit (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete restrict,
  week_number smallint check (week_number between 1 and 6),
  action text not null check (action in ('submit', 'approve', 'return', 'reset')),
  generation integer not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index progress_audit_student_idx on public.progress_audit(student_id, created_at);

create function public.shelterlab_touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end;
$$;
create trigger profiles_updated before update on public.profiles
  for each row execute function public.shelterlab_touch_updated_at();
create trigger classes_updated before update on public.classes
  for each row execute function public.shelterlab_touch_updated_at();
create trigger progress_updated before update on public.student_progress
  for each row execute function public.shelterlab_touch_updated_at();

-- SECURITY DEFINER avoids recursive RLS between classes and profiles.
-- No caller-supplied actor ID; always use the verified JWT's auth.uid().
create function public.shelterlab_teaches(p_class_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.classes c join public.profiles t on t.id = c.teacher_id
    where c.id = p_class_id and t.id = auth.uid() and t.role = 'teacher'
  );
$$;
create function public.shelterlab_can_read_student(p_student_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select p_student_id = auth.uid() or exists (
    select 1 from public.profiles s
    where s.id = p_student_id and s.role = 'student'
      and public.shelterlab_teaches(s.class_id)
  );
$$;

-- Server-side preflight only. Call through a rate-limited signup endpoint using
-- a server-only service key. Never expose all class codes to anonymous clients.
create function public.shelterlab_validate_class_code(p_code text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.classes c
    where c.class_code = upper(btrim(p_code)) and c.registration_open
      and (c.registration_expires_at is null or c.registration_expires_at > now()));
$$;

-- Runs inside the auth.users INSERT transaction. Invalid code raises an error,
-- rolling back BOTH the Auth user and its profile; direct signUp cannot bypass it.
-- Public user_metadata.role / teacher_id / class_id are deliberately ignored.
-- Staff provisioning: Admin API createUser with app_metadata.shelterlab_role.
create function public.shelterlab_on_auth_user_created() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_role public.shelterlab_role := 'student';
  v_class uuid;
begin
  if new.raw_app_meta_data ->> 'shelterlab_role' in ('teacher', 'shelter') then
    v_role := (new.raw_app_meta_data ->> 'shelterlab_role')::public.shelterlab_role;
  end if;
  if v_role = 'student' then
    select c.id into v_class from public.classes c
      where c.class_code = upper(btrim(new.raw_user_meta_data ->> 'class_code'))
        and c.registration_open
        and (c.registration_expires_at is null or c.registration_expires_at > now())
      for share;
    if v_class is null then
      raise exception 'Invalid or expired class code' using errcode = '23514';
    end if;
  end if;
  insert into public.profiles(id, role, display_name, class_id)
  values (
    new.id,
    v_role,
    left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''), nullif(split_part(new.email, '@', 1), ''), '學生'), 100),
    v_class
  );
  if v_role = 'student' then
    insert into public.student_progress(student_id, week_number, status)
    select new.id, w, case when w = 1 then 'In Progress'::public.shelterlab_progress_status
      else 'Locked'::public.shelterlab_progress_status end
    from generate_series(1, 6) w;
  end if;
  return new;
end;
$$;
create trigger shelterlab_auth_user_created after insert on auth.users
  for each row execute function public.shelterlab_on_auth_user_created();

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.student_progress enable row level security;
alter table public.progress_audit enable row level security;

revoke all on public.profiles, public.classes, public.student_progress,
  public.progress_audit from public, anon, authenticated;
grant select on public.profiles, public.classes, public.student_progress,
  public.progress_audit to authenticated;
grant update (display_name) on public.profiles to authenticated;
-- Trusted administration/provisioning only; service_role bypasses RLS.
grant all on public.profiles, public.classes, public.student_progress,
  public.progress_audit to service_role;

create policy profiles_read on public.profiles for select to authenticated
  using (id = (select auth.uid()) or
    (role = 'student' and public.shelterlab_teaches(class_id)));
create policy profiles_edit_name on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy classes_read on public.classes for select to authenticated
  using (public.shelterlab_teaches(id) or exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and p.class_id = classes.id
  ));
create policy progress_read on public.student_progress for select to authenticated
  using (public.shelterlab_can_read_student(student_id));
create policy audit_read on public.progress_audit for select to authenticated
  using (public.shelterlab_can_read_student(student_id));

-- All progress writes use this guarded RPC. The profile lock serializes submit,
-- review and reset for one student. generation + version reject stale UI requests.
create function public.shelterlab_progress_action(
  p_student_id uuid, p_week smallint, p_action text,
  p_generation integer, p_version integer, p_feedback text default ''
) returns void language plpgsql security definer set search_path = '' as $$
declare
  v_student public.profiles%rowtype;
  v_progress public.student_progress%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select * into v_student from public.profiles where id = p_student_id for update;
  if not found or v_student.role <> 'student' then raise exception 'Not authorized' using errcode = '42501'; end if;
  if p_action = 'submit' then
    if p_student_id <> auth.uid() then raise exception 'Not authorized' using errcode = '42501'; end if;
  elsif p_action in ('approve', 'return', 'reset') then
    if not public.shelterlab_teaches(v_student.class_id) then raise exception 'Not authorized' using errcode = '42501'; end if;
  else raise exception 'Invalid action';
  end if;
  if p_generation is distinct from v_student.progress_generation then raise exception 'Stale generation; reload progress'; end if;
  if p_action = 'reset' then
    if p_week is not null or p_version is not null then raise exception 'Reset requires null week and version'; end if;
    update public.profiles set progress_generation = progress_generation + 1 where id = p_student_id;
    update public.student_progress set
      status = case when week_number = 1 then 'In Progress'::public.shelterlab_progress_status
        else 'Locked'::public.shelterlab_progress_status end,
      version = version + 1, submitted_at = null, reviewed_at = null, reviewed_by = null, feedback = ''
      where student_id = p_student_id;
  else
    select * into v_progress from public.student_progress
      where student_id = p_student_id and week_number = p_week for update;
    if not found then raise exception 'Unknown week'; end if;
    if p_version is distinct from v_progress.version then raise exception 'Stale version; reload progress'; end if;
    if p_action = 'submit' then
      if v_progress.status <> 'In Progress' or exists (
        select 1 from public.student_progress where student_id = p_student_id
          and week_number < p_week and status <> 'Completed'
      ) then raise exception 'Week cannot be submitted'; end if;
      update public.student_progress set status = 'Pending', submitted_at = now(),
        reviewed_at = null, reviewed_by = null, feedback = '', version = version + 1
        where student_id = p_student_id and week_number = p_week;
    else
      if v_progress.status <> 'Pending' then raise exception 'Only pending work can be reviewed'; end if;
      update public.student_progress set
        status = case when p_action = 'approve' then 'Completed'::public.shelterlab_progress_status
          else 'In Progress'::public.shelterlab_progress_status end,
        reviewed_at = now(), reviewed_by = auth.uid(), feedback = coalesce(p_feedback, ''), version = version + 1
        where student_id = p_student_id and week_number = p_week;
      if p_action = 'approve' then
        update public.student_progress set status = 'In Progress', version = version + 1
          where student_id = p_student_id and week_number = p_week + 1 and status = 'Locked';
      end if;
    end if;
  end if;
  insert into public.progress_audit(student_id, actor_id, week_number, action, generation, details)
  values (p_student_id, auth.uid(), p_week, p_action,
    v_student.progress_generation + case when p_action = 'reset' then 1 else 0 end,
    jsonb_build_object('feedback', coalesce(p_feedback, ''), 'previous_version', p_version));
end;
$$;

-- Functions default to PUBLIC EXECUTE in PostgreSQL: explicitly close them.
revoke all on function public.shelterlab_touch_updated_at() from public, anon, authenticated;
revoke all on function public.shelterlab_on_auth_user_created() from public, anon, authenticated;
revoke all on function public.shelterlab_teaches(uuid) from public, anon, authenticated;
revoke all on function public.shelterlab_can_read_student(uuid) from public, anon, authenticated;
revoke all on function public.shelterlab_validate_class_code(text) from public, anon, authenticated;
revoke all on function public.shelterlab_progress_action(uuid,smallint,text,integer,integer,text)
  from public, anon, authenticated;
grant execute on function public.shelterlab_teaches(uuid),
  public.shelterlab_can_read_student(uuid) to authenticated;
grant execute on function public.shelterlab_validate_class_code(text) to service_role;
grant execute on function public.shelterlab_progress_action(uuid,smallint,text,integer,integer,text)
  to authenticated;
commit;
