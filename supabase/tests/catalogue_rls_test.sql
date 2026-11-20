-- File: supabase/tests/catalogue_rls_test.sql
-- Run:  supabase test db
begin;
select plan(98);

insert into auth.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'admin-rls-test@example.invalid'),
  ('22222222-2222-4222-8222-222222222222', 'customer-rls-test@example.invalid');

update public.profiles
set role = 'admin'
where id = '11111111-1111-4111-8111-111111111111';

insert into public.categories (id, name, slug, is_active)
values
  (
    '33333333-3333-4333-8333-333333333331',
    'RLS test active category',
    'phase5-test-active-category',
    true
  ),
  (
    '33333333-3333-4333-8333-333333333332',
    'RLS test inactive category',
    'phase5-test-inactive-category',
    false
  );

insert into public.products (
  id,
  category_id,
  name,
  slug,
  base_price,
  is_active
)
values
  (
    '44444444-4444-4444-8444-444444444441',
    '33333333-3333-4333-8333-333333333331',
    'RLS test active product',
    'phase5-test-active-product',
    100.00,
    true
  ),
  (
    '44444444-4444-4444-8444-444444444442',
    '33333333-3333-4333-8333-333333333331',
    'RLS test inactive product',
    'phase5-test-inactive-product',
    100.00,
    false
  ),
  (
    '44444444-4444-4444-8444-444444444443',
    '33333333-3333-4333-8333-333333333332',
    'RLS test hidden-category product',
    'phase5-test-hidden-category-product',
    100.00,
    true
  );

insert into public.product_images (
  product_id,
  image_url,
  alt_text,
  sort_order,
  is_primary
)
values
  (
    '44444444-4444-4444-8444-444444444441',
    'https://example.invalid/active.jpg',
    'RLS test active image',
    0,
    true
  ),
  (
    '44444444-4444-4444-8444-444444444443',
    'https://example.invalid/hidden.jpg',
    'RLS test hidden image',
    0,
    true
  );

insert into public.product_variants (
  product_id,
  sku,
  stock_quantity,
  is_active,
  is_default
)
values
  (
    '44444444-4444-4444-8444-444444444441',
    'PHASE5-RLS-ACTIVE',
    1,
    true,
    true
  ),
  (
    '44444444-4444-4444-8444-444444444443',
    'PHASE5-RLS-HIDDEN',
    1,
    true,
    true
  );

insert into public.collections (id, name, slug, is_active)
values
  (
    '55555555-5555-4555-8555-555555555551',
    'RLS test active collection',
    'phase5-test-active-collection',
    true
  ),
  (
    '55555555-5555-4555-8555-555555555552',
    'RLS test inactive collection',
    'phase5-test-inactive-collection',
    false
  );

insert into public.collection_products (collection_id, product_id, sort_order)
values
  (
    '55555555-5555-4555-8555-555555555551',
    '44444444-4444-4444-8444-444444444441',
    1
  ),
  (
    '55555555-5555-4555-8555-555555555552',
    '44444444-4444-4444-8444-444444444441',
    2
  ),
  (
    '55555555-5555-4555-8555-555555555551',
    '44444444-4444-4444-8444-444444444443',
    3
  );

set local role anon;

select ok(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  'RLS is enabled on profiles'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.categories'::regclass),
  'RLS is enabled on categories'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.products'::regclass),
  'RLS is enabled on products'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.product_images'::regclass),
  'RLS is enabled on product_images'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.product_variants'::regclass),
  'RLS is enabled on product_variants'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.collections'::regclass),
  'RLS is enabled on collections'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.collection_products'::regclass),
  'RLS is enabled on collection_products'
);

