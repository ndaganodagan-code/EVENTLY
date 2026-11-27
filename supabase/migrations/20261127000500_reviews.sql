-- Ratings and reviews: members rate an event (1 to 5 stars, optional words)
-- once it has started. One review per member per event. Shown by party name.
create table public.reviews (
  id bigint generated always as identity primary key,
  event_slug text not null references public.events (slug) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  body text not null default '' check (char_length(body) <= 600),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_slug, user_id)
);
create index reviews_event_idx on public.reviews (event_slug);
alter table public.reviews enable row level security;
grant select, insert, update, delete on public.reviews to authenticated;

create or replace function public.can_review(event text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from events e where e.slug = event and e.review = 'approved' and not e.removed and e.start_at <= now())
     and exists (select 1 from profiles p where p.id = auth.uid() and not p.suspended);
$$;
grant execute on function public.can_review(text) to authenticated;

create policy "own reviews or admin" on public.reviews for select using (user_id = auth.uid() or public.is_admin());
create policy "review events that started" on public.reviews for insert to authenticated
  with check (user_id = auth.uid() and public.can_review(event_slug));
create policy "edit own review" on public.reviews for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid() and public.can_review(event_slug));
create policy "delete own review or admin" on public.reviews for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

create trigger reviews_touch before update on public.reviews
  for each row execute function public.touch_updated_at();

-- Public list for an event page: party name only, never email or real identity.
create or replace function public.event_reviews(event text)
returns table (id bigint, name text, stars smallint, body text, created_at timestamptz, went boolean, mine boolean)
language sql stable security definer set search_path = public as $$
  select r.id, p.name, r.stars, r.body, r.created_at,
         exists (select 1 from attendance a where a.user_id = r.user_id and a.event_slug = r.event_slug and a.kind = 'going'),
         r.user_id = auth.uid()
  from reviews r join profiles p on p.id = r.user_id
  where r.event_slug = event and not p.suspended
  order by (r.user_id = auth.uid()) desc, r.created_at desc limit 100;
$$;
grant execute on function public.event_reviews(text) to anon, authenticated;
