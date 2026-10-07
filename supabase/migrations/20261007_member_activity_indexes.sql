-- CélébrationsLink · member activity indexes
-- Keep member history queries fast as usage grows.
create index if not exists events_owner_created_at_idx
  on public.events(owner_id, created_at desc);

create index if not exists celebrations_owner_created_at_idx
  on public.celebrations(owner_id, created_at desc);

create index if not exists guests_event_created_at_idx
  on public.guests(event_id, created_at desc);
