# Supabase catalogue foundation

## Hosted project setup

Create a Supabase project and choose an India region if one is available and
suitable. This repository does not create or connect to a hosted project
automatically.

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

The schema is managed in `migrations/20261118000000_catalogue_foundation.sql`.
The Supabase CLI is installed as a project development dependency. Before
linking or pushing, provide a Supabase personal access token and the project
database password to the CLI through your local shell. Do not commit these
credentials or paste them into chat. The repository's `.env*` ignore rule
also ignores the temporary `.env.supabase.local` file.

Review the target project and migration history before applying changes.
Never reset a database that contains user data. Applying SQL directly in the
Dashboard bypasses migration history. The RLS test suite is in
`tests/catalogue_rls_test.sql` and runs with `supabase test db`; this requires
a local Supabase stack and Docker, which are not installed.

`seed.sql` uses `[DEMO DATA]` labels. Its products and collection are inactive
and have zero placeholder prices so they cannot be mistaken for real,
published merchandise. The seeded categories are active examples; review or
replace them before launch.

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
- Catalogue inserts, updates, and deletes are granted only to authenticated
  users whose profile has the `admin` role. The profile role is not writable
  through the client. Assign admin access only through a trusted database
  administrator session.
- The service-role key is not used by these clients. Do not expose it to the
  browser; it bypasses row-level security.

The hosted project's HTTPS API is reachable, but the catalogue tables are
not yet available through the Data API. The migration and seed still need to
be applied, and the row-level security policies need testing against that
project.
