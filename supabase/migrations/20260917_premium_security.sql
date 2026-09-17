-- Premium security hardening
-- Run after the foundation schema.

-- Profile creation is server-triggered from auth.users. Members may read their
-- own profile, but cannot change access_level or premium lifecycle fields.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Prevent members from self-upgrading by updating protected profile fields.
drop policy if exists "users can update own profile" on public.profiles;

-- Members can only create requests for themselves. Admin processing is server-side.
drop policy if exists "users can create own premium requests" on public.premium_requests;
create policy "users can create own premium requests"
on public.premium_requests for insert
to authenticated
with check (user_id = auth.uid());

-- A member can never update or delete a Premium request directly.
drop policy if exists "users can update own premium requests" on public.premium_requests;
drop policy if exists "users can delete own premium requests" on public.premium_requests;

-- Ensure the account can have at most one active/pending workflow at a time.
create unique index if not exists premium_requests_one_open_per_user_idx
on public.premium_requests(user_id)
where status in ('pending', 'contacted', 'payment_pending');