select results_eq(
  $$select slug from public.categories
    where slug like 'phase5-test-%' order by slug$$,
  array['phase5-test-active-category'],
  'anon reads only active categories'
);
select results_eq(
  $$select slug from public.products
    where slug like 'phase5-test-%' order by slug$$,
  array['phase5-test-active-product'],
  'anon reads only active products in active categories'
);
select results_eq(
  $$select image_url from public.product_images
    where image_url like 'https://example.invalid/%' order by image_url$$,
  array['https://example.invalid/active.jpg'],
  'anon reads images only for active products'
);
select results_eq(
  $$select sku from public.product_variants
    where sku like 'PHASE5-RLS-%' order by sku$$,
  array['PHASE5-RLS-ACTIVE'],
  'anon reads only active variants of visible products'
);
select results_eq(
  $$select slug from public.collections
    where slug like 'phase5-test-%' order by slug$$,
  array['phase5-test-active-collection'],
  'anon reads only active collections'
);
select results_eq(
  $$select sort_order from public.collection_products
    where collection_id = '55555555-5555-4555-8555-555555555551'
    order by sort_order$$,
  array[1],
  'anon reads only links to visible products in active collections'
);

select ok(
  not has_table_privilege('anon', 'public.profiles', 'insert,update,delete'),
  'anon has no profile write grants'
);
select ok(
  not has_table_privilege('anon', 'public.categories', 'insert,update,delete'),
  'anon has no category write grants'
);
select ok(
  not has_table_privilege('anon', 'public.products', 'insert,update,delete'),
  'anon has no product write grants'
);
select ok(
  not has_table_privilege('anon', 'public.product_images', 'insert,update,delete'),
  'anon has no product image write grants'
);
select ok(
  not has_table_privilege('anon', 'public.product_variants', 'insert,update,delete'),
  'anon has no product variant write grants'
);
select ok(
  not has_table_privilege('anon', 'public.collections', 'insert,update,delete'),
  'anon has no collection write grants'
);
select ok(
  not has_table_privilege(
    'anon',
    'public.collection_products',
    'insert,update,delete'
  ),
  'anon has no collection product write grants'
);

select throws_ok(
  $$insert into public.profiles (id, full_name)
    values ('99999999-9999-4999-8999-999999999999', 'Unauthorized')$$,
  '42501',
  null,
  'anon cannot insert profiles'
);
select throws_ok(
  $$update public.profiles set full_name = 'Unauthorized'
    where id = '22222222-2222-4222-8222-222222222222'$$,
  '42501',
  null,
  'anon cannot update profiles'
);
select throws_ok(
  $$delete from public.profiles
    where id = '22222222-2222-4222-8222-222222222222'$$,
  '42501',
  null,
  'anon cannot delete profiles'
);

