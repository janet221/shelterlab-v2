-- Student identity anchor and the requested default classroom metadata.
begin;

alter table public.profiles
  add column if not exists real_name text not null default '' check (char_length(btrim(real_name)) <= 100),
  add column if not exists student_number text not null default '' check (
    char_length(btrim(student_number)) <= 40 and
    (student_number = '' or student_number ~ '^[A-Za-z0-9_-]+$')
  );

create unique index if not exists profiles_class_student_number_unique
  on public.profiles(class_id, student_number)
  where role = 'student' and student_number <> '';

grant update (real_name, student_number, display_name) on public.profiles to authenticated;

update public.classes
set school_id = '353301',
    school_name = '建國中學',
    county = '臺北市'
where class_code = 'SHELTER-TEST-0923';

notify pgrst, 'reload schema';
commit;
