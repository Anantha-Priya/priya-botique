alter table public.product_images
  add column updated_at timestamptz not null default now();

alter table public.collection_products
  add column updated_at timestamptz not null default now();

create trigger product_images_set_updated_at
before update on public.product_images
for each row execute function public.set_updated_at();

create trigger collection_products_set_updated_at
before update on public.collection_products
for each row execute function public.set_updated_at();
