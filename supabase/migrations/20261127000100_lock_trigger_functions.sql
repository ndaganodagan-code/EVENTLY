-- Trigger functions run on their own; nobody needs to call them through the API.
-- is_admin(), bump_stat() and event_counts() stay callable on purpose: the access rules
-- use is_admin() for every visitor, and the other two give anonymous counts.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.notify_followers() from public, anon, authenticated;
revoke execute on function public.protect_profile_fields() from public, anon, authenticated;
