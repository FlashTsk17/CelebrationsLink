-- CélébrationsLink · initial relational schema
-- Run this file in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  mode text not null check (mode in ('announcement', 'invitation')),
  type text not null,
  title text not null,
  description text not null default '',
  host text not null,
  date date,
  time time,
  location text not null default '',
  cover text not null default '',
  template text not null default 'default',
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  status text not null check (status in ('yes', 'maybe', 'no')),
  message text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists events_slug_idx on public.events(slug);
create index if not exists guests_event_id_idx on public.guests(event_id);
create index if not exists guests_event_status_idx on public.guests(event_id, status);

-- Public events must be readable through their public slug.
alter table public.events enable row level security;
alter table public.guests enable row level security;

create policy "public can read published events"
on public.events for select
using (status = 'published');

-- Guests may submit RSVP responses without an account.
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

-- RSVP information is intentionally not publicly readable.
-- Organizer dashboard read access will be added with authenticated ownership.
