create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null check (length(btrim(full_name)) > 0),
  phone text not null check (length(btrim(phone)) > 0),
  line1 text not null check (length(btrim(line1)) > 0),
  line2 text,
  city text not null check (length(btrim(city)) > 0),
  state text not null check (length(btrim(state)) > 0),
  postal_code text not null check (length(btrim(postal_code)) > 0),
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index addresses_one_default_per_user_idx
  on public.addresses (user_id)
  where is_default;

create index addresses_user_created_idx
  on public.addresses (user_id, created_at desc);

create trigger addresses_set_updated_at
before update on public.addresses
for each row execute function public.set_updated_at();

alter table public.addresses enable row level security;

revoke all on table public.addresses from public, anon, authenticated;
grant select, insert, update, delete on table public.addresses to authenticated;

create policy "Users can read their own addresses"
on public.addresses for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own addresses"
on public.addresses for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own addresses"
on public.addresses for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own addresses"
on public.addresses for delete
to authenticated
using ((select auth.uid()) = user_id);
