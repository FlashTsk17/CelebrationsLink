create or replace function public.get_my_membership()
returns table (
  id uuid,
  display_name text,
  access_level text,
  premium_status text,
  premium_activated_at timestamptz,
  premium_expires_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id,
    p.display_name,
    case
      when p.access_level = 'premium'
       and p.premium_status = 'active'
       and p.premium_expires_at is not null
       and p.premium_expires_at <= now()
      then 'member'
      else p.access_level
    end as access_level,
    case
      when p.access_level = 'premium'
       and p.premium_status = 'active'
       and p.premium_expires_at is not null
       and p.premium_expires_at <= now()
      then 'expired'
      else p.premium_status
    end as premium_status,
    p.premium_activated_at,
    p.premium_expires_at
  from public.profiles p
  where p.id = auth.uid();
$$;

revoke all on function public.get_my_membership() from public;
grant execute on function public.get_my_membership() to authenticated;
