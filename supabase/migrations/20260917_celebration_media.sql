-- CélébrationsLink · V3.4 media persistence
-- Photos are stored in Supabase Storage for authenticated members.
-- Basic mode continues to work locally.

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
to anon, authenticated
using (status = 'published');

drop policy if exists "users can create own celebrations" on public.celebrations;
create policy "users can create own celebrations"
on public.celebrations for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "users can update own celebrations" on public.celebrations;
create policy "users can update own celebrations"
on public.celebrations for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "users can delete own celebrations" on public.celebrations;
create policy "users can delete own celebrations"
on public.celebrations for delete
to authenticated
using (owner_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('celebration-media', 'celebration-media', true)
on conflict (id) do update set public = true;

drop policy if exists "public can read celebration media" on storage.objects;
create policy "public can read celebration media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'celebration-media');

drop policy if exists "members can upload own celebration media" on storage.objects;
create policy "members can upload own celebration media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'celebration-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "members can update own celebration media" on storage.objects;
create policy "members can update own celebration media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'celebration-media'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'celebration-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "members can delete own celebration media" on storage.objects;
create policy "members can delete own celebration media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'celebration-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);