select throws_ok(
  $$insert into public.categories (name, slug)
    values ('Unauthorized', 'phase5-test-anon-category')$$,
  '42501',
  null,
  'anon cannot insert categories'
);
select throws_ok(
  $$update public.categories set name = 'Unauthorized'
    where slug = 'phase5-test-active-category'$$,
  '42501',
  null,
  'anon cannot update categories'
);
select throws_ok(
  $$delete from public.categories
    where slug = 'phase5-test-active-category'$$,
  '42501',
  null,
  'anon cannot delete categories'
);
select throws_ok(
  $$insert into public.products (category_id, name, slug, base_price)
    values (
      '33333333-3333-4333-8333-333333333331',
      'Unauthorized',
      'phase5-test-anon-product',
      1.00
    )$$,
  '42501',
  null,
  'anon cannot insert products'
);
select throws_ok(
  $$update public.products set name = 'Unauthorized'
    where slug = 'phase5-test-active-product'$$,
  '42501',
  null,
  'anon cannot update products'
);
select throws_ok(
  $$delete from public.products
    where slug = 'phase5-test-active-product'$$,
  '42501',
  null,
  'anon cannot delete products'
);
select throws_ok(
  $$insert into public.product_images (product_id, image_url, alt_text)
    values (
      '44444444-4444-4444-8444-444444444441',
      'https://example.invalid/anon.jpg',
      'Unauthorized'
    )$$,
  '42501',
  null,
  'anon cannot insert product images'
);
select throws_ok(
  $$update public.product_images set alt_text = 'Unauthorized'
    where image_url = 'https://example.invalid/active.jpg'$$,
  '42501',
  null,
  'anon cannot update product images'
);
select throws_ok(
  $$delete from public.product_images
    where image_url = 'https://example.invalid/active.jpg'$$,
  '42501',
  null,
  'anon cannot delete product images'
);
select throws_ok(
  $$insert into public.product_variants (product_id, sku)
    values (
      '44444444-4444-4444-8444-444444444441',
      'PHASE5-RLS-ANON'
    )$$,
  '42501',
  null,
  'anon cannot insert product variants'
);
select throws_ok(
  $$update public.product_variants set stock_quantity = 2
    where sku = 'PHASE5-RLS-ACTIVE'$$,
  '42501',
  null,
  'anon cannot update product variants'
);
select throws_ok(
  $$delete from public.product_variants
    where sku = 'PHASE5-RLS-ACTIVE'$$,
  '42501',
  null,
  'anon cannot delete product variants'
);
select throws_ok(
  $$insert into public.collections (name, slug)
    values ('Unauthorized', 'phase5-test-anon-collection')$$,
  '42501',
  null,
  'anon cannot insert collections'
);
select throws_ok(
  $$update public.collections set name = 'Unauthorized'
    where slug = 'phase5-test-active-collection'$$,
  '42501',
  null,
  'anon cannot update collections'
);
select throws_ok(
  $$delete from public.collections
    where slug = 'phase5-test-active-collection'$$,
  '42501',
  null,
  'anon cannot delete collections'
);
select throws_ok(
  $$insert into public.collection_products (collection_id, product_id)
    values (
      '55555555-5555-4555-8555-555555555551',
      '44444444-4444-4444-8444-444444444442'
    )$$,
  '42501',
  null,
  'anon cannot insert collection products'
);
select throws_ok(
  $$update public.collection_products set sort_order = 9
    where collection_id = '55555555-5555-4555-8555-555555555551'
      and product_id = '44444444-4444-4444-8444-444444444441'$$,
  '42501',
  null,
  'anon cannot update collection products'
);
select throws_ok(
  $$delete from public.collection_products
    where collection_id = '55555555-5555-4555-8555-555555555551'
      and product_id = '44444444-4444-4444-8444-444444444441'$$,
  '42501',
  null,
  'anon cannot delete collection products'
);

set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

