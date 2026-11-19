create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer'
    check (role in ('customer', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) > 0),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  image_url text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  name text not null check (length(btrim(name)) > 0),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '',
  fabric text,
  attributes jsonb not null default '{}'::jsonb
    check (jsonb_typeof(attributes) = 'object'),
  base_price numeric(10, 2) not null check (base_price >= 0),
  compare_at_price numeric(10, 2)
    check (compare_at_price is null or compare_at_price >= base_price),
  is_featured boolean not null default false,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  image_url text not null check (length(btrim(image_url)) > 0),
  alt_text text not null check (length(btrim(alt_text)) > 0),
  sort_order integer not null default 0 check (sort_order >= 0),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, sort_order)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text not null unique check (length(btrim(sku)) > 0),
  size text,
  color text,
  attributes jsonb not null default '{}'::jsonb
    check (jsonb_typeof(attributes) = 'object'),
  additional_price numeric(10, 2) not null default 0
    check (additional_price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default false,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) > 0),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  banner_url text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collection_products (
  collection_id uuid not null
    references public.collections (id) on delete cascade,
  product_id uuid not null
    references public.products (id) on delete cascade,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  primary key (collection_id, product_id)
);

create index products_category_active_idx
  on public.products (category_id, is_active);
create unique index product_images_one_primary_per_product_idx
  on public.product_images (product_id)
  where is_primary;
create index product_variants_product_active_idx
  on public.product_variants (product_id, is_active);
create unique index product_variants_one_default_per_product_idx
  on public.product_variants (product_id)
  where is_default;
create index collection_products_product_idx
  on public.collection_products (product_id);
create index collection_products_collection_sort_idx
  on public.collection_products (collection_id, sort_order);
create index categories_active_idx
  on public.categories (is_active);
create index collections_active_idx
  on public.collections (is_active);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger product_variants_set_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

create trigger collections_set_updated_at
before update on public.collections
for each row execute function public.set_updated_at();

revoke all on function public.set_updated_at() from public, anon, authenticated;

create function public.handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_auth_user_profile();

revoke all on function public.handle_new_auth_user_profile()
  from public, anon, authenticated;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;

grant usage on schema public to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.collections enable row level security;
alter table public.collection_products enable row level security;

revoke all on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, phone, avatar_url)
  on table public.profiles to authenticated;

revoke all on table
  public.categories,
  public.products,
  public.product_images,
  public.product_variants,
  public.collections,
  public.collection_products
from public, anon, authenticated;

grant select on table
  public.categories,
  public.products,
  public.product_images,
  public.product_variants,
  public.collections,
  public.collection_products
to anon, authenticated;

grant insert, update, delete on table
  public.categories,
  public.products,
  public.product_images,
  public.product_variants,
  public.collections,
  public.collection_products
to authenticated;

create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Admins can read profiles"
on public.profiles for select
to authenticated
using (public.is_admin());

create policy "Public can read active categories"
on public.categories for select
to anon, authenticated
using (is_active);

create policy "Admins can manage categories"
on public.categories for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read active products"
on public.products for select
to anon, authenticated
using (
  is_active
  and exists (
    select 1
    from public.categories
    where categories.id = category_id
      and categories.is_active
  )
);

create policy "Admins can manage products"
on public.products for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read images of active products"
on public.product_images for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products
    where products.id = product_id
      and products.is_active
  )
);

create policy "Admins can manage product images"
on public.product_images for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read active variants of active products"
on public.product_variants for select
to anon, authenticated
using (
  is_active
  and exists (
    select 1
    from public.products
    where products.id = product_id
      and products.is_active
  )
);

create policy "Admins can manage product variants"
on public.product_variants for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read active collections"
on public.collections for select
to anon, authenticated
using (is_active);

create policy "Admins can manage collections"
on public.collections for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read products in active collections"
on public.collection_products for select
to anon, authenticated
using (
  exists (
    select 1
    from public.collections
    where collections.id = collection_id
      and collections.is_active
  )
  and exists (
    select 1
    from public.products
    where products.id = product_id
      and products.is_active
  )
);

create policy "Admins can manage collection products"
on public.collection_products for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
