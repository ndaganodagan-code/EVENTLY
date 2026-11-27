-- Members sign up with a party name (stored in profiles.name), shown on events
-- they are going to. Show it by default; members can hide it in Account.
alter table public.profiles alter column public_attendance set default true;
