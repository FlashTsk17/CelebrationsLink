-- CélébrationsLink · E2 security hardening
-- Enforce RLS on all client-facing sensitive tables and remove self-service
-- mutation paths for protected membership data.

alter table public.events enable row level security;
alter table public.guests enable row level security;
alter table public.profiles enable row level security;
alter table public.premium_requests enable row level security;
alter table public.studio_requests enable row level security;

-- Events: public may only see published events; authenticated owners retain
-- private access to their own events.
drop policy if exists "public can read published events" on public.events;
create policy "public can read published events"
on public.events for select
to anon, authenticated
using (status = 'published' or owner_id = auth.uid());

drop policy if exists "authenticated can create own events" on public.events;
create policy "authenticated can create own events"
on public.events for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "authenticated can update own events" on public.events;
create policy "authenticated can update own events"
on public.events for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "authenticated can delete own events" on public.events;
create policy "authenticated can delete own events"
on public.events for delete
to authenticated
using (owner_id = auth.uid());

-- RSVP/guest records are private to the event owner. Guests can submit an RSVP
-- only to a published invitation, but cannot read other guests.
drop policy if exists "public can read guests" on public.guests;
drop policy if exists "organizer can read own guests" on public.guests;
create policy "organizer can read own guests"
on public.guests for select
to authenticated
using (
  exists (
    select 1
    from public.events e
    where e.id = guests.event_id
      and e.owner_id = auth.uid()
  )
);

drop policy if exists "public can submit rsvp" on public.guests;
create policy "public can submit rsvp"
on public.guests for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.events e
    where e.id = event_id
      and e.mode = 'invitation'
      and e.status = 'published'
  )
);

drop policy if exists "organizer can update own guests" on public.guests;
create policy "organizer can update own guests"
on public.guests for update
to authenticated
using (
  exists (
    select 1
    from public.events e
    where e.id = guests.event_id
      and e.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.events e
    where e.id = guests.event_id
      and e.owner_id = auth.uid()
  )
);

drop policy if exists "organizer can delete own guests" on public.guests;
create policy "organizer can delete own guests"
on public.guests for delete
to authenticated
using (
  exists (
    select 1
    from public.events e
    where e.id = guests.event_id
      and e.owner_id = auth.uid()
  )
);

-- Profiles: members can read themselves, but all profile mutations remain
-- server-side so access_level and Premium lifecycle fields cannot be forged.
drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "users can update own profile" on public.profiles;
drop policy if exists "users can insert own profile" on public.profiles;
drop policy if exists "users can delete own profile" on public.profiles;

-- Premium requests: members may create/read their own requests only.
drop policy if exists "users can create own premium requests" on public.premium_requests;
create policy "users can create own premium requests"
on public.premium_requests for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "users can read own premium requests" on public.premium_requests;
create policy "users can read own premium requests"
on public.premium_requests for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "users can update own premium requests" on public.premium_requests;
drop policy if exists "users can delete own premium requests" on public.premium_requests;

-- Studio requests are also private to their creator. Administrative access is
-- intentionally kept in trusted server-side tooling.
drop policy if exists "users can create studio requests" on public.studio_requests;
create policy "users can create studio requests"
on public.studio_requests for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "users can read own studio requests" on public.studio_requests;
create policy "users can read own studio requests"
on public.studio_requests for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "users can update own studio requests" on public.studio_requests;
drop policy if exists "users can delete own studio requests" on public.studio_requests;
