alter table public.shelter_volunteer_activities
  add column if not exists teacher_group_visit boolean not null default false;
