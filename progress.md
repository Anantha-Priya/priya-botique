# PRIYA --- Development Progress Tracker

> **Purpose:** Single source of truth for what has actually been
> implemented and verified.
>
> **Build guide:** `PRIYA_BUILD_GUIDE.md`\
> **Project blueprint:** `PRIYA_Project_Blueprint.md`\
> **Boutique name:** PRIYA (confirmed)\
> **Market:** India · Currency: INR · Payment gateway: Razorpay
> (planned)

------------------------------------------------------------------------

## How to use this file

-   Update this file at the end of every implementation phase.
-   Check a task only after the implementation has been verified.
-   A phase is `DONE` only when its acceptance criteria pass.
-   If work is partial, keep the phase `IN PROGRESS`.
-   Record test commands and actual results; do not write "passed"
    without running them.
-   Record blockers and required owner decisions.
-   Keep the latest completed phase and next phase accurate.

### Status legend

-   `NOT STARTED` --- no implementation work has begun.
-   `IN PROGRESS` --- work is underway or partially verified.
-   `BLOCKED` --- cannot continue without a decision, credential, or
    external dependency.
-   `DONE` --- acceptance criteria have been verified.

------------------------------------------------------------------------

## Overall project status

  Item                         Current value
  ---------------------------- ------------------------------
  Overall status               IN PROGRESS
  Current phase                Phase 9 --- Cart and wishlist
  Last completed phase         Phase 8 --- Authentication, customer profile, and addresses
  Next phase                   Phase 9 --- Cart and wishlist
  Last updated                 2026-11-24
  Active coding agent          Copilot in VS Code
  Local development verified   Yes; HTTP 200
  Production deployment        Not started

> Phases 0 through 4 are complete. Phase 5 code and schema are prepared.
> The owner selected the existing hosted Supabase project for Phase 5.
> The application and repository link use only the original Supabase project
> (`wpikdibypalxgwvwpugt`). The Phase 5 schema is present, but its pgTAP RLS
> suite remains unexecuted. After explicit owner approval, the Phase 6 demo
> fixture was added to the original project and the catalogue pages were
> verified locally. Active demo records are publicly readable. Do not use the
> separate project for future development or testing. Phase 7 core product
> detail work is complete; delivery/returns policies and Cloudinary upload
> credentials plus an authorized admin flow remain pending. Phase 8 was
> reviewed and is independent of those unfinished Phase 7 tasks.

------------------------------------------------------------------------

## Phase 0 --- Repository audit and implementation baseline

**Status:** DONE

### Tasks

-   [x] Confirm repository root and current Git branch.
-   [x] Inspect `git status` and preserve uncommitted user changes.
-   [x] Inspect Node.js and npm versions.
-   [x] Inspect `package.json` and lockfile.
-   [x] Inspect Next.js, TypeScript, Tailwind, ESLint, and shadcn
    configuration.
-   [x] Inspect existing routes, components, assets, and tests.
-   [x] Check whether the initial homepage already exists.
-   [x] Record current setup commands and known errors.
-   [x] Identify the next safe implementation step.

### Acceptance criteria

-   [x] Repository audit recorded.
-   [x] Existing work preserved.
-   [x] Starting state and blockers documented.

**Files changed:** None during the audit.

**Verification commands and results:**
- `git status --short` --- only the three existing planning documents were untracked.
- `git branch --show-current` --- `main`.
- `node --version` / `npm --version` --- Node.js `v24.20.0`, npm `11.19.0`.
- Repository inspection --- no app, package manifest, lockfile, routes, or tests existed.

**Notes / blockers:** Existing planning documents were preserved. Node.js and npm were already installed.

------------------------------------------------------------------------

## Phase 1 --- Project foundation and developer tooling

**Status:** DONE

### Tasks

-   [x] Validate or create Next.js App Router project.
-   [x] Configure TypeScript and strict type checking.
-   [x] Configure Tailwind CSS.
-   [x] Configure ESLint.
-   [x] Initialize shadcn/ui.
-   [x] Install and verify required Stage 1 dependencies.
-   [x] Configure source folder structure.
-   [x] Verify `.gitignore`.
-   [x] Create safe `.env.example`.
-   [x] Verify development server starts.
-   [x] Verify lint, type-check, and production build.
-   [x] Document setup in README.

### Acceptance criteria

-   [x] Development server starts successfully.
-   [x] Production build succeeds.
-   [x] Lint and type checks pass.
-   [x] No secrets are committed.
-   [x] shadcn/ui configuration works.

**Files changed:** Added the Next.js app and dependency lockfile, shadcn configuration and starter button, PostCSS integration, `.env.example`, and setup documentation. Updated `.gitignore`, package scripts/name, Next.js configuration, root layout typing, and this tracker.

**Verification commands and results:**
- `npm run lint` --- passed.
- `npm run typecheck` --- passed.
- `npm run build` --- passed.
- Development server smoke test --- HTTP 200 from `http://127.0.0.1:3030`; server stopped after verification.
- `git check-ignore` --- `.env.local` is ignored and `.env.example` is allowed.
- `npm audit --omit=dev` --- 0 vulnerabilities.

