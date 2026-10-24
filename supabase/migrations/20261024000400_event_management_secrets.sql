-- CélébrationsLink · Secure accountless event management
-- Management token hashes must never live on the public events row.

create table if not exists public.event_management_secrets (
  event_id uuid primary key references public.events(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

alter table public.event_management_secrets enable row level security;

-- This table is server-side only. No anon/authenticated policies are created.
revoke all on table public.event_management_secrets from anon, authenticated;
grant select, insert, update, delete on table public.event_management_secrets to service_role;

-- Preserve existing accountless management tokens during migration.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'events'
      and column_name = 'management_token_hash'
  ) then
    insert into public.event_management_secrets (event_id, token_hash)
    select id, management_token_hash
    from public.events
    where management_token_hash is not null
    on conflict (event_id) do nothing;
  end if;
end
$$;

alter table public.events drop column if exists management_token_hash;

create index if not exists event_management_secrets_token_hash_idx
  on public.event_management_secrets(token_hash);

comment on table public.event_management_secrets is
  'Private server-side storage for hashed accountless event management tokens.';
