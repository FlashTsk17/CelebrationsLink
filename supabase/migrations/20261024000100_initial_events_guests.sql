-- CélébrationsLink · initial database foundation
-- Base de données : première migration, avant les tables et politiques dépendantes.
-- Safe to re-run: tables/indexes/policies are created idempotently.
-- Do not place service-role secrets in frontend environment variables.

create extension if not exists pgcrypto;

-- Events / invitations / announcements.
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  mode text not null default 'invitation'
    check (mode in ('invitation', 'announcement')),
  type text not null default 'other',
  title text not null,
  description text not null default '',
  host text not null default '',
  date date,
  time text,
  location text not null default '',
  cover text not null default '',
  template text not null default 'default',
  status text not null default 'published'
    check (status in ('draft', 'published', 'closed', 'archived')),
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists events_slug_idx on public.events(slug);
create index if not exists events_owner_id_idx on public.events(owner_id);
create index if not exists events_status_idx on public.events(status);

-- Guest RSVP submissions. Public visitors can submit a response, but cannot
-- enumerate the guest list; the later security policy limits reads to owners.
create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  status text not null check (status in ('yes', 'maybe', 'no')),
  message text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists guests_event_id_idx on public.guests(event_id);
create index if not exists guests_created_at_idx on public.guests(created_at desc);

alter table public.events enable row level security;
alter table public.guests enable row level security;

-- Minimum secure policies. supabase/schema.sql and security_hardening migration
-- will replace/restate these policies with the full ownership rules.
drop policy if exists "public can read published events" on public.events;
create policy "public can read published events"
  on public.events for select
  to anon, authenticated
  using (status = 'published' or owner_id = auth.uid());

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

-- No public SELECT policy for guests: attendee lists remain private.