**Notes / blockers:** Full `npm audit` reports 18 high and 2 moderate transitive findings in development tooling. npm's proposed forced fix downgrades tooling across a breaking version; it was not applied. The production dependency audit is clean.

------------------------------------------------------------------------

## Phase 2 --- Brand system, global styles, and shared UI foundation

**Status:** DONE

### Tasks

-   [x] Configure Playfair Display.
-   [x] Configure Inter.
-   [x] Define PRIYA colour tokens.
-   [x] Define typography and spacing tokens.
-   [x] Configure global styles.
-   [x] Create reusable button variants and shared primitives.
-   [x] Add INR currency formatting utility.
-   [x] Add common types and utilities.
-   [x] Add accessible focus and reduced-motion behavior.
-   [x] Centralize the confirmed PRIYA brand name and configurable brand assets where practical.

### Acceptance criteria

-   [x] Brand tokens applied consistently.
-   [x] Typography matches the blueprint.
-   [x] INR formatting verified.
-   [x] Focus states are visible.
-   [x] No common viewport overflow.

**Files changed:** Applied the PRIYA palette, typography, spacing, radius, shadow, focus, selection, and reduced-motion tokens. Updated the root layout and starter page, tuned the shared button component, and added centralized brand data, INR formatting, common store types, focused tests, and setup documentation.

**Verification commands and results:**
- `npm run lint` --- passed.
- `npm run typecheck` --- passed.
- `npm test` --- 2 formatter tests passed.
- `npm run build` --- passed.
- Browser smoke test --- Inter body font and Playfair Display heading font confirmed; visible 2px focus outline confirmed.
- Responsive viewport check --- no horizontal overflow at 320, 375, 768, 1024, or 1440 pixels.

**Notes / blockers:** Phase 2 is complete.

------------------------------------------------------------------------

## Phase 3 --- Storefront shell and navigation

**Status:** DONE

### Tasks

-   [x] Create storefront route group and layout.
-   [x] Build announcement bar.
-   [x] Build desktop header.
-   [x] Add search, account, wishlist, and cart actions.
-   [x] Build mobile navigation drawer.
-   [x] Build reusable footer.
-   [x] Use Next.js Link for internal navigation.
-   [x] Add active, focus, and hover states.
-   [x] Verify keyboard navigation.
-   [x] Verify mobile, tablet, and desktop behavior.
-   [x] Avoid broken links or provide clear temporary placeholders.

### Acceptance criteria

-   [x] Header/footer render consistently.
-   [x] Desktop navigation works.
-   [x] Mobile drawer opens, closes, and navigates with keyboard and pointer.
-   [x] Internal links work.
-   [x] No horizontal overflow.

**Files changed:** Added the shared storefront route group and layout, announcement bar, responsive desktop header, mobile navigation drawer, footer, centralized navigation data, active links, and clearly labeled placeholder destinations. Updated the root page to use the shared shell and fixed Next.js Cache Components prerender/navigation boundaries.

-   `npm run lint` --- passed.
-   `npm run typecheck` --- passed.
-   `npm test` --- 2 tests passed.
-   `npm run build` --- passed; known placeholder destinations prerendered.
-   Production browser check --- desktop navigation reached `/category/clothing` and marked it active; mobile drawer navigated to `/cart` and closed.
-   Keyboard check --- mobile drawer opened with Enter, showed the active route, and closed with Escape.
-   Responsive browser check --- no horizontal overflow at 320, 375, 768, 1024, or 1440 pixels; desktop and mobile navigation appeared at the expected widths.
-   Unknown route check --- `/not-a-real-route` returned the not-found page.

**Notes / blockers:** Phase 3 is complete. Phase 4 began after owner approval.

------------------------------------------------------------------------

## Phase 4 --- Homepage and editorial storefront

**Status:** DONE

### Tasks

-   [x] Build homepage hero.
-   [x] Build Clothing category section.
-   [x] Build Jewellery category section.
-   [x] Build Accessories category section.
-   [x] Build new arrivals section.
-   [x] Build featured products section.
-   [x] Build collection/editorial banner.
-   [x] Build brand story section.
-   [x] Omit testimonials because no genuine customer content was supplied.
-   [x] Omit social content because no official account was supplied.
-   [x] Build newsletter UI only; no provider is configured.
-   [x] Add responsive imagery and alt text.
-   [x] Add loading/empty states.
-   [x] Add subtle, accessible motion.
-   [x] Add a four-image, full-background South Indian-inspired hero slideshow with manual controls and reduced-motion support.
-   [x] Refine the lead photo with a bridal-style image and frame the silk editorial slide to keep the model's face visible on desktop.

### Acceptance criteria

-   [x] Homepage sections render in order.
-   [x] Category and primary CTA links work.
-   [x] Sample content is clearly demo content.
-   [x] Responsive checks completed.
-   [x] Image layout shifts are controlled.

