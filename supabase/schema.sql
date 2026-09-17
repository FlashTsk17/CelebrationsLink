-- CélébrationsLink · ownership, access levels and monetization foundation
-- Run after the initial schema in the Supabase SQL Editor.

-- Every authenticated organizer can own events. NULL keeps accountless creation possible
-- for the future secure management-token flow.
alter table public.events
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

create index if not exists events_owner_id_idx on public.events(owner_id);

-- User profile / access tier.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  access_level text not null default 'member' check (access_level in ('member', 'premium')),
  premium_status text not null default 'inactive' check (premium_status in ('inactive', 'pending', 'active', 'expired')),
  premium_activated_at timestamptz,
  premium_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_access_level_idx on public.profiles(access_level);

-- Premium requests are initiated by the member and validated manually by administration
-- until direct online payments are introduced.
create table if not exists public.premium_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  offer text not null default 'premium',
  status text not null default 'pending' check (status in ('pending', 'contacted', 'payment_pending', 'approved', 'rejected', 'cancelled')),
  customer_message text not null default '',
  admin_notes text not null default '',
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  processed_by uuid references auth.users(id) on delete set null
);

create index if not exists premium_requests_user_id_idx on public.premium_requests(user_id);
create index if not exists premium_requests_status_idx on public.premium_requests(status);

-- Studio is a separate professional-service channel, not an accreditation level.
create table if not exists public.studio_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null default '',
  phone text not null default '',
  event_type text not null default 'other',
  message text not null default '',
  source_context text not null default 'general',
  status text not null default 'new' check (status in ('new', 'contacted', 'in_progress', 'completed', 'closed')),
  admin_notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists studio_requests_status_idx on public.studio_requests(status);
create index if not exists studio_requests_user_id_idx on public.studio_requests(user_id);

alter table public.profiles enable row level security;
alter table public.premium_requests enable row level security;
alter table public.studio_requests enable row level security;

-- Replace the broad public event policy with explicit public + owner responsibilities.
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
    select 1 from public.events e
    where e.id = guests.event_id and e.owner_id = auth.uid()
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
    where e.id = event_id and e.mode = 'invitation' and e.status = 'published'
  )
);

create policy "organizer can update own guests"
on public.guests for update
to authenticated
using (
  exists (select 1 from public.events e where e.id = guests.event_id and e.owner_id = auth.uid())
)
with check (
  exists (select 1 from public.events e where e.id = guests.event_id and e.owner_id = auth.uid())
);

create policy "organizer can delete own guests"
on public.guests for delete
to authenticated
using (
  exists (select 1 from public.events e where e.id = guests.event_id and e.owner_id = auth.uid())
);

-- Members can read/update only their own profile.
drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles for select to authenticated
using (id = auth.uid());

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- A member can create and view their own Premium requests.
drop policy if exists "users can create own premium requests" on public.premium_requests;
create policy "users can create own premium requests"
on public.premium_requests for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "users can read own premium requests" on public.premium_requests;
create policy "users can read own premium requests"
on public.premium_requests for select to authenticated
using (user_id = auth.uid());

-- Studio requests may be submitted by a signed-in member. A future public/basic
-- Studio contact flow can use a controlled server endpoint without exposing admin data.
drop policy if exists "users can create studio requests" on public.studio_requests;
create policy "users can create studio requests"
on public.studio_requests for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "users can read own studio requests" on public.studio_requests;
create policy "users can read own studio requests"
on public.studio_requests for select to authenticated
using (user_id = auth.uid());

-- Important:
-- owner_id remains nullable: the product must support Basic users without accounts.
-- Accountless event creation/management must use the future secure server-side
-- management-token flow; never expose a raw management secret through RLS.
-- Premium activation is intentionally administrative/manual at launch.
-- CélébrationsLink Studio is a professional-service channel, not a user tier.
