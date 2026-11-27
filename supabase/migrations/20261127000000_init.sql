-- Evently database, phase 1.
-- Evently never sells tickets: events only store links to official external sellers.
-- Run this once in Supabase (SQL Editor, or `supabase db push`).

-- ---------- Accounts ----------
create type public.user_role as enum ('member', 'organizer', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  role public.user_role not null default 'member',
  interests text[] not null default '{}',
  suspended boolean not null default false,
  created_at timestamptz not null default now()
);

-- True when the signed-in user is an active admin. Used by the policies below.
create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin' and not suspended);
$$;

-- Make a profile row for every new sign-up.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Members may edit their own name and interests, never their role or suspension.
create function public.protect_profile_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() is null in the SQL Editor, so the owner can still appoint the first admin there.
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
    new.suspended := old.suspended;
  end if;
  return new;
end;
$$;
create trigger protect_profile_fields before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- ---------- Catalogue ----------
create table public.categories (
  id text primary key,
  name text not null,
  blurb text not null default '',
  virtual boolean not null default false,
  hidden boolean not null default false,
  sort int not null default 0
);

create table public.venues (
  name text primary key,
  area text not null default '',
  lat double precision,
  lng double precision
);

create type public.event_verify as enum ('verified', 'partial', 'demo', 'organizer');
create type public.event_status as enum ('scheduled', 'postponed', 'cancelled');
create type public.review_state as enum ('pending', 'approved', 'rejected');

create table public.events (
  slug text primary key,
  title text not null,
  cat text not null references public.categories (id),
  tags text[] not null default '{}',
  artists text[] not null default '{}',
  start_at timestamptz not null,
  end_at timestamptz,
  time_tbc boolean not null default false,
  recurring text,
  venue text not null,
  city text not null default 'Kampala',
  price jsonb not null default '{}',          -- {from, free, note}
  organizer text not null default '',
  description text not null default '',
  sources jsonb not null default '[]',        -- [{name, url}]
  tickets jsonb,                              -- {url, site, note}: external seller only
  tickets_note text,
  poster_path text,                           -- path in the "posters" storage bucket
  verify public.event_verify not null default 'organizer',
  status public.event_status not null default 'scheduled',
  status_note text,
  community boolean not null default false,
  featured boolean not null default false,
  base_score int not null default 0,
  review public.review_state not null default 'pending',
  review_note text,
  submitted_by uuid references public.profiles (id) on delete set null,
  added date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index events_start_idx on public.events (start_at);
create index events_cat_idx on public.events (cat);

create table public.deals (
  id text primary key default gen_random_uuid()::text,
  event_slug text references public.events (slug) on delete cascade,
  kind text not null,
  title text not null,
  description text not null default '',
  until timestamptz,
  until_note text,
  source text,
  verify public.event_verify not null default 'organizer'
);

-- ---------- What members do ----------
create table public.saves (
  user_id uuid references public.profiles (id) on delete cascade,
  event_slug text references public.events (slug) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_slug)
);

create type public.attend_kind as enum ('going', 'interested');
create table public.attendance (
  user_id uuid references public.profiles (id) on delete cascade,
  event_slug text references public.events (slug) on delete cascade,
  kind public.attend_kind not null,
  created_at timestamptz not null default now(),
  primary key (user_id, event_slug)
);

create table public.follows (
  user_id uuid references public.profiles (id) on delete cascade,
  venue text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, venue)
);

create table public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null default '',
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.reports (
  id bigint generated always as identity primary key,
  event_slug text references public.events (slug) on delete cascade,
  reporter uuid references public.profiles (id) on delete set null,
  reason text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor uuid references public.profiles (id) on delete set null,
  action text not null,
  target text,
  created_at timestamptz not null default now()
);

-- Anonymous counts only: no personal data is stored for views and shares.
create table public.event_stats (
  event_slug text primary key references public.events (slug) on delete cascade,
  views int not null default 0,
  shares int not null default 0
);