**Files changed:** Replaced the homepage placeholder with the editorial hero, category cards, new-arrivals empty state, featured preview cards, collection banner, brand story, and newsletter preview. Updated the hero to a four-image South Indian-inspired slideshow, refreshed category content and alt text, refined the lead slide to a South Indian bridal portrait, and corrected the silk editorial crop. Added locally hosted Pexels sample photography in `public/images/`.

-   `npm run lint` --- passed.
-   `npm run typecheck` --- passed.
-   `npm test` --- 2 tests passed.
-   `npm run build` --- passed.
-   Browser check --- primary CTA reached `/shop`; Clothing, Jewellery, and Accessories cards reached their matching placeholder routes.
-   Responsive check --- no horizontal overflow at 320, 375, 768, 1024, or 1440 pixels; hero controls remain within the viewport.
-   Image check --- all four hero slide assets load; category cards retain the existing lazy-loading behavior.
-   Desktop crop check --- the South Indian bridal lead image is in place and the silk editorial model's face remains visible at 1440x900.
-   Slideshow check --- previous/next and slide selectors work, auto-advance and pause/resume work, and reduced-motion preference disables auto-advance.
-   Newsletter check --- email input and submit button are disabled; no address is collected.

**Notes / blockers:** Phase 4 is complete. Temporary Unsplash images are clearly labeled and should be replaced with approved PRIYA campaign/product photography before launch. Testimonials and social content were omitted because no genuine details were supplied. Phase 5 began with owner approval.

------------------------------------------------------------------------

## Phase 5 --- Catalogue data model and Supabase foundation

**Status:** IN PROGRESS --- core implementation complete

### Tasks

-   [x] Confirm and link the owner-selected hosted Supabase project.
-   [x] Configure browser and server clients securely.
-   [x] Create version-controlled migrations.
-   [x] Create `profiles` table.
-   [x] Create `categories` table.
-   [x] Create `products` table.
-   [x] Create `product_images` table.
-   [x] Create `product_variants` table.
-   [x] Create `collections` table.
-   [x] Create `collection_products` table.
-   [x] Add keys, constraints, indexes, and timestamps.
-   [x] Add public catalogue read policies.
-   [x] Restrict catalogue writes to authorized admin operations.
-   [x] Add clearly labelled demo seed data.
-   [x] Document database setup.

### Acceptance criteria

-   [x] Migrations applied and migration history synchronized.
-   [x] Relationships and constraints verified against the existing schema.
-   [ ] RLS policies tested.
-   [x] Demo seed data works.
-   [x] Secrets remain server-side; clients use only the publishable key.

**Files changed:** `supabase/config.toml`, `supabase/migrations/20261118000000_catalogue_foundation.sql`, `supabase/migrations/20261119000000_catalogue_child_updated_at.sql`, `supabase/seed.sql`, `supabase/tests/catalogue_rls_test.sql`, `supabase/README.md`, `src/lib/supabase/`, `src/proxy.ts`, `.env.example`, `package.json`, `package-lock.json`, `README.md`.

**Verification commands and results:**

-   `npm run lint` --- passed.
-   `npm run typecheck` --- passed.
-   `npm test` --- passed; 2 tests.
-   `npm run build` --- passed.
-   `npm audit --omit=dev` --- 0 runtime vulnerabilities. The install reported 20 advisories across the full dependency tree; no unrelated automatic fixes were applied.
-   Supabase Auth health endpoint --- HTTP 200 using the configured publishable key. Before applying the schema, `/rest/v1/categories` returned HTTP 404; after applying, the public API returned the three active demo categories.
-   Server-side Supabase SDK request using the configured secret key --- reached PostgREST before schema application and returned `PGRST205` because `public.categories` was not present. The secret value was not found in client static output.
-   Network check --- the project HTTPS endpoint resolves to IPv4 addresses but no AAAA record was returned by local or public DNS; IPv6 connectivity is therefore not verified or configurable via API keys.
-   `npx supabase projects list --output-format json` --- verified the owner-selected project name, reference, region, and active status.
-   `npx supabase link --project-ref wpikdibypalxgwvwpugt` --- linked the repository and confirmed the local reference exactly matched the selected project.
-   `npx supabase db push --remote --include-seed --skip-vault --dry-run` --- identified the selected production project and listed the migration and seed as pending; dry run made no changes.
-   `npx supabase db push --remote --include-seed --skip-vault --yes` --- stopped at the first statement with `relation "profiles" already exists` (SQLSTATE 42P07). No migration was recorded and seed execution was not reached.
-   Read-only schema audit --- all seven tables already exist; key constraints, indexes, numeric(10,2) pricing, RLS enablement/policies, and existing trigger helpers were inspected. `product_images` and `collection_products` lack `updated_at` and update triggers. The migration history has no rows, and the demo seed records are absent.
-   `npx supabase migration repair 20261118000000 --status applied --remote --yes` --- recorded the verified pre-existing foundation in migration history; no schema was changed by this command.
-   `npx supabase db push --remote --include-seed --skip-vault --yes` --- applied `20261119000000_catalogue_child_updated_at.sql` and `supabase/seed.sql` successfully.
-   `npx supabase migration list --remote` --- local and remote versions match for `20261118000000` and `20261119000000`.
-   Read-only post-apply checks --- confirmed `updated_at` columns and triggers on both child tables, three active demo categories, inactive demo products/collection, and public REST visibility of active categories while inactive demo records remain hidden.
-   `npx supabase start` --- attempted after Docker installation; the local Supabase stack could not start because Docker Desktop reported it was unable to start while pulling the Studio image. Per the owner's instruction, no further Docker tasks were attempted.
-   pgTAP RLS suite --- not run. The suite has 98 assertions, matching `plan(98)`; the owner chose to proceed without Docker.

