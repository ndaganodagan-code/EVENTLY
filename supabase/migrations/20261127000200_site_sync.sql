-- Evently phase 1, part 2: what the website needs to keep accounts, submissions and admin work in Supabase.

-- ---------- Profiles carry what the account page shows ----------
alter table public.profiles
  add column email text,
  add column city text not null default '',
  add column public_attendance boolean not null default false,
  add column prefs jsonb not null default '{}';

update public.profiles p set email = u.email from auth.users u where u.id = p.id;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, name, email, city, interests)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'city', ''),
    coalesce(array(select jsonb_array_elements_text(new.raw_user_meta_data -> 'interests')), '{}')
  );
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ---------- Extra event fields organizers fill in ----------
alter table public.events
  add column contact text,
  add column booking text,
  add column website text,
  add column video_url text,
  add column deal jsonb,
  add column removed boolean not null default false;

-- Visitors never see removed events.
drop policy "read approved, own or admin" on public.events;
create policy "read approved, own or admin" on public.events for select
  using ((review = 'approved' and not removed) or submitted_by = auth.uid() or public.is_admin());

-- Organizers may edit their own events (pending or live). A guard keeps review,
-- verification, featuring and removal in admin hands; a rejected event goes back to pending.
drop policy "organizers edit own pending" on public.events;
create policy "organizers edit own events" on public.events for update
  using (submitted_by = auth.uid()) with check (submitted_by = auth.uid());
create policy "organizers withdraw own pending" on public.events for delete
  using (submitted_by = auth.uid() and review <> 'approved');

create function public.guard_event_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.review := case when old.review = 'rejected' then 'pending'::review_state else old.review end;
    new.review_note := case when old.review = 'rejected' then null else old.review_note end;
    new.verify := old.verify;
    new.featured := old.featured;
    new.removed := old.removed;
    new.base_score := old.base_score;
    new.submitted_by := old.submitted_by;
  end if;
  return new;
end;
$$;
create trigger guard_event_fields before update on public.events
  for each row execute function public.guard_event_fields();
revoke execute on function public.guard_event_fields() from public, anon, authenticated;

-- ---------- Server-side notifications ----------
-- Replaces the first version: tells the organizer about review decisions, followers of a place
-- about new events there, and people who saved or are going about cancellations and changes.
create or replace function public.notify_followers() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  link text := '#event-' || new.slug;
  when_txt text := to_char(new.start_at at time zone 'Africa/Kampala', 'Dy DD Mon, HH12:MI AM');
begin
  if new.review = 'approved' and (tg_op = 'INSERT' or old.review <> 'approved') then
    insert into notifications (user_id, title, body, link)
    select f.user_id, 'New at ' || new.venue, new.title || ', ' || when_txt || '.', link
    from follows f where f.venue = new.venue and f.user_id is distinct from new.submitted_by;
    if new.submitted_by is not null and tg_op = 'UPDATE' then
      insert into notifications (user_id, title, body, link)
      values (new.submitted_by, 'Event approved', 'Your event “' || new.title || '” was approved and is now live.', link);
    end if;
  end if;

  if tg_op = 'UPDATE' and new.review = 'rejected' and old.review <> 'rejected' and new.submitted_by is not null then
    insert into notifications (user_id, title, body, link)
    values (new.submitted_by, 'Changes needed', 'Your event “' || new.title || '” needs changes: ' || coalesce(new.review_note, ''), '#organizers');
  end if;

  if tg_op = 'UPDATE' and new.review = 'approved' then
    if new.status = 'cancelled' and old.status <> 'cancelled' then
      insert into notifications (user_id, title, body, link)
      select distinct x.user_id, 'Cancelled', new.title || ' has been cancelled. ' || coalesce(new.status_note, ''), link
      from (select user_id from saves where event_slug = new.slug union select user_id from attendance where event_slug = new.slug) x;
    elsif new.start_at <> old.start_at or new.venue <> old.venue then
      insert into notifications (user_id, title, body, link)
      select distinct x.user_id, 'Event changed', new.title || ' has changed: now ' || when_txt || ' at ' || new.venue || '.', link
      from (select user_id from saves where event_slug = new.slug union select user_id from attendance where event_slug = new.slug) x;
    end if;
  end if;
  return new;
end;
$$;
drop trigger notify_followers on public.events;
create trigger notify_followers after insert or update on public.events
  for each row execute function public.notify_followers();
revoke execute on function public.notify_followers() from public, anon, authenticated;

-- Members may delete their own notifications.
create policy "delete own notifications" on public.notifications for delete using (user_id = auth.uid());

-- Reports may come from visitors who aren't signed in (reporter left empty).
drop policy "signed-in users report" on public.reports;
alter table public.reports add column details text, add column kind text not null default 'report', add column contact text;
create policy "anyone reports" on public.reports for insert
  with check (reporter is null or reporter = auth.uid());

-- ---------- Account removal ----------
create function public.delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

create function public.admin_delete_user(target uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'admins only'; end if;
  if target = auth.uid() then raise exception 'use delete_my_account'; end if;
  delete from auth.users where id = target;
end;
$$;
revoke execute on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;
