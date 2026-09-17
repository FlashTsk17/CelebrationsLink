-- CélébrationsLink · V3.4 music persistence
-- Public playback for published celebrations; uploads remain member-owned.

insert into storage.buckets (id, name, public)
values ('celebration-music', 'celebration-music', true)
on conflict (id) do update set public = true;

drop policy if exists "public can read celebration music" on storage.objects;
create policy "public can read celebration music"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'celebration-music');

drop policy if exists "members can upload own celebration music" on storage.objects;
create policy "members can upload own celebration music"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'celebration-music'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "members can update own celebration music" on storage.objects;
create policy "members can update own celebration music"
on storage.objects for update
to authenticated
using (
  bucket_id = 'celebration-music'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'celebration-music'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "members can delete own celebration music" on storage.objects;
create policy "members can delete own celebration music"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'celebration-music'
  and (storage.foldername(name))[1] = auth.uid()::text
);