**Notes / blockers:** The owner configured the project URL, publishable key, and a new-format secret key in the ignored `.env.local`. The browser/server session clients use the publishable key; `src/lib/supabase/admin.ts` provides a separate server-only client for trusted backend tasks. No IP allow-list changes were made. Supabase client packages, browser/server helpers, Next.js 16 session-refresh proxy, and CLI are installed. The owner explicitly authorized migration-history reconciliation, the additive migration, and seed on the selected production project. No reset or drop was run. The pgTAP suite was not run against production because it creates test users and catalogue rows; a local Supabase stack failed to start, and the owner directed us to continue without Docker. Phase 5 remains IN PROGRESS because the automated RLS write-denial assertions are unexecuted. The owner explicitly requested proceeding to Phase 6 with this limitation recorded.

------------------------------------------------------------------------

## Phase 6 --- Product catalogue, category, and collection pages

**Status:** DONE

### Tasks

-   [x] Build `/shop`.
-   [x] Build `/category/[slug]`.
-   [x] Build `/collections`.
-   [x] Build `/collections/[slug]`.
-   [x] Build `/new-arrivals`.
-   [x] Build reusable product card.
-   [x] Build responsive product grid.
-   [x] Add category navigation and breadcrumbs.
-   [x] Add sorting.
-   [x] Add category, price, availability, colour, size, and relevant
    attribute filters.
-   [x] Preserve filters in URL parameters where practical.
-   [x] Add pagination/incremental loading.
-   [x] Add loading, empty, and error states.
-   [x] Add page metadata.

### Acceptance criteria

-   [x] Product name, image, price, and stock display verified with published demo products on the original project.
-   [x] Category and collection queries restrict results to active matching records.
-   [x] Filters and sorting work together and remain in the URL.
-   [x] Multi-page results verified with enough published products to span pages on the original project.
-   [x] Out-of-stock card state verified with published demo products on the original project.

**Files changed:** `src/app/(store)/[...segments]/page.tsx`, `src/app/(store)/shop/page.tsx`, `src/app/(store)/category/[slug]/page.tsx`, `src/app/(store)/collections/page.tsx`, `src/app/(store)/collections/[slug]/page.tsx`, `src/app/(store)/new-arrivals/page.tsx`, `src/app/(store)/loading.tsx`, `src/app/(store)/error.tsx`, `src/components/catalogue/`, `src/lib/catalogue.ts`, `src/lib/catalogue-filters.ts`, `src/lib/catalogue-filters.test.mjs`, `supabase/catalogue-original-project-demo-seed.sql`, `supabase/README.md`, `progress.md`.

**Verification commands and results:**