select results_eq(
  $$select role from public.profiles
    where id = '22222222-2222-4222-8222-222222222222'$$,
  array['customer'],
  'a customer can read their own profile'
);
select is_empty(
  $$select id from public.profiles
    where id = '11111111-1111-4111-8111-111111111111'$$,
  'a customer cannot read another profile'
);
select results_eq(
  $$update public.profiles set full_name = 'RLS test customer'
    where id = '22222222-2222-4222-8222-222222222222'
    returning full_name$$,
  array['RLS test customer'],
  'a customer can update their own allowed profile fields'
);
select ok(
  not has_column_privilege(
    'authenticated',
    'public.profiles',
    'role',
    'update'
  ),
  'authenticated users have no profile role update grant'
);
select throws_ok(
  $$update public.profiles set role = 'admin'
    where id = '22222222-2222-4222-8222-222222222222'$$,
  '42501',
  null,
  'a customer cannot promote their own profile'
);
select throws_ok(
  $$insert into public.profiles (id, full_name)
    values ('99999999-9999-4999-8999-999999999998', 'Unauthorized')$$,
  '42501',
  null,
  'a customer cannot insert profiles'
);
select throws_ok(
  $$delete from public.profiles
    where id = '22222222-2222-4222-8222-222222222222'$$,
  '42501',
  null,
  'a customer cannot delete their profile'
);
select throws_ok(
  $$insert into public.categories (name, slug)
    values ('Unauthorized', 'phase5-test-customer-category')$$,
  '42501',
  null,
  'a non-admin cannot insert categories'
);
select throws_ok(
  $$insert into public.products (category_id, name, slug, base_price)
    values (
      '33333333-3333-4333-8333-333333333331',
      'Unauthorized',
      'phase5-test-customer-product',
      1.00
    )$$,
  '42501',
  null,
  'a non-admin cannot insert products'
);
select throws_ok(
  $$insert into public.product_images (product_id, image_url, alt_text)
    values (
      '44444444-4444-4444-8444-444444444441',
      'https://example.invalid/unauthorized.jpg',
      'Unauthorized'
    )$$,
  '42501',
  null,
  'a non-admin cannot insert product images'
);
select throws_ok(
  $$insert into public.product_variants (product_id, sku)
    values (
      '44444444-4444-4444-8444-444444444441',
      'PHASE5-RLS-UNAUTHORIZED'
    )$$,
  '42501',
  null,
  'a non-admin cannot insert product variants'
);
select throws_ok(
  $$insert into public.collections (name, slug)
    values ('Unauthorized', 'phase5-test-customer-collection')$$,
  '42501',
  null,
  'a non-admin cannot insert collections'
);
select throws_ok(
  $$insert into public.collection_products (collection_id, product_id)
    values (
      '55555555-5555-4555-8555-555555555552',
      '44444444-4444-4444-8444-444444444442'
    )$$,
  '42501',
  null,
  'a non-admin cannot insert collection products'
);

select is_empty(
  $$update public.categories set name = 'Unauthorized'
    where slug = 'phase5-test-active-category'
    returning name$$,
  'a non-admin cannot update categories'
);
select results_eq(
  $$select name from public.categories
    where slug = 'phase5-test-active-category'$$,
  array['RLS test active category'],
  'a denied category update leaves the row unchanged'
);
select is_empty(
  $$update public.products set name = 'Unauthorized'
    where slug = 'phase5-test-active-product'
    returning name$$,
  'a non-admin cannot update products'
);
select results_eq(
  $$select name from public.products
    where slug = 'phase5-test-active-product'$$,
  array['RLS test active product'],
  'a denied product update leaves the row unchanged'
);
select is_empty(
  $$update public.product_images set alt_text = 'Unauthorized'
    where image_url = 'https://example.invalid/active.jpg'
    returning alt_text$$,
  'a non-admin cannot update product images'
);
select results_eq(
  $$select alt_text from public.product_images
    where image_url = 'https://example.invalid/active.jpg'$$,
  array['RLS test active image'],
  'a denied product image update leaves the row unchanged'
);
select is_empty(
  $$update public.product_variants set stock_quantity = 99
    where sku = 'PHASE5-RLS-ACTIVE'
    returning sku$$,
  'a non-admin cannot update product variants'
);
select results_eq(
  $$select stock_quantity::text from public.product_variants
    where sku = 'PHASE5-RLS-ACTIVE'$$,
  array['1'],
  'a denied product variant update leaves the row unchanged'
);
select is_empty(
  $$update public.collections set name = 'Unauthorized'
    where slug = 'phase5-test-active-collection'
    returning name$$,
  'a non-admin cannot update collections'
);
select results_eq(
  $$select name from public.collections
    where slug = 'phase5-test-active-collection'$$,
  array['RLS test active collection'],
  'a denied collection update leaves the row unchanged'
);
select is_empty(
  $$update public.collection_products set sort_order = 99
    where collection_id = '55555555-5555-4555-8555-555555555551'
      and product_id = '44444444-4444-4444-8444-444444444441'
    returning sort_order$$,
  'a non-admin cannot update collection products'
);
select results_eq(
  $$select sort_order from public.collection_products
    where collection_id = '55555555-5555-4555-8555-555555555551'
      and product_id = '44444444-4444-4444-8444-444444444441'$$,
  array[1],
  'a denied collection product update leaves the row unchanged'
);

