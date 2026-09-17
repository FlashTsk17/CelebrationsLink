-- CélébrationsLink · ownership and organizer security schema
-- Run after the initial schema in the Supabase SQL Editor.

-- Every authenticated organizer owns the events they create.
alter table public.events
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

create index if not exists events_owner_id_idx on public.events(owner_id);

-- Replace the broad public event policy with two explicit responsibilities:
-- public visitors can read published events, while organizers can read their own events.
drop policy if exists "public can read published events" on public.events;

create policy "public can read published events"
on public.events for select
to anon, authenticated
using (status = 'published' or owner_id = auth.uid());

-- Authenticated organizers may create events only for themselves.
drop policy if exists "authenticated can create own events" on public.events;

create policy "authenticated can create own events"
on public.events for insert
to authenticated
with check (owner_id = auth.uid());

-- Organizers may update or archive only their own events.
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

-- RSVP data stays private. Only the owner of the parent event can read it.
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

-- Public RSVP submission remains available without an account.
drop policy if exists "public can submit rsvp" on public.guests;

create policy "public can submit rsvp"
on public.guests for insert
to anon, authenticated
with check (
  exists (
    select 1 from public.events e
    where e.id = event_id
      and e.mode = 'invitation'
      and e.status = 'published'
  )
);

-- Organizers can update/delete their own RSVP records if needed later.
create policy "organizer can update own guests"
on public.guests for update
to authenticated
using (
  exists (
    select 1 from public.events e
    where e.id = guests.event_id
      and e.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.events e
    where e.id = guests.event_id
      and e.owner_id = auth.uid()
  )
);

create policy "organizer can delete own guests"
on public.guests for delete
to authenticated
using (
  exists (
    select 1 from public.events e
    where e.id = guests.event_id
      and e.owner_id = auth.uid()
  )
);

-- Important:
-- Existing events remain valid with owner_id = NULL.
-- They remain publicly readable while published, but are not manageable
-- through authenticated owner policies until explicitly claimed/migrated.
