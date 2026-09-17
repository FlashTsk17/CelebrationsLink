-- CélébrationsLink · Music Storage foundation
-- Public playback for published celebrations; uploads remain member-owned.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'celebration-music',
  'celebration-music',
  true,
  15728640,
  array[
    'audio/mpeg',
    'audio/mp4',
    'audio/wav',
    'audio/x-wav',
    'audio/ogg',
    'audio/webm',
    'audio/aac'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public pages must be able to read media attached to published celebrations.
drop policy if exists "public can read celebration music" on storage.objects;
create policy "public can read celebration music"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'celebration-music');

-- Authenticated members may upload only inside their own user directory.
drop policy if exists "members can upload celebration music" on storage.objects;
create policy "members can upload celebration music"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'celebration-music'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "members can update celebration music" on storage.objects;
create policy "members can update celebration music"
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

drop policy if exists "members can delete celebration music" on storage.objects;
create policy "members can delete celebration music"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'celebration-music'
  and (storage.foldername(name))[1] = auth.uid()::text
);