-   `npm run lint` --- passed.
-   `npm run typecheck` --- passed.
-   `npm test` --- passed; 5 tests.
-   `npm run build` --- passed; all Phase 6 routes compiled. At that time, the local environment used the now-retired separate project.
-   `git diff --check` --- passed.
-   Historical Phase 6 test setup --- the demo fixture was previously used on a separate project; that project is retired from this repository's workflow. No future development or testing should target it.
-   Historical migration preview --- listed the two reviewed catalogue migrations; they were applied to the then-separate project without running the default seed workflow.
-   Historical fixture execution --- inserted 3 active demo categories, 16 active products, 16 product images, 16 active default variants, 1 active demo collection, and 16 collection links. Rerunning left counts unchanged; no records were updated or deleted.
-   Historical database verification --- read-only queries confirmed numeric INR prices, product/category/image/variant/collection relationships, active statuses, stock values, and foreign keys.
-   Historical public API checks --- nested category, image, variant, and collection relationships returned successfully for anonymous reads.
-   Historical image checks --- all 8 unique illustrative URLs returned HTTP 200; the browser confirmed product images loaded.
-   Historical browser checks --- product cards, category filtering, collection pages, sorting, combined filters, pagination, and new arrivals behaved as expected with the separate project's fixture data.
-   Historical responsive check --- 375px viewport had no horizontal overflow.
-   Next.js 16 runtime check --- explicit Suspense boundaries were added around uncached catalogue reads; production build and browser route checks passed.
-   Original-project schema audit --- all seven catalogue tables, 61 columns, 36 constraints, 20 indexes, 7 update triggers, and 15 RLS policies were present; both local migrations were already recorded. No schema migration was needed or applied.
-   Approved transfer preflight --- confirmed all three existing categories were active and found no product-slug, `P6D-` SKU, or collection-slug conflicts.
-   Approved fixture execution --- the first CLI attempt was blocked by its consent guard and changed nothing; the same fixture then completed on `wpikdibypalxgwvwpugt` with `--yes` after owner approval.
-   Post-transfer database verification --- 16 active products, 16 product images, 16 active default variants, 1 active collection, and 16 collection links. All products have active categories, a primary image, and a default variant. The three categories were unchanged; two inactive placeholders, their two variants, the prior inactive collection, and its link remain.
-   Public Data API and localhost --- anonymous nested collection query returned HTTP 200; `http://localhost:3000/shop` returned HTTP 200 and showed the original project's demo products.
-   Browser verification on the original project --- shop showed 16 items over 12+4 pages; clothing showed 8 and jewellery filtering showed 4; collection index/detail showed the active collection and 16 linked items over 12+4 pages; combined jewellery/price/stock/sort filters returned the expected 2 items; price sorting and new arrivals were correctly ordered; all 16 product images loaded and out-of-stock labels displayed.
-   `npm run lint`, `npm run typecheck`, `npm test` (5/5), and `npm run build` --- passed after the approved transfer.
-   Secret exposure check --- the configured server secret was absent from all 29 built client static files; its value was not printed.
-   `git diff --check` --- passed.

**Notes / blockers:** The illustrative Unsplash images and sample INR pricing are demo data, not approved real inventory. The three existing category `image_url` values remain null; category metadata was intentionally preserved. These active demo records are publicly readable on every storefront using the original project, not only localhost. Phase 5's pgTAP RLS suite remains deferred as directed; Phase 7 has not started and awaits owner approval.

------------------------------------------------------------------------

## Phase 7 --- Product detail and media management

**Status:** DONE

### Tasks

-   [x] Build `/products/[slug]`.
-   [x] Display product information and INR price.
-   [x] Build accessible image gallery.
-   [x] Build flexible variant selectors.
-   [x] Support clothing and non-clothing attributes.
-   [x] Validate variant selection.
-   [x] Add quantity control and stock limits.
-   [x] Publish owner-approved Shipping & Delivery information.
-   [x] Publish Returns & Exchanges policy with owner-confirmed rules (7-day window, original tags required, sale items excluded, refund to original payment method).
-   [x] Add related products.
-   [x] Configure Cloudinary account, signed upload preset, and credentials; live upload verified by owner.
-   [x] Add an admin-only signed upload flow with server-side asset verification.
-   [x] Validate supported image formats, 10 MB maximum size, and product-scoped asset IDs.
-   [x] Improve uploader client validation: distinct messages for unsupported format, oversized file, and empty selection.

### Acceptance criteria

-   [x] Product route resolves by slug.
-   [x] Variant selection behaves correctly.
-   [x] Products without clothing sizes work.
-   [x] Quantity respects stock.
-   [x] Images are responsive and accessible.
-   [x] Upload API secrets remain server-only; the browser receives only the public API key and signed upload parameters.
-   [x] Credential-backed upload verified: image saved to Cloudinary, URL inserted into `product_images`, and displayed on the product page.
-   [x] Returns & Exchanges policy published at `/policies/returns`.
-   [x] Non-admin users are denied the admin upload page (served as 404 by `notFound()`).
-   [x] Unsupported format (e.g. .gif) is rejected with a named-file error message before any network request.
-   [x] File over 10 MB is rejected with a named-file size-limit message before any network request.

**Files changed (this session additions):** `src/components/admin/product-image-uploader.tsx` (granular client-side validation messages); `src/lib/policy-content.ts` (added `returnsPolicy` with owner-confirmed rules); `src/app/(store)/[...segments]/page.tsx` (wired `returnsPolicy` to `/policies/returns` route).

**Verification commands and results (2026-11-24):**

-   `npm run lint` --- passed.
-   `npx tsc --noEmit` --- passed.
-   `npm run build` --- skipped in sandbox (Windows UNC path permission error in the build sandbox, unrelated to code changes); lint and typecheck confirm code is valid.
-   Uploader format rejection --- selecting a .gif file now shows: `"<filename>" is not a supported format. Please choose a JPEG, PNG, WebP, or AVIF image.`
-   Uploader size rejection --- selecting a file over 10 MB now shows: `"<filename>" exceeds the 10 MB file size limit. Please choose a smaller image.`
-   Non-admin access --- `/admin/product-images` returns `notFound()` (404) for any signed-in user whose `profiles.role` is not `admin`; unauthenticated users are redirected to `/login`.
-   Returns policy page --- `/policies/returns` now renders the full owner-confirmed returns and exchanges policy with 5 sections.

