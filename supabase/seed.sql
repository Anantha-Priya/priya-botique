insert into public.categories (name, slug, description, is_active)
values
  (
    'Clothing',
    'clothing',
    '[DEMO DATA] Sample category; review before launch.',
    true
  ),
  (
    'Jewellery',
    'jewellery',
    '[DEMO DATA] Sample category; review before launch.',
    true
  ),
  (
    'Accessories',
    'accessories',
    '[DEMO DATA] Sample category; review before launch.',
    true
  )
on conflict (slug) do nothing;

insert into public.products (
  category_id,
  name,
  slug,
  description,
  fabric,
  base_price,
  is_active
)
select
  categories.id,
  '[DEMO DATA] Clothing sample',
  'demo-clothing-sample',
  '[DEMO DATA] Replace with verified product information and pricing.',
  '[DEMO DATA]',
  0.00,
  false
from public.categories as categories
where categories.slug = 'clothing'
on conflict (slug) do nothing;

insert into public.products (
  category_id,
  name,
  slug,
  description,
  base_price,
  is_active
)
select
  categories.id,
  '[DEMO DATA] Jewellery sample',
  'demo-jewellery-sample',
  '[DEMO DATA] Replace with verified product information and pricing.',
  0.00,
  false
from public.categories as categories
where categories.slug = 'jewellery'
on conflict (slug) do nothing;

insert into public.product_variants (
  product_id,
  sku,
  attributes,
  stock_quantity,
  is_active,
  is_default
)
select
  products.id,
  'DEMO-CLOTHING-DEFAULT',
  '{"demo": true}'::jsonb,
  0,
  false,
  true
from public.products as products
where products.slug = 'demo-clothing-sample'
on conflict (sku) do nothing;

insert into public.product_variants (
  product_id,
  sku,
  attributes,
  stock_quantity,
  is_active,
  is_default
)
select
  products.id,
  'DEMO-JEWELLERY-DEFAULT',
  '{"demo": true}'::jsonb,
  0,
  false,
  true
from public.products as products
where products.slug = 'demo-jewellery-sample'
on conflict (sku) do nothing;

insert into public.collections (name, slug, description, is_active)
values (
  '[DEMO DATA] Sample collection',
  'demo-sample-collection',
  '[DEMO DATA] Replace with an approved collection before launch.',
  false
)
on conflict (slug) do nothing;

insert into public.collection_products (collection_id, product_id, sort_order)
select collections.id, products.id, 0
from public.collections as collections
cross join public.products as products
where collections.slug = 'demo-sample-collection'
  and products.slug = 'demo-clothing-sample'
on conflict (collection_id, product_id) do nothing;
