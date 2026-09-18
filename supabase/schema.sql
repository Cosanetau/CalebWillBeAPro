-- Run once in the Supabase SQL editor for this project.

create table if not exists public.cwbp_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  role text not null check (role in ('caleb', 'nutritionist'))
);

create table if not exists public.cwbp_state (
  id int primary key default 1 check (id = 1),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.cwbp_state (id, payload)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table public.cwbp_profiles enable row level security;
alter table public.cwbp_state enable row level security;

drop policy if exists cwbp_profiles_select on public.cwbp_profiles;
create policy cwbp_profiles_select
  on public.cwbp_profiles
  for select
  to authenticated
  using (true);

drop policy if exists cwbp_state_select on public.cwbp_state;
create policy cwbp_state_select
  on public.cwbp_state
  for select
  to authenticated
  using (true);

drop policy if exists cwbp_state_insert on public.cwbp_state;
create policy cwbp_state_insert
  on public.cwbp_state
  for insert
  to authenticated
  with check (true);

drop policy if exists cwbp_state_update on public.cwbp_state;
create policy cwbp_state_update
  on public.cwbp_state
  for update
  to authenticated
  using (true)
  with check (true);
