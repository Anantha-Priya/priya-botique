# Phase 9 Cart Persistence Implementation Plan

## Goal
Complete the remaining Phase 9 work: signed-in cart persistence, guest-to-auth cart merge, inactive/out-of-stock handling, and server-side price/stock revalidation before checkout.

## Scope
- Add Supabase `carts` and `cart_items` tables with RLS.
- Keep Zustand client store for guest UX and optimistic updates.
- Sync authenticated cart to Supabase.
- Merge guest cart into account cart on login.
- Validate active products/variants and stock before checkout.
- Add tests.

## Proposed DB Changes
- `carts`: id, user_id (unique FK auth.users), created_at, updated_at.
- `cart_items`: id, cart_id FK, variant_id FK, quantity check >0, unique (cart_id, variant_id), created_at, updated_at.
- RLS: authenticated users can CRUD only their own cart/cart_items via user_id/cart ownership.
- Triggers: updated_at.
- Indexes: cart_items(cart_id), cart_items(variant_id).

## Affected Files
- New migration `supabase/migrations/20261124000000_customer_carts.sql`
- `src/lib/supabase` (use existing clients)
- `src/stores/cart-store.ts` (add sync helpers)
- New `src/lib/cart-sync.ts` (server/client orchestration)
- `src/app/auth/callback/route.ts` (merge trigger)
- `src/components/catalogue/product-detail.tsx` (stock checks)
- `src/lib/catalogue.ts` (fetch active product/variant)
- Tests under `src/lib/*.test.mjs`

## Security
- No service-role key in client.
- RLS owner-scoped.
- Server revalidation uses trusted DB prices/stock.
- Never trust client totals.

## Testing
- Unit: merge logic, stock clamping, inactive handling.
- Integration: RLS owner access, migration constraints.
- Manual: login merge, out-of-stock, quantity limits.

## Open Questions
- Should wishlist also persist for signed-in users now or remain client-only? (Current Phase 9 acceptance only requires cart owner-scoped; wishlist sync not explicitly required yet.)
- Checkout route not yet implemented; server revalidation endpoint should be reusable by Phase 10.