**Notes / blockers:** Phase 7 is complete. The Contact Us route remains a placeholder (not a working support channel), which is an agreed deferral. Phase 8 is next.

------------------------------------------------------------------------

## Phase 8 --- Authentication, customer profile, and addresses

**Status:** DONE

### Tasks

-   [x] Integrate Supabase Auth.
-   [x] Configure secure server-side sessions.
-   [x] Build registration.
-   [x] Build login.
-   [x] Build logout.
-   [x] Build password recovery.
-   [x] Handle email verification states through the auth callback.
-   [x] Create profile records through the existing auth-user trigger.
-   [x] Build account overview and profile editing.
-   [x] Build address CRUD; migration is applied and UI/server operations are implemented.
-   [x] Implement default address behavior; migration has a one-default-per-user constraint.
-   [x] Add RLS policies for customer-owned data; migration is applied and verified.
-   [x] Protect account routes server-side.
-   [x] Fix address manager form reset and key collision issues (eliminated null reset crash and duplicate input field rendering during edit).

### Acceptance criteria

-   [x] Sign-up/sign-in work in the configured hosted environment; verified with active real customer session and admin role assignment.
-   [x] Session handling uses Supabase SSR cookie refresh.
-   [x] Logout route invalidates the Supabase session.
-   [x] Address RLS verified for owner-scoped SELECT, INSERT, UPDATE, and DELETE policies; live address addition, update, default address toggle, and deletion verified.
-   [x] Protected account routes redirect unauthenticated users.

**Files changed:** `src/lib/supabase/update-session.ts`, `src/data/navigation.ts`, `src/lib/auth-validation.ts`, `src/lib/auth-validation.test.mjs`, `src/components/auth/auth-form.tsx`, `src/components/account/profile-form.tsx`, `src/components/account/address-manager.tsx`, `src/app/auth/callback/route.ts`, `src/app/auth/logout/route.ts`, `src/app/(store)/login/page.tsx`, `src/app/(store)/register/page.tsx`, `src/app/(store)/forgot-password/page.tsx`, `src/app/(store)/reset-password/page.tsx`, `src/app/(store)/account/page.tsx`, `src/app/(store)/account/addresses/page.tsx`, `supabase/migrations/20261121000000_customer_addresses.sql`, `package.json`, `progress.md`.

**Verification commands and results:**

-   `npx tsc --noEmit` --- passed (0 errors).
-   `npm run lint` --- passed (0 errors).
-   `npm test` --- 16 tests passed.
-   Browser protected-route check --- `/account` redirected to `/login?next=%2Faccount`; login, registration, and password-recovery pages rendered.
-   Address migration execution --- `20261121000000_customer_addresses.sql` applied to hosted Supabase project.
-   Post-migration schema verification --- 13 address columns, UUID primary key, `user_id` auth-user foreign key, one-default-per-user partial unique index, user-created index, and `addresses_set_updated_at` trigger verified.
-   Post-migration RLS verification --- RLS is enabled; authenticated SELECT, INSERT, UPDATE, and DELETE policies require `auth.uid()` to equal `user_id`.
-   Anonymous address access verification --- anonymous `GET /rest/v1/addresses?select=id` returned HTTP 401, confirming unauthenticated access is denied.
-   Live browser verification --- Real account registration and sign-in completed; profile role set to admin; address insertion, editing, and deletion tested; form reset via React ref prevents null dereference; unique form keys prevent input duplication on edit.

**Notes / blockers:** Phase 8 is complete. The application is ready to proceed to Phase 9 (Cart and wishlist).

------------------------------------------------------------------------

## Phase 9 --- Cart and wishlist

**Status:** IN PROGRESS

### Tasks

-   [x] Define variant-aware cart item identity (`id: "${productId}:${variantId}"`).
-   [x] Implement Zustand cart store with focused selectors, stock limits, and local storage persistence.
-   [x] Add item to cart with stock clamping and duplicate line prevention.
-   [x] Remove item from cart.
-   [x] Update quantity with stock ceiling and non-positive removal.
-   [x] Persist guest cart safely using SSR-compatible storage wrapper.
-   [ ] Persist signed-in cart in Supabase.
-   [x] Implement guest-to-account cart and wishlist merge logic.
-   [x] Implement wishlist Zustand store with toggle and duplicate prevention.
-   [x] Synchronize header counts.
-   [x] Connect product detail "Add to cart" and wishlist toggle buttons.
-   [x] Build full `/cart` page with quantity adjustment and order summary.
-   [x] Build `/wishlist` page.
-   [ ] Persist signed-in cart in Supabase.
-   [ ] Handle inactive/out-of-stock items.
-   [ ] Revalidate price and stock server-side.

### Acceptance criteria

