-- Add is_pinned flag to products so admins can control homepage New Arrivals
alter table public.products
  add column if not exists is_pinned boolean not null default false;

create index if not exists products_pinned_active_idx
  on public.products (created_at desc, id desc)
  where is_pinned and is_active;
