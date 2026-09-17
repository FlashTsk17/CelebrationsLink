-- CélébrationsLink · Music Storage foundation
-- Creates a private bucket for user-uploaded celebration audio.
-- Public playback is intentionally handled through signed URLs from the app/service layer.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'celebration-music',
  'celebration-music',
  false,
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

-- Authenticated members may upload only inside their own user directory.
drop policy if exists "members can upload celebration music" on storage.objects;
create policy "members can upload celebration music"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'celebration-music'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Members may read/manage only their own uploaded files.
drop policy if exists "members can read celebration music" on storage.objects;
create policy "members can read celebration music"
on storage.objects for select
to authenticated
using (
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