select is_empty(
  $$delete from public.categories
    where slug = 'phase5-test-active-category'
    returning slug$$,
  'a non-admin cannot delete categories'
);
select results_eq(
  $$select slug from public.categories
    where slug = 'phase5-test-active-category'$$,
  array['phase5-test-active-category'],
  'a denied category delete leaves the row unchanged'
);
select is_empty(
  $$delete from public.products
    where slug = 'phase5-test-active-product'
    returning slug$$,
  'a non-admin cannot delete products'
);
select results_eq(
  $$select slug from public.products
    where slug = 'phase5-test-active-product'$$,
  array['phase5-test-active-product'],
  'a denied product delete leaves the row unchanged'
);
select is_empty(
  $$delete from public.product_images
    where image_url = 'https://example.invalid/active.jpg'
    returning image_url$$,
  'a non-admin cannot delete product images'
);
select results_eq(
  $$select image_url from public.product_images
    where image_url = 'https://example.invalid/active.jpg'$$,
  array['https://example.invalid/active.jpg'],
  'a denied product image delete leaves the row unchanged'
);
select is_empty(
  $$delete from public.product_variants
    where sku = 'PHASE5-RLS-ACTIVE'
    returning sku$$,
  'a non-admin cannot delete product variants'
);
select results_eq(
  $$select sku from public.product_variants
    where sku = 'PHASE5-RLS-ACTIVE'$$,
  array['PHASE5-RLS-ACTIVE'],
  'a denied product variant delete leaves the row unchanged'
);
select is_empty(
  $$delete from public.collections
    where slug = 'phase5-test-active-collection'
    returning slug$$,
  'a non-admin cannot delete collections'
);
select results_eq(
  $$select slug from public.collections
    where slug = 'phase5-test-active-collection'$$,
  array['phase5-test-active-collection'],
  'a denied collection delete leaves the row unchanged'
);
select is_empty(
  $$delete from public.collection_products
    where collection_id = '55555555-5555-4555-8555-555555555551'
      and product_id = '44444444-4444-4444-8444-444444444441'
    returning sort_order$$,
  'a non-admin cannot delete collection products'
);
select results_eq(
  $$select sort_order from public.collection_products
    where collection_id = '55555555-5555-4555-8555-555555555551'
      and product_id = '44444444-4444-4444-8444-444444444441'$$,
  array[1],
  'a denied collection product delete leaves the row unchanged'
);

set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select results_eq(
  $$insert into public.categories (name, slug)
    values ('RLS test admin category', 'phase5-test-admin-category')
    returning slug$$,
  array['phase5-test-admin-category'],
  'an admin can insert categories'
);
select results_eq(
  $$update public.categories set name = 'RLS test admin category updated'
    where slug = 'phase5-test-admin-category'
    returning name$$,
  array['RLS test admin category updated'],
  'an admin can update categories'
);
select results_eq(
  $$delete from public.categories
    where slug = 'phase5-test-admin-category'
    returning slug$$,
  array['phase5-test-admin-category'],
  'an admin can delete categories'
);

select results_eq(
  $$insert into public.products (category_id, name, slug, base_price)
    values (
      '33333333-3333-4333-8333-333333333331',
      'RLS test admin product',
      'phase5-test-admin-product',
      250.00
    )
    returning slug$$,
  array['phase5-test-admin-product'],
  'an admin can insert products'
);
select results_eq(
  $$update public.products set name = 'RLS test admin product updated'
    where slug = 'phase5-test-admin-product'
    returning name$$,
  array['RLS test admin product updated'],
  'an admin can update products'
);
select results_eq(
  $$delete from public.products
    where slug = 'phase5-test-admin-product'
    returning slug$$,
  array['phase5-test-admin-product'],
  'an admin can delete products'
);

