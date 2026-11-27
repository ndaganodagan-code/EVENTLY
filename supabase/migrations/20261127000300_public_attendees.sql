-- Names of people going to / interested in an event, for the "Who's going" list.
-- Only members who switched on "Show my attendance publicly" are listed; others count in the totals only.
create function public.public_attendees(event text)
returns table (name text, kind public.attend_kind)
language sql stable security definer set search_path = public as $$
  select p.name, a.kind
  from attendance a join profiles p on p.id = a.user_id
  where a.event_slug = event and p.public_attendance and not p.suspended
  order by a.kind, a.created_at
  limit 60;
$$;
grant execute on function public.public_attendees(text) to anon, authenticated;
