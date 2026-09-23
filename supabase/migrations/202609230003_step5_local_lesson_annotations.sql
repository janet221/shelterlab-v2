-- Step 5: persistent teacher annotations for zero-hallucination lesson lenses.
begin;

create table public.lesson_annotations (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  teacher_id uuid not null,
  teacher_role public.shelterlab_role not null default 'teacher' check (teacher_role = 'teacher'),
  lens_key text not null check (lens_key ~ '^[a-z0-9:_-]{1,160}$'),
  county text not null check (char_length(county) between 2 and 10),
  annotation text not null default '' check (char_length(annotation) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, lens_key),
  foreign key (teacher_id, teacher_role) references public.profiles(id, role) on delete restrict
);

create index lesson_annotations_class_idx on public.lesson_annotations(class_id, updated_at desc);
create trigger lesson_annotations_updated before update on public.lesson_annotations
  for each row execute function public.shelterlab_touch_updated_at();

alter table public.lesson_annotations enable row level security;
revoke all on public.lesson_annotations from public, anon, authenticated;
grant select on public.lesson_annotations to authenticated;
grant all on public.lesson_annotations to service_role;

create policy lesson_annotations_read on public.lesson_annotations for select to authenticated
using (
  public.shelterlab_teaches(class_id)
  or exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'student' and p.class_id = lesson_annotations.class_id
  )
);

create function public.shelterlab_save_lesson_annotation(
  p_class_id uuid,
  p_lens_key text,
  p_county text,
  p_annotation text
) returns public.lesson_annotations
language plpgsql security definer set search_path = '' as $$
declare saved public.lesson_annotations%rowtype;
begin
  if not public.shelterlab_teaches(p_class_id) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_lens_key is null or p_lens_key !~ '^[a-z0-9:_-]{1,160}$'
    or p_county is null or char_length(p_county) not between 2 and 10
    or p_annotation is null or char_length(p_annotation) > 2000 then
    raise exception 'Invalid annotation' using errcode = '22023';
  end if;
  insert into public.lesson_annotations(class_id, teacher_id, lens_key, county, annotation)
  values (p_class_id, auth.uid(), p_lens_key, p_county, p_annotation)
  on conflict (class_id, lens_key) do update set
    teacher_id = auth.uid(), county = excluded.county, annotation = excluded.annotation
  returning * into saved;
  return saved;
end;
$$;

revoke all on function public.shelterlab_save_lesson_annotation(uuid,text,text,text) from public, anon;
grant execute on function public.shelterlab_save_lesson_annotation(uuid,text,text,text) to authenticated;

notify pgrst, 'reload schema';
commit;