select results_eq(
  $$insert into public.product_images (
      product_id, image_url, alt_text, sort_order
    )
    values (
      '44444444-4444-4444-8444-444444444441',
      'https://example.invalid/admin.jpg',
      'RLS test admin image',
      7
    )
    returning image_url$$,
  array['https://example.invalid/admin.jpg'],
  'an admin can insert product images'
);
select results_eq(
  $$update public.product_images
    set alt_text = 'RLS test admin image updated',
        updated_at = '2000-01-01T00:00:00Z'
    where image_url = 'https://example.invalid/admin.jpg'
    returning alt_text$$,
  array['RLS test admin image updated'],
  'an admin can update product images'
);
select is(
  (
    select updated_at
    from public.product_images
    where image_url = 'https://example.invalid/admin.jpg'
  ),
  transaction_timestamp(),
  'product image update trigger refreshes updated_at'
);
select results_eq(
  $$delete from public.product_images
    where image_url = 'https://example.invalid/admin.jpg'
    returning image_url$$,
  array['https://example.invalid/admin.jpg'],
  'an admin can delete product images'
);

select results_eq(
  $$insert into public.product_variants (
      product_id, sku, stock_quantity, is_active
    )
    values (
      '44444444-4444-4444-8444-444444444441',
      'PHASE5-RLS-ADMIN',
      1,
      true
    )
    returning sku$$,
  array['PHASE5-RLS-ADMIN'],
  'an admin can insert product variants'
);
select results_eq(
  $$update public.product_variants set stock_quantity = 2
    where sku = 'PHASE5-RLS-ADMIN'
    returning stock_quantity::text$$,
  array['2'],
  'an admin can update product variants'
);
select results_eq(
  $$delete from public.product_variants
    where sku = 'PHASE5-RLS-ADMIN'
    returning sku$$,
  array['PHASE5-RLS-ADMIN'],
  'an admin can delete product variants'
);

select results_eq(
  $$insert into public.collections (name, slug, is_active)
    values (
      'RLS test admin collection',
      'phase5-test-admin-collection',
      true
    )
    returning slug$$,
  array['phase5-test-admin-collection'],
  'an admin can insert collections'
);
select results_eq(
  $$update public.collections set name = 'RLS test admin collection updated'
    where slug = 'phase5-test-admin-collection'
    returning name$$,
  array['RLS test admin collection updated'],
  'an admin can update collections'
);
select results_eq(
  $$delete from public.collections
    where slug = 'phase5-test-admin-collection'
    returning slug$$,
  array['phase5-test-admin-collection'],
  'an admin can delete collections'
);

select results_eq(
  $$insert into public.collection_products (
      collection_id, product_id, sort_order
    )
    values (
      '55555555-5555-4555-8555-555555555551',
      '44444444-4444-4444-8444-444444444442',
      8
    )
    returning sort_order$$,
  array[8],
  'an admin can insert collection products'
);
select results_eq(
  $$update public.collection_products
    set sort_order = 9, updated_at = '2000-01-01T00:00:00Z'
    where collection_id = '55555555-5555-4555-8555-555555555551'
      and product_id = '44444444-4444-4444-8444-444444444442'
    returning sort_order$$,
  array[9],
  'an admin can update collection products'
);
select is(
  (
    select updated_at
    from public.collection_products
    where collection_id = '55555555-5555-4555-8555-555555555551'
      and product_id = '44444444-4444-4444-8444-444444444442'
  ),
  transaction_timestamp(),
  'collection product update trigger refreshes updated_at'
);
select results_eq(
  $$delete from public.collection_products
    where collection_id = '55555555-5555-4555-8555-555555555551'
      and product_id = '44444444-4444-4444-8444-444444444442'
    returning sort_order$$,
  array[9],
  'an admin can delete collection products'
);

select * from finish();
rollback;
