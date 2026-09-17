-- CélébrationsLink · Premium hardening
-- Premium can only be activated by trusted server-side administration.

alter table public.profiles
  drop constraint if exists profiles_access_level_check;

alter table public.profiles
  add constraint profiles_access_level_check
  check (access_level in ('member', 'premium'));

alter table public.profiles enable row level security;

drop policy if exists "users can update own profile" on public.profiles;

-- Members can read their profile, but cannot self-promote or change Premium state.
drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

-- Keep the canonical schema names: admin_notes / processed_by.
alter table public.premium_requests
  add column if not exists admin_notes text not null default '',
  add column if not exists processed_by uuid references auth.users(id) on delete set null,
  add column if not exists processed_at timestamptz;

create unique index if not exists premium_requests_one_open_per_user
on public.premium_requests (user_id)
where status in ('pending', 'contacted', 'payment_pending');

-- Only the authenticated owner can create/read their own request.
drop policy if exists "users can create own premium requests" on public.premium_requests;
drop policy if exists "users can read own premium requests" on public.premium_requests;
create policy "users can create own premium requests"
on public.premium_requests for insert
to authenticated
with check (user_id = auth.uid());

create policy "users can read own premium requests"
on public.premium_requests for select
to authenticated
using (user_id = auth.uid());

-- No direct UPDATE/DELETE policy for members.
drop policy if exists "users can update own premium requests" on public.premium_requests;
drop policy if exists "users can delete own premium requests" on public.premium_requests;
