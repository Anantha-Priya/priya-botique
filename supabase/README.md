# Supabase catalogue foundation

## Hosted project setup

The application uses only the owner's original Supabase project,
`Anantha-Priya's Project` (`wpikdibypalxgwvwpugt`). Do not create another
project or switch the repository link. The local Supabase CLI link and
application environment variables have been verified against this reference.

The browser and server clients use the project URL and publishable key. Copy
`.env.example` to `.env.local` and set:

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
```

Keep `.env.local` out of Git. The publishable key is intended for client use;
the database policies, not the key, control access. Never put a secret key
in a `NEXT_PUBLIC_` variable or browser code. The admin client in
`src/lib/supabase/admin.ts` is server-only and bypasses RLS; use it only for
trusted backend operations. Normal browser and server-session clients
continue to use the publishable key and RLS. For compatibility, the admin
client also accepts the legacy `SUPABASE_SERVICE_ROLE_KEY` variable name;
prefer `SUPABASE_SECRET_KEY` with current-format `sb_secret_...` keys.

The framework connects over Supabase's HTTPS API. The service-role key does
not approve IP versions or change network allow-lists; IPv4/IPv6 reachability
depends on the client network and DNS. Direct PostgreSQL connections and
network allow-lists are separate from this app client setup.

## Migrations and seed data

The schema is managed in `migrations/20261118000000_catalogue_foundation.sql`
and `migrations/20261119000000_catalogue_child_updated_at.sql`. The Supabase
CLI is installed as a project development dependency. Store the database
password in a password manager; never paste credentials into chat or commit
them. The repository's `.env*` ignore rule also ignores `.env.supabase.local`.

Both local migrations are recorded on the original project. A read-only
comparison found all seven catalogue tables and the same schema objects on
the original project and the previously used project; no schema migration is
missing from the original project. Do not rerun or repair the baseline
migration.

Before any future remote database command:

1. Confirm the original project's name and reference with
   `npx supabase projects list`.
2. Do not relink to another project. Confirm `supabase/.temp/project-ref`
   remains `wpikdibypalxgwvwpugt`.
3. Review the migration history and existing schema. Preview any pending
   change with `npx supabase db push --remote --include-seed --skip-vault
   --dry-run`. Do not apply a migration, seed, or reset without explicit
   owner approval.

Never use `db reset` against a hosted project. When a recovery plan is
approved, preview it first with
`npx supabase db push --remote --include-seed --skip-vault --dry-run`.
`--skip-vault` avoids unrelated Vault updates.

Review the target project and migration history before applying changes.
Never reset a database that contains user data. Applying SQL directly in the
Dashboard bypasses migration history. The RLS test suite is in
`tests/catalogue_rls_test.sql` and runs with `supabase test db`; this requires
a local Supabase stack. The suite was not executed in this session because
the owner directed us to continue without Docker.

`seed.sql` uses `[DEMO DATA]` labels. Its products and collection are inactive
and have zero placeholder prices so they cannot be mistaken for real,
published merchandise. The seeded categories are active examples; review or
replace them before launch.

### Phase 6 catalogue verification data

`catalogue-original-project-demo-seed.sql` is a separate, additive fixture
prepared for the original project. It reuses the existing active categories
by slug without changing them. If approved, it will add 16 active sample
products with illustrative Unsplash images and INR prices, 16 product images,
16 active default variants (including in-stock and out-of-stock examples),
one active demo collection, and 16 collection links. It will not insert
categories or modify/delete existing records. All identifiers are resolved
inside the target database; no development-project UUIDs are copied.

The owner approved this fixture and it was applied to the original project on
2026-11-20. Because its products and collection are active and RLS permits
public reads, they are visible to every storefront using this project, not
only localhost. The SQL file remains outside all automatic seed workflows.

After approval, verify the project reference and current conflicts again,
then execute only against the original project:

```text
npx supabase db query --remote=wpikdibypalxgwvwpugt --file supabase/catalogue-original-project-demo-seed.sql
```

This fixture is intentionally not part of the default `db push --include-seed`
workflow.

## Deletion behavior

The migration intentionally uses `ON DELETE CASCADE` only for dependent data:
deleting an auth user removes their profile; deleting a product removes its
images, variants, and collection links; deleting a collection removes its
product links. Deleting a category with products is restricted. These cascades
do not apply when a record is archived by setting `is_active` to `false`.
Archive catalogue content instead of deleting it when it may be needed later;
order-history tables and snapshots are outside this migration.

## Schema and access rules

- `profiles.id` references `auth.users.id`. New accounts receive a
  `customer` profile through a database trigger. Users can read their own
  profile and update only `full_name`, `phone`, and `avatar_url`.
- `categories` have many `products`; products have many images and variants.
- `collections` and `products` have a many-to-many relationship through
  `collection_products`.
- `products.base_price` is the canonical INR price. A variant's
  `additional_price` is a non-negative adjustment; the effective price is
  `base_price + additional_price`.
- A product without selectable options can use one default variant. The
  partial unique index allows at most one default variant per product.
  `size` and `color` are nullable, so jewellery and accessories do not need
  clothing sizes.
- Public roles can read active categories, products, collections, and only
  the related images, variants, and collection links for active catalogue
  records. Inactive categories also hide their products.
- Anonymous users have no catalogue write grants. Catalogue inserts, updates,
  and deletes are granted to authenticated users but the RLS policies allow
  them only when their profile has the `admin` role. The profile role is not
  writable through the client. Assign admin access only through a trusted
  database administrator session.
- The service-role key is not used by these clients. Do not expose it to the
  browser; it bypasses row-level security.

The original project has the Phase 5 schema, additive timestamp migration,
inactive placeholder seed, and the explicitly approved Phase 6 demo fixture.
The transfer added 16 products, 16 images, 16 variants, one collection, and
16 links; it reused the three existing categories without changing them.
No existing products or business records were overwritten or deleted. No
schema migration was needed or applied during consolidation. The pgTAP RLS
suite remains unexecuted per the owner's no-Docker direction.
