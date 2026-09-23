begin;

drop function if exists public.shelterlab_save_class(uuid,text,text,text,text,integer);

create function public.shelterlab_save_class(
  p_class_id uuid,
  p_school_id text,
  p_school_name text,
  p_county text,
  p_grade text,
  p_student_count integer,
  p_class_code text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_class_code text := upper(btrim(p_class_code));
begin
  if not exists(select 1 from public.profiles where id = auth.uid() and role = 'teacher') then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if coalesce(char_length(p_school_id),0) not between 1 and 40
    or coalesce(char_length(p_school_name),0) not between 1 and 100
    or coalesce(char_length(p_county),0) not between 1 and 10
    or p_grade is null or p_grade not in ('高一','高二','高三')
    or p_student_count is null or p_student_count not between 1 and 200
    or v_class_code !~ '^[A-Z0-9][A-Z0-9-]{7,63}$' then
    raise exception 'Invalid settings' using errcode = '22023';
  end if;

  if p_class_id is null then
    insert into public.classes(name, class_code, teacher_id, school_id, school_name, county, grade, student_count)
    values (left(p_school_name || ' ' || p_grade,100), v_class_code, auth.uid(), p_school_id, p_school_name, p_county, p_grade, p_student_count)
    returning id into v_id;
  else
    perform 1 from public.classes where id = p_class_id and teacher_id = auth.uid() for update;
    if not found then raise exception 'Not authorized' using errcode = '42501'; end if;
    if (select count(*) from public.profiles where class_id = p_class_id) > p_student_count then
      raise exception 'Class capacity below enrollment' using errcode = '23514';
    end if;
    if exists(select 1 from public.profiles where class_id = p_class_id) and exists(
      select 1 from public.classes where id = p_class_id and school_id is not null and school_id <> p_school_id) then
      raise exception 'Cannot change enrolled school' using errcode = '23514';
    end if;
    update public.classes
      set school_id=p_school_id, school_name=p_school_name, county=p_county, grade=p_grade,
          student_count=p_student_count, class_code=v_class_code
      where id=p_class_id;
    v_id := p_class_id;
  end if;
  return v_id;
end;
$$;

revoke all on function public.shelterlab_save_class(uuid,text,text,text,text,integer,text) from public, anon;
grant execute on function public.shelterlab_save_class(uuid,text,text,text,text,integer,text) to authenticated;
notify pgrst, 'reload schema';
commit;
