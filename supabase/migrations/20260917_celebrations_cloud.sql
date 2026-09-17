-- CélébrationsLink · Cloud celebrations + persistent music references

create table if not exists public.celebrations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  occasion text not null default 'other',
  recipient text not null default '',
  sender text not null default '',
  title text not null default '',
  message text not null default '',
  photos jsonb not null default '[]'::jsonb,
  music jsonb,
  template text not null default 'classic',
  animations boolean not null default true,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.celebrations enable row level security;

drop policy if exists "public can read published celebrations" on public.celebrations;
create policy "public can read published celebrations"
on public.celebrations for select
using (status = 'published');

drop policy if exists "members can create own celebrations" on public.celebrations;
create policy "members can create own celebrations"
on public.celebrations for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "members can update own celebrations" on public.celebrations;
create policy "members can update own celebrations"
on public.celebrations for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "members can delete own celebrations" on public.celebrations;
create policy "members can delete own celebrations"
on public.celebrations for delete
to authenticated
using (owner_id = auth.uid());

create index if not exists celebrations_owner_id_idx on public.celebrations(owner_id);
create index if not exists celebrations_slug_idx on public.celebrations(slug);