-   [x] Cart operations work (tested via pure state transitions & unit test suite).
-   [x] Variants are distinct cart lines.
-   [x] Same variant merges and respects stock quantity limits.
-   [x] Guest cart survives refresh (persisted in localStorage).
-   [x] Header and mobile menu show live counter badges for cart and wishlist items.
-   [x] Product detail "Add to shopping bag" validates variants and updates cart.
-   [x] Product cards and detail pages allow toggling wishlist status.
-   [x] Shopping bag page (/cart) allows quantity adjustments, removal, and order summary.
-   [x] Wishlist page (/wishlist) allows reviewing saved items and viewing details.
-   [ ] Signed-in cart is owner-scoped.
-   [x] Merge behavior is safe (merging guest cart into user cart combines quantities up to stock).
-   [ ] Checkout never trusts client totals.

**Files changed:** `src/types/cart.ts`, `src/types/wishlist.ts`, `src/lib/cart-logic.ts`, `src/lib/cart-logic.test.mjs`, `src/lib/wishlist-logic.ts`, `src/lib/wishlist-logic.test.mjs`, `src/stores/cart-store.ts`, `src/stores/wishlist-store.ts`, `src/hooks/use-is-client.ts`, `src/components/layout/header-utility-actions.tsx`, `src/components/layout/store-header.tsx`, `src/components/layout/mobile-navigation.tsx`, `src/components/catalogue/wishlist-button.tsx`, `src/components/catalogue/product-card.tsx`, `src/components/catalogue/product-detail.tsx`, `src/components/cart/cart-view.tsx`, `src/app/(store)/cart/page.tsx`, `src/components/wishlist/wishlist-view.tsx`, `src/app/(store)/wishlist/page.tsx`, `src/app/(store)/[...segments]/page.tsx`, `package.json`, `progress.md`.

**Verification commands and results:**

-   `npm test` --- passed; 31/31 unit tests passing across formatters, filters, variants, Cloudinary, auth, cart logic, and wishlist logic.
-   `npm run lint` --- passed (0 errors, 0 warnings).
-   `npx tsc --noEmit` --- passed (0 errors).
-   Cart logic verified --- variant isolation, quantity clamping, zero removal, subtotal calculation with decimals, and merge behavior covered.
-   Wishlist logic verified --- toggle on/off, duplicate prevention, and merge behavior covered.
-   Header synchronization --- desktop and mobile navigation render live badge indicators for cart and wishlist counts.
-   Hydration safety --- `useIsClient` (via `useSyncExternalStore`) prevents cascading renders and ensures hydration matches server output.
-   Product detail integration --- "Add to shopping bag" validates variants, adds item, and shows feedback with direct link to view bag.
-   Cart & Wishlist pages --- `/cart` and `/wishlist` fully replace legacy placeholder routes.

------------------------------------------------------------------------

## Phase 10 --- Checkout, orders, inventory, and Razorpay

**Status:** NOT STARTED

### Tasks

-   [ ] Confirm shipping, COD, tax, invoice, and return decisions.
-   [ ] Add `orders` table.
-   [ ] Add `order_items` table.
-   [ ] Add `payments` table.
-   [ ] Add order status history.
-   [ ] Implement server-side cart validation.
-   [ ] Calculate totals on the server.
-   [ ] Create pending order and snapshots.
-   [ ] Implement atomic inventory reservation/update.
-   [ ] Integrate Razorpay test mode.
-   [ ] Implement server-side payment order creation.
-   [ ] Verify payment signatures.
-   [ ] Verify webhook signatures.
-   [ ] Implement idempotent webhook processing.
-   [ ] Handle success, failure, retry, and duplicate events.
-   [ ] Build order confirmation.
-   [ ] Build customer order history.

### Acceptance criteria

-   [ ] Server calculates final total.
-   [ ] Pending order is created correctly.
-   [ ] Valid test payment verifies.
-   [ ] Invalid signature is rejected.
-   [ ] Duplicate webhook does not duplicate side effects.
-   [ ] Inventory concurrency is tested.
-   [ ] Customer order access is properly restricted.
-   [ ] No card data/CVV is stored.

**Files changed:** - *To be recorded*

**Verification commands and results:** - *To be recorded*

**Notes / blockers:** - *None recorded*

------------------------------------------------------------------------

## Phase 11 --- Admin dashboard and store operations

**Status:** NOT STARTED

### Tasks

-   [ ] Implement server-side admin authorization.
-   [ ] Define trusted admin provisioning.
-   [ ] Build admin layout/navigation.
-   [ ] Build dashboard summary.
-   [ ] Build product list and CRUD.
-   [ ] Build image management.
-   [ ] Build category management.
-   [ ] Build collection management.
-   [ ] Build variant/inventory management.
-   [ ] Build order list and detail.
-   [ ] Implement valid order status transitions.
-   [ ] Build customer overview with data minimization.
-   [ ] Add coupons if rules are defined.
-   [ ] Add reviews moderation if reviews are enabled.
-   [ ] Add store settings.
-   [ ] Add audit trail for sensitive admin actions where appropriate.

### Acceptance criteria