create function public.bump_stat(slug text, field text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if field not in ('views', 'shares') then raise exception 'bad field'; end if;
  insert into event_stats (event_slug) values (slug) on conflict do nothing;
  execute format('update event_stats set %I = %I + 1 where event_slug = $1', field, field) using slug;
end;
$$;
grant execute on function public.bump_stat(text, text) to anon, authenticated;

-- Public counts of going / interested / saves per event.
create view public.event_counts with (security_invoker = false) as
  select e.slug,
    (select count(*) from attendance a where a.event_slug = e.slug and a.kind = 'going') as going,
    (select count(*) from attendance a where a.event_slug = e.slug and a.kind = 'interested') as interested,
    (select count(*) from saves s where s.event_slug = e.slug) as saves,
    coalesce(st.views, 0) as views,
    coalesce(st.shares, 0) as shares
  from events e left join event_stats st on st.event_slug = e.slug
  where e.review = 'approved';
grant select on public.event_counts to anon, authenticated;

-- ---------- Row level security ----------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.venues enable row level security;
alter table public.events enable row level security;
alter table public.deals enable row level security;
alter table public.saves enable row level security;
alter table public.attendance enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.audit_log enable row level security;
alter table public.event_stats enable row level security;

create policy "own profile or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "edit own profile or admin" on public.profiles for update using (id = auth.uid() or public.is_admin());

create policy "anyone reads categories" on public.categories for select using (true);
create policy "admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "anyone reads venues" on public.venues for select using (true);
create policy "admins manage venues" on public.venues for all using (public.is_admin()) with check (public.is_admin());

create policy "read approved, own or admin" on public.events for select
  using (review = 'approved' or submitted_by = auth.uid() or public.is_admin());
create policy "signed-in users submit for review" on public.events for insert
  with check (auth.uid() is not null and submitted_by = auth.uid() and review = 'pending' and verify = 'organizer' and not featured);
create policy "organizers edit own pending" on public.events for update
  using (submitted_by = auth.uid() and review = 'pending')
  with check (submitted_by = auth.uid() and review = 'pending' and verify = 'organizer' and not featured);
create policy "admins manage events" on public.events for all using (public.is_admin()) with check (public.is_admin());

create policy "anyone reads deals" on public.deals for select using (true);
create policy "admins manage deals" on public.deals for all using (public.is_admin()) with check (public.is_admin());

create policy "own saves" on public.saves for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own attendance" on public.attendance for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own follows" on public.follows for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "mark own read" on public.notifications for update using (user_id = auth.uid());
create policy "admins send notifications" on public.notifications for insert with check (public.is_admin());

create policy "signed-in users report" on public.reports for insert with check (auth.uid() is not null and reporter = auth.uid());
create policy "admins handle reports" on public.reports for all using (public.is_admin()) with check (public.is_admin());

create policy "admins read audit" on public.audit_log for select using (public.is_admin());
create policy "admins write audit" on public.audit_log for insert with check (public.is_admin() and actor = auth.uid());

create policy "anyone reads stats" on public.event_stats for select using (true);

-- ---------- Notify followers when an event at their place is approved ----------
create function public.notify_followers() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.review = 'approved' and (tg_op = 'INSERT' or old.review <> 'approved') then
    insert into notifications (user_id, title, body, link)
    select f.user_id, 'New at ' || new.venue, new.title, '#event/' || new.slug
    from follows f where f.venue = new.venue;
  end if;
  return new;
end;
$$;
create trigger notify_followers after insert or update of review on public.events
  for each row execute function public.notify_followers();

create function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;
create trigger events_touch before update on public.events
  for each row execute function public.touch_updated_at();

-- ---------- Poster storage ----------
insert into storage.buckets (id, name, public) values ('posters', 'posters', true)
  on conflict (id) do nothing;
create policy "anyone views posters" on storage.objects for select using (bucket_id = 'posters');
create policy "signed-in users upload posters" on storage.objects for insert
  with check (bucket_id = 'posters' and auth.uid() is not null and (storage.foldername(name))[1] = auth.uid()::text);
create policy "admins manage posters" on storage.objects for all
  using (bucket_id = 'posters' and public.is_admin()) with check (bucket_id = 'posters' and public.is_admin());
