create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  event_type text not null,
  event_date date,
  guests integer not null check (guests > 0),
  location text not null,
  notes text default '',
  status text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled','no_show')),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade
);

alter table public.bookings enable row level security;
alter table public.admin_users enable row level security;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists (select 1 from public.admin_users where id = auth.uid())
$$;

create policy "public booking enquiries" on public.bookings for insert to anon, authenticated with check (true);
create policy "admins manage bookings" on public.bookings for all to authenticated using (public.is_admin()) with check (public.is_admin());
