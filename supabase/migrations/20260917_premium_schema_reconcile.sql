-- CélébrationsLink · Premium schema reconciliation
-- Keep one canonical naming scheme for administrative audit fields.

alter table public.premium_requests
  add column if not exists reviewed_at timestamptz;

-- The foundation schema uses admin_notes and processed_by.
-- Remove temporary duplicate names introduced by an earlier hardening draft.
alter table public.premium_requests
  drop column if exists admin_note,
  drop column if exists reviewed_by;

comment on column public.premium_requests.admin_notes is
  'Internal administration notes for the Premium request.';
comment on column public.premium_requests.processed_by is
  'Authenticated administrator who last processed the request.';
comment on column public.premium_requests.reviewed_at is
  'Timestamp of the latest administrative review.';
