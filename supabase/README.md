# Evently database (Supabase)

This folder sets up the Evently back end in Supabase.

- `migrations/20261127000000_init.sql` creates the tables, the access rules and the poster storage.
- `seed.sql` loads the current real events, places, categories and deals. Demo content is left out.
- `make-seed.js` rebuilds `seed.sql` from `Evently/data.js` (`node supabase/make-seed.js`).

## Set it up by hand

1. In Supabase, open your project, then **SQL Editor**, then **New query**.
2. Paste all of `migrations/20261127000000_init.sql` and press **Run**.
3. Open a new query, paste all of `seed.sql` and press **Run**.
4. Sign up on the site once, then make yourself admin in a new query:

   ```sql
   update profiles set role = 'admin'
   where id = (select id from auth.users where email = 'YOUR EMAIL HERE');
   ```

## What the tables are for

| Table | Holds |
|---|---|
| profiles | One row per account: name, role (member, organizer, admin), interests, suspended |
| events | Every listing. Organizer submissions arrive as `review = 'pending'` until an admin approves them |
| categories, venues, deals | The catalogue the site shows |
| saves, attendance, follows | Favourites, going / interested, and followed places, per member |
| notifications | Messages to members, including "New at <place>" when an event at a followed place is approved |
| reports, audit_log | Reports from members, and a record of admin actions |
| event_stats, event_counts() | Anonymous view and share counts, plus public going / interested / saves totals |

## Access rules

- Anyone can read approved events, categories, places, deals and counts.
- Members can only see and change their own favourites, follows, attendance and notifications.
- Members cannot make themselves admin or mark their own events as verified.
- Organizer submissions stay hidden from the public until an admin approves them.
- Only admins can edit any event, suspend accounts, send notifications and read the audit log.
- Evently stores links to official ticket sellers only. It never stores payments.
