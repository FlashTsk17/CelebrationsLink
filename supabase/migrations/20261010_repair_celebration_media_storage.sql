-- CélébrationsLink · Repair cloud photo storage policies
-- Idempotent correction for projects where the original media migration failed.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'celebration-media',
  'celebration-media',
  false,
  8388608,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can read celebration media" on storage.objects;
create policy "public can read celebration media"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'celebration-media'
  and exists (
    select 1
    from public.celebrations c
    where c.status = 'published'
      and c.photos @> jsonb_build_array(jsonb_build_object('storagePath', name))
  )
);

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
