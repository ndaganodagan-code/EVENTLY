-- Google sign-in: Google gives us the person's real name, which Evently never shows.
-- Accounts made with Google start with a placeholder name, hidden attendance, and a
-- flag that makes the site ask them to choose a party name.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(new.raw_app_meta_data ->> 'provider', 'email') = 'email' then
    insert into profiles (id, name, email, city, interests)
    values (
      new.id,
      coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)),
      new.email,
      coalesce(new.raw_user_meta_data ->> 'city', ''),
      coalesce(array(select jsonb_array_elements_text(new.raw_user_meta_data -> 'interests')), '{}')
    );
  else
    insert into profiles (id, name, email, public_attendance, prefs)
    values (new.id, 'New member', new.email, false, '{"needsPartyName": true}');
  end if;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
