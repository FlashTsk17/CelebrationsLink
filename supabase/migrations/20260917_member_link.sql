-- CélébrationsLink · Member/Auth linkage
-- Run in Supabase SQL Editor after the foundation schema.

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

alter table public.profiles enable row level security;

create or replace function public.handle_new_member()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do update
    set display_name = case
      when public.profiles.display_name = '' then excluded.display_name
      else public.profiles.display_name
    end,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_member();

create index if not exists events_owner_id_idx on public.events(owner_id);

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

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles for select to authenticated
using (id = auth.uid());

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Existing accountless events are intentionally left ownerless.
-- They can later be claimed through a dedicated secure token-exchange flow.
