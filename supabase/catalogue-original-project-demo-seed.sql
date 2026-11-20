-- Approved and applied on 2026-11-20 to the original project only.
-- Active records are publicly readable; keep this out of automatic seed runs.
-- Reuses existing active categories by slug and never changes category records.
-- All descriptions identify demo data; image URLs and pricing are illustrative.

with sample_products (
  category_slug,
  name,
  slug,
  description,
  fabric,
  attributes,
  base_price,
  compare_at_price,
  is_featured,
  days_ago
) as (
  values
    ('clothing', 'Aarohi Kanjivaram Silk Saree', 'p6-demo-2026-11-20-aarohi-kanjivaram-saree', '[DEMO DATA] Wedding-ready Kanjivaram-inspired drape with a rich zari border. Illustrative image and sample pricing; not a real PRIYA product.', 'Kanjivaram silk', '{"demo":true,"material":"Kanjivaram silk","occasion":"wedding","style":"traditional"}'::jsonb, 18990.00::numeric, 21990.00::numeric, true, 0),
    ('clothing', 'Meenakshi Soft Silk Saree', 'p6-demo-2026-11-20-meenakshi-soft-silk-saree', '[DEMO DATA] Lightweight soft-silk look with a contrast pallu. Illustrative image and sample pricing; not a real PRIYA product.', 'Soft silk', '{"demo":true,"material":"soft silk","occasion":"festive","style":"traditional"}'::jsonb, 12490.00::numeric, 14990.00::numeric, true, 1),
    ('clothing', 'Anika Banarasi Brocade Lehenga', 'p6-demo-2026-11-20-anika-banarasi-brocade-lehenga', '[DEMO DATA] Occasionwear lehenga concept with a brocade finish and coordinated styling. Illustrative image and sample pricing; not a real PRIYA product.', 'Banarasi brocade', '{"demo":true,"material":"brocade","occasion":"wedding","style":"bridal"}'::jsonb, 23900.00::numeric, 27900.00::numeric, true, 2),
    ('clothing', 'Madhavi Cotton Anarkali Suit', 'p6-demo-2026-11-20-madhavi-cotton-anarkali-suit', '[DEMO DATA] Breathable cotton Anarkali concept with delicate embroidery. Illustrative image and sample pricing; not a real PRIYA product.', 'Cotton', '{"demo":true,"material":"cotton","occasion":"everyday","style":"embroidered"}'::jsonb, 8590.00::numeric, 9990.00::numeric, false, 3),
    ('clothing', 'Varnika Chanderi Kurta Set', 'p6-demo-2026-11-20-varnika-chanderi-kurta-set', '[DEMO DATA] Chanderi-inspired kurta set concept for festive gatherings. Illustrative image and sample pricing; not a real PRIYA product.', 'Chanderi', '{"demo":true,"material":"Chanderi","occasion":"festive","style":"traditional"}'::jsonb, 6990.00::numeric, 8290.00::numeric, false, 4),
    ('clothing', 'Saanvi Bridal Silk Blouse', 'p6-demo-2026-11-20-saanvi-bridal-silk-blouse', '[DEMO DATA] Structured silk-blend blouse concept with hand-finished detailing. Illustrative image and sample pricing; not a real PRIYA product.', 'Silk blend', '{"demo":true,"material":"silk blend","occasion":"wedding","style":"bridal"}'::jsonb, 7490.00::numeric, 8990.00::numeric, false, 5),
    ('clothing', 'Kavya Handblock Cotton Saree', 'p6-demo-2026-11-20-kavya-handblock-cotton-saree', '[DEMO DATA] Handblock-inspired cotton saree concept with a soft drape. Illustrative image and sample pricing; not a real PRIYA product.', 'Cotton', '{"demo":true,"material":"cotton","occasion":"everyday","style":"handblock"}'::jsonb, 5490.00::numeric, 6490.00::numeric, false, 6),
    ('clothing', 'Ira Embroidered Sharara Set', 'p6-demo-2026-11-20-ira-embroidered-sharara-set', '[DEMO DATA] Festive sharara concept with a flowing silhouette and embroidery. Illustrative image and sample pricing; not a real PRIYA product.', 'Georgette blend', '{"demo":true,"material":"georgette","occasion":"festive","style":"embroidered"}'::jsonb, 13900.00::numeric, 15900.00::numeric, false, 7),
    ('jewellery', 'Temple Lakshmi Necklace', 'p6-demo-2026-11-20-temple-lakshmi-necklace', '[DEMO DATA] Temple-inspired necklace concept in an antique gold-plated finish. Illustrative image and sample pricing; not a real PRIYA product.', 'Gold-plated alloy', '{"demo":true,"material":"gold-plated alloy","occasion":"wedding","style":"temple"}'::jsonb, 4290.00::numeric, 4990.00::numeric, true, 8),
    ('jewellery', 'Malli Pearl Jhumka Earrings', 'p6-demo-2026-11-20-malli-pearl-jhumka-earrings', '[DEMO DATA] Pearl-accent jhumka concept for festive and occasion styling. Illustrative image and sample pricing; not a real PRIYA product.', 'Pearl and alloy', '{"demo":true,"material":"pearl","occasion":"festive","style":"jhumka"}'::jsonb, 1590.00::numeric, 1990.00::numeric, false, 9),
    ('jewellery', 'Kundan Chandbali Earrings', 'p6-demo-2026-11-20-kundan-chandbali-earrings', '[DEMO DATA] Chandbali-inspired earrings concept with a kundan-style finish. Illustrative image and sample pricing; not a real PRIYA product.', 'Kundan-style alloy', '{"demo":true,"material":"kundan","occasion":"wedding","style":"chandbali"}'::jsonb, 2790.00::numeric, 3290.00::numeric, false, 10),
    ('jewellery', 'Antique Finish Bangle Pair', 'p6-demo-2026-11-20-antique-finish-bangle-pair', '[DEMO DATA] Coordinated bangle-pair concept with an antique finish. Illustrative image and sample pricing; not a real PRIYA product.', 'Gold-plated alloy', '{"demo":true,"material":"gold-plated alloy","occasion":"festive","style":"traditional"}'::jsonb, 2190.00::numeric, 2590.00::numeric, false, 11),
    ('accessories', 'Zari Embroidered Potli Bag', 'p6-demo-2026-11-20-zari-embroidered-potli-bag', '[DEMO DATA] Occasion potli concept with zari-inspired embroidery and a drawstring closure. Illustrative image and sample pricing; not a real PRIYA product.', 'Silk blend', '{"demo":true,"material":"silk","occasion":"wedding","style":"embroidered"}'::jsonb, 1490.00::numeric, 1790.00::numeric, false, 12),
    ('accessories', 'Banarasi Silk Clutch', 'p6-demo-2026-11-20-banarasi-silk-clutch', '[DEMO DATA] Compact clutch concept in a Banarasi-inspired textile. Illustrative image and sample pricing; not a real PRIYA product.', 'Banarasi silk', '{"demo":true,"material":"silk","occasion":"festive","style":"traditional"}'::jsonb, 2490.00::numeric, 2990.00::numeric, false, 13),
    ('accessories', 'Pearl Gajra Hair Pins', 'p6-demo-2026-11-20-pearl-gajra-hair-pins', '[DEMO DATA] Floral-inspired hair accessory concept finished with pearl accents. Illustrative image and sample pricing; not a real PRIYA product.', 'Pearl and alloy', '{"demo":true,"material":"pearl","occasion":"wedding","style":"floral"}'::jsonb, 890.00::numeric, 1090.00::numeric, false, 14),
    ('accessories', 'Aari Embroidered Dupatta', 'p6-demo-2026-11-20-aari-embroidered-dupatta', '[DEMO DATA] Lightweight dupatta concept with Aari-inspired embroidery. Illustrative image and sample pricing; not a real PRIYA product.', 'Georgette blend', '{"demo":true,"material":"georgette","occasion":"festive","style":"embroidered"}'::jsonb, 3290.00::numeric, 3890.00::numeric, false, 15)
)
insert into public.products (
  category_id,
  name,
  slug,
  description,
  fabric,
  attributes,
  base_price,
  compare_at_price,
  is_featured,
  is_active,
  created_at
)
select
  categories.id,
  sample_products.name,
  sample_products.slug,
  sample_products.description,
  sample_products.fabric,
  sample_products.attributes,
  sample_products.base_price,
  sample_products.compare_at_price,
  sample_products.is_featured,
  true,
  now() - make_interval(days => sample_products.days_ago)