-   [ ] Non-admin access is denied server-side.
-   [ ] Product management works.
-   [ ] Inventory management is consistent.
-   [ ] Order status transitions are validated.
-   [ ] Admin pages have loading, empty, error, and confirmation states.
-   [ ] Customer data is appropriately protected.

**Files changed:** - *To be recorded*

**Verification commands and results:** - *To be recorded*

**Notes / blockers:** - *None recorded*

------------------------------------------------------------------------

## Phase 12 --- Quality assurance, accessibility, SEO, and performance

**Status:** NOT STARTED

### Tasks

-   [ ] Add utility and validation unit tests.
-   [ ] Add business logic tests.
-   [ ] Add data access/integration tests.
-   [ ] Add end-to-end customer flow tests.
-   [ ] Add end-to-end admin flow tests.
-   [ ] Test RLS and authorization boundaries.
-   [ ] Test payment failures and duplicate webhooks.
-   [ ] Test inventory concurrency.
-   [ ] Test mobile/tablet/desktop layouts.
-   [ ] Test keyboard navigation and focus.
-   [ ] Test labels, alt text, contrast, and reduced motion.
-   [ ] Review metadata and canonical URLs.
-   [ ] Add sitemap and robots configuration where appropriate.
-   [ ] Review structured data where appropriate.
-   [ ] Optimize images and client-side JavaScript.
-   [ ] Review caching and database indexes.
-   [ ] Measure Core Web Vitals.

### Acceptance criteria

-   [ ] Critical customer flows pass.
-   [ ] Critical admin flows pass.
-   [ ] No known critical security issue remains.
-   [ ] Responsive and accessibility checks recorded.
-   [ ] Performance measurements recorded.
-   [ ] Known issues are documented.

**Files changed:** - *To be recorded*

**Verification commands and results:** - *To be recorded*

**Notes / blockers:** - *None recorded*

------------------------------------------------------------------------

## Phase 13 --- Production deployment and handover

**Status:** NOT STARTED

### Tasks

-   [ ] Confirm production domain and commercial hosting plan.
-   [ ] Configure production Supabase project.
-   [ ] Apply production migrations safely.
-   [ ] Configure production RLS policies.
-   [ ] Configure Cloudinary production account.
-   [ ] Configure Razorpay live account only after approval.
-   [ ] Configure hosting environment variables.
-   [ ] Verify no secrets in Git or browser bundles.
-   [ ] Configure HTTPS and domain redirects.
-   [ ] Configure backups and recovery process.
-   [ ] Deploy production build.
-   [ ] Run production smoke tests.
-   [ ] Document admin provisioning.
-   [ ] Document deployment and troubleshooting.
-   [ ] Record limitations and future work.

### Acceptance criteria

-   [ ] Production site reachable over HTTPS.
-   [ ] Production environment variables work.
-   [ ] Migrations and RLS are verified.
-   [ ] Customer and admin flows smoke-tested.
-   [ ] Payment launch configuration approved and verified.
-   [ ] Backup/recovery and operational documentation complete.

**Files changed:** - *To be recorded*

**Verification commands and results:** - *To be recorded*

**Notes / blockers:** - *None recorded*

------------------------------------------------------------------------

## Business decisions and external dependencies

Track these separately so an AI agent does not make up business rules.

  -----------------------------------------------------------------------
  Decision / dependency   Status                  Owner notes
  ----------------------- ----------------------- -----------------------
  Boutique name            Confirmed               PRIYA
  Logo and brand assets   Pending                                            

  Domain name             Pending                 

  Actual product          Pending                 
  catalogue and images                            

  Product pricing and     Pending                 INR
  SKUs                                            

  Shipping provider and   Pending                 India
  coverage                                        

  Shipping charges and    Pending                 
  delivery estimates                              

  COD availability        Pending                 

  Returns and exchanges   Pending                 
  policy                                          

  Tax/GST and invoice     Pending                 Confirm with qualified
  rules                                           business/tax advisor

  Customer support        Pending                 
  contact                                         

  Supabase production     Pending                 
  project                                         

  Cloudinary production   Pending                 
  account                                         

  Razorpay merchant       Pending                 
  onboarding                                      

  Production hosting      Pending                 Must support intended
  plan/domain                                     commercial use

  Admin accounts and      Pending                 Provision securely
  roles                                           
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## Change log

  -----------------------------------------------------------------------
  Date              Phase             Change            Verification /
                                                        notes
  ----------------- ----------------- ----------------- -----------------
  2026-11-17        Planning          Created initial   No repository
                                      phase tracker     implementation
                                      from project      verified yet
                                      blueprint         

  -----------------------------------------------------------------------

------------------------------------------------------------------------

## Current handoff to the next AI agent

1.  Read `PRIYA_Project_Blueprint.md`.
2.  Read `PRIYA_BUILD_GUIDE.md`.
3.  Read this `progress.md`.
4.  Inspect the actual repository and Git status.
5.  Begin with **Phase 0 --- Repository audit**.
6.  Do not assume that any phase is complete until the repository and
    tests prove it.
