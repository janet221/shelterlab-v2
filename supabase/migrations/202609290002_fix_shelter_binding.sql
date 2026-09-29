create or replace function public.bind_shelter_account(p_user_id uuid,p_code_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare v_shelter uuid;
begin
  select shelter_id into v_shelter from shelter_partnership_codes where id=p_code_id and used_at is null and(expires_at is null or expires_at>now()) for update;
  if v_shelter is null then raise exception 'invalid code'; end if;
  update profiles set role='shelter',class_id=null where id=p_user_id;
  insert into shelter_accounts(user_id,shelter_id) values(p_user_id,v_shelter) on conflict(user_id) do update set shelter_id=excluded.shelter_id;
  update shelter_partnership_codes set used_at=now(),used_by=p_user_id where id=p_code_id;
end $$;
revoke all on function public.bind_shelter_account(uuid,uuid) from public,anon,authenticated;