from sample_products
join public.categories on categories.slug = sample_products.category_slug
where categories.is_active
on conflict (slug) do nothing;

with sample_images (slug, image_url) as (
  values
    ('p6-demo-2026-11-20-aarohi-kanjivaram-saree', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80'),
    ('p6-demo-2026-11-20-meenakshi-soft-silk-saree', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80'),
    ('p6-demo-2026-11-20-anika-banarasi-brocade-lehenga', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80'),
    ('p6-demo-2026-11-20-madhavi-cotton-anarkali-suit', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80'),
    ('p6-demo-2026-11-20-varnika-chanderi-kurta-set', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80'),
    ('p6-demo-2026-11-20-saanvi-bridal-silk-blouse', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80'),
    ('p6-demo-2026-11-20-kavya-handblock-cotton-saree', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80'),
    ('p6-demo-2026-11-20-ira-embroidered-sharara-set', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80'),
    ('p6-demo-2026-11-20-temple-lakshmi-necklace', 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80'),
    ('p6-demo-2026-11-20-malli-pearl-jhumka-earrings', 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80'),
    ('p6-demo-2026-11-20-kundan-chandbali-earrings', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80'),
    ('p6-demo-2026-11-20-antique-finish-bangle-pair', 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80'),
    ('p6-demo-2026-11-20-zari-embroidered-potli-bag', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80'),
    ('p6-demo-2026-11-20-banarasi-silk-clutch', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80'),
    ('p6-demo-2026-11-20-pearl-gajra-hair-pins', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80'),
    ('p6-demo-2026-11-20-aari-embroidered-dupatta', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80')
)
insert into public.product_images (
  product_id,
  image_url,
  alt_text,
  sort_order,
  is_primary
)
select
  products.id,
  sample_images.image_url,
  'Illustrative demo image for ' || products.name || '; not an actual product photograph.',
  0,
  true
from sample_images
join public.products on products.slug = sample_images.slug
where products.attributes->>'demo' = 'true'
  and not exists (
  select 1
  from public.product_images
  where product_images.product_id = products.id
    and product_images.is_primary
)
on conflict (product_id, sort_order) do nothing;

with sample_variants (
  slug,
  sku,
  size,
  color,
  attributes,
  stock_quantity
) as (
  values
    ('p6-demo-2026-11-20-aarohi-kanjivaram-saree', 'P6D-AROHIKANJIVAM', 'M', 'Ruby red', '{"demo":true,"material":"Kanjivaram silk","occasion":"wedding","style":"traditional"}'::jsonb, 4),
    ('p6-demo-2026-11-20-meenakshi-soft-silk-saree', 'P6D-MEENAKSHISOFT', 'M', 'Teal', '{"demo":true,"material":"soft silk","occasion":"festive","style":"traditional"}'::jsonb, 0),
    ('p6-demo-2026-11-20-anika-banarasi-brocade-lehenga', 'P6D-ANIKABANARASI', 'M', 'Maroon', '{"demo":true,"material":"brocade","occasion":"wedding","style":"bridal"}'::jsonb, 2),
    ('p6-demo-2026-11-20-madhavi-cotton-anarkali-suit', 'P6D-MADHAVICOTTON', 'M', 'Indigo', '{"demo":true,"material":"cotton","occasion":"everyday","style":"embroidered"}'::jsonb, 5),
    ('p6-demo-2026-11-20-varnika-chanderi-kurta-set', 'P6D-VARNIKACHANDERI', 'M', 'Blush pink', '{"demo":true,"material":"Chanderi","occasion":"festive","style":"traditional"}'::jsonb, 3),
    ('p6-demo-2026-11-20-saanvi-bridal-silk-blouse', 'P6D-SAANVIBRIDAL', 'M', 'Emerald green', '{"demo":true,"material":"silk blend","occasion":"wedding","style":"bridal"}'::jsonb, 1),
    ('p6-demo-2026-11-20-kavya-handblock-cotton-saree', 'P6D-KAVYAHANDBLOCK', 'M', 'Rust', '{"demo":true,"material":"cotton","occasion":"everyday","style":"handblock"}'::jsonb, 0),
    ('p6-demo-2026-11-20-ira-embroidered-sharara-set', 'P6D-IRAEMBROIDERED', 'M', 'Wine', '{"demo":true,"material":"georgette","occasion":"festive","style":"embroidered"}'::jsonb, 4),
    ('p6-demo-2026-11-20-temple-lakshmi-necklace', 'P6D-TEMPLELAKSHMI', null, 'Antique gold', '{"demo":true,"material":"gold-plated alloy","finish":"antique","occasion":"wedding","style":"temple"}'::jsonb, 6),
    ('p6-demo-2026-11-20-malli-pearl-jhumka-earrings', 'P6D-MALLIPEARL', null, 'Pearl', '{"demo":true,"material":"pearl","finish":"polished","occasion":"festive","style":"jhumka"}'::jsonb, 8),
    ('p6-demo-2026-11-20-kundan-chandbali-earrings', 'P6D-KUNDANCHANDBALI', null, 'Gold', '{"demo":true,"material":"kundan","finish":"polished","occasion":"wedding","style":"chandbali"}'::jsonb, 0),
    ('p6-demo-2026-11-20-antique-finish-bangle-pair', 'P6D-ANTIQUEBANGLES', null, 'Antique gold', '{"demo":true,"material":"gold-plated alloy","finish":"antique","occasion":"festive","style":"traditional"}'::jsonb, 4),
    ('p6-demo-2026-11-20-zari-embroidered-potli-bag', 'P6D-ZARIPOTLI', null, 'Fuchsia', '{"demo":true,"material":"silk","finish":"embroidered","occasion":"wedding","style":"traditional"}'::jsonb, 6),
    ('p6-demo-2026-11-20-banarasi-silk-clutch', 'P6D-BANARASICLUTCH', null, 'Teal', '{"demo":true,"material":"silk","finish":"woven","occasion":"festive","style":"traditional"}'::jsonb, 2),
    ('p6-demo-2026-11-20-pearl-gajra-hair-pins', 'P6D-PEARLGAJRA', null, 'Pearl', '{"demo":true,"material":"pearl","finish":"polished","occasion":"wedding","style":"floral"}'::jsonb, 7),
    ('p6-demo-2026-11-20-aari-embroidered-dupatta', 'P6D-AARIDUPATTA', null, 'Gold', '{"demo":true,"material":"georgette","finish":"embroidered","occasion":"festive","style":"embroidered"}'::jsonb, 3)
)
insert into public.product_variants (
  product_id,
  sku,
  size,
  color,
  attributes,
  stock_quantity,
  is_active,
  is_default
)
select
  products.id,
  sample_variants.sku,
  sample_variants.size,
  sample_variants.color,
  sample_variants.attributes,
  sample_variants.stock_quantity,
  true,
  true
from sample_variants
join public.products on products.slug = sample_variants.slug
where products.attributes->>'demo' = 'true'
  and not exists (
  select 1
  from public.product_variants
  where product_variants.product_id = products.id
    and product_variants.is_default
)
on conflict (sku) do nothing;

insert into public.collections (
  name,
  slug,
  description,
  banner_url,
  is_active
)
values (
  '[DEMO] Festive & Wedding Edit',
  'p6-demo-2026-11-20-festive-edit',
  '[DEMO DATA] Owner-approval-pending collection with illustrative sample products and pricing.',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80',
  true
)
on conflict (slug) do nothing;

with sample_collection_products (slug, sort_order) as (
  values
    ('p6-demo-2026-11-20-aarohi-kanjivaram-saree', 0),
    ('p6-demo-2026-11-20-meenakshi-soft-silk-saree', 1),
    ('p6-demo-2026-11-20-anika-banarasi-brocade-lehenga', 2),
    ('p6-demo-2026-11-20-madhavi-cotton-anarkali-suit', 3),
    ('p6-demo-2026-11-20-varnika-chanderi-kurta-set', 4),
    ('p6-demo-2026-11-20-saanvi-bridal-silk-blouse', 5),
    ('p6-demo-2026-11-20-kavya-handblock-cotton-saree', 6),
    ('p6-demo-2026-11-20-ira-embroidered-sharara-set', 7),
    ('p6-demo-2026-11-20-temple-lakshmi-necklace', 8),
    ('p6-demo-2026-11-20-malli-pearl-jhumka-earrings', 9),
    ('p6-demo-2026-11-20-kundan-chandbali-earrings', 10),
    ('p6-demo-2026-11-20-antique-finish-bangle-pair', 11),
    ('p6-demo-2026-11-20-zari-embroidered-potli-bag', 12),
    ('p6-demo-2026-11-20-banarasi-silk-clutch', 13),
    ('p6-demo-2026-11-20-pearl-gajra-hair-pins', 14),
    ('p6-demo-2026-11-20-aari-embroidered-dupatta', 15)
)
insert into public.collection_products (
  collection_id,
  product_id,
  sort_order
)
select
  collections.id,
  products.id,
  sample_collection_products.sort_order
from sample_collection_products
join public.collections
  on collections.slug = 'p6-demo-2026-11-20-festive-edit'
 and collections.is_active
 and collections.description like '[DEMO DATA]%'
join public.products on products.slug = sample_collection_products.slug
where products.is_active
  and products.attributes->>'demo' = 'true'
on conflict (collection_id, product_id) do nothing;
