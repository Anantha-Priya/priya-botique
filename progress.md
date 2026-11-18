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
  Current phase                Phase 1 --- Project foundation
  Last completed phase         Phase 1 --- Project foundation
  Next phase                   Phase 2 --- Brand system (awaiting approval)
  Last updated                 2026-11-18
  Active coding agent          Copilot in VS Code
  Local development verified   Yes; HTTP 200
  Production deployment        Not started

> The project foundation is implemented. Storefront design and the
> remaining phases have not started.

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

**Notes / blockers:** Full `npm audit` reports 18 high and 2 moderate transitive findings in development tooling. npm's proposed forced fix downgrades tooling across a breaking version; it was not applied. The production dependency audit is clean. No Phase 2 work has been started; wait for owner approval.

------------------------------------------------------------------------

## Phase 2 --- Brand system, global styles, and shared UI foundation

**Status:** NOT STARTED

### Tasks

-   [ ] Configure Playfair Display.
-   [ ] Configure Inter.
-   [ ] Define PRIYA colour tokens.
-   [ ] Define typography and spacing tokens.
-   [ ] Configure global styles.
-   [ ] Create reusable button variants and shared primitives.
-   [ ] Add INR currency formatting utility.
-   [ ] Add common types and utilities.
-   [ ] Add accessible focus and reduced-motion behavior.
-   [ ] Centralize the confirmed PRIYA brand name and configurable brand assets where practical.

### Acceptance criteria

-   [ ] Brand tokens applied consistently.
-   [ ] Typography matches the blueprint.
-   [ ] INR formatting verified.
-   [ ] Focus states are visible.
-   [ ] No common viewport overflow.

**Files changed:** - *To be recorded*

**Verification commands and results:** - *To be recorded*

**Notes / blockers:** - *None recorded*

------------------------------------------------------------------------

## Phase 3 --- Storefront shell and navigation

**Status:** NOT STARTED

### Tasks

-   [ ] Create storefront route group and layout.
-   [ ] Build announcement bar.
-   [ ] Build desktop header.
-   [ ] Add search, account, wishlist, and cart actions.
-   [ ] Build mobile navigation drawer.
-   [ ] Build reusable footer.
-   [ ] Use Next.js Link for internal navigation.
-   [ ] Add active, focus, and hover states.
-   [ ] Verify keyboard navigation.
-   [ ] Verify mobile, tablet, and desktop behavior.
-   [ ] Avoid broken links or provide clear temporary placeholders.

### Acceptance criteria

-   [ ] Header/footer render consistently.
-   [ ] Desktop navigation works.
-   [ ] Mobile drawer works with keyboard and touch.
-   [ ] Internal links work.
-   [ ] No horizontal overflow.

**Files changed:** - *To be recorded*

**Verification commands and results:** - *To be recorded*

**Notes / blockers:** - *None recorded*

------------------------------------------------------------------------

## Phase 4 --- Homepage and editorial storefront

**Status:** NOT STARTED

### Tasks

-   [ ] Build homepage hero.
-   [ ] Build Clothing category section.
-   [ ] Build Jewellery category section.
-   [ ] Build Accessories category section.
-   [ ] Build new arrivals section.
-   [ ] Build featured products section.
-   [ ] Build collection/editorial banner.
-   [ ] Build brand story section.
-   [ ] Add testimonials only when genuine content is supplied.
-   [ ] Add optional social section only with real content.
-   [ ] Build newsletter UI or integration as scoped.
-   [ ] Add responsive imagery and alt text.
-   [ ] Add loading/empty states.
-   [ ] Add subtle, accessible motion.

### Acceptance criteria

-   [ ] Homepage sections render in order.
-   [ ] Category and primary CTA links work.
-   [ ] Sample content is clearly demo content.
-   [ ] Responsive checks completed.
-   [ ] Image layout shifts are controlled.

**Files changed:** - *To be recorded*

**Verification commands and results:** - *To be recorded*

**Notes / blockers:** - *None recorded*

------------------------------------------------------------------------

## Phase 5 --- Catalogue data model and Supabase foundation

**Status:** NOT STARTED

### Tasks

-   [ ] Create/configure Supabase development project.
-   [ ] Configure browser and server clients securely.
-   [ ] Create version-controlled migrations.
-   [ ] Create `profiles` table.
-   [ ] Create `categories` table.
-   [ ] Create `products` table.
-   [ ] Create `product_images` table.
-   [ ] Create `product_variants` table.
-   [ ] Create `collections` table.
-   [ ] Create `collection_products` table.
-   [ ] Add keys, constraints, indexes, and timestamps.
-   [ ] Add public catalogue read policies.
-   [ ] Restrict catalogue writes to authorized admin operations.
-   [ ] Add clearly labelled demo seed data.
-   [ ] Document database setup.

### Acceptance criteria

-   [ ] Migrations apply successfully.
-   [ ] Relationships and constraints verified.
-   [ ] RLS policies tested.
-   [ ] Demo seed data works.
-   [ ] Secrets remain server-side.

**Files changed:** - *To be recorded*

**Verification commands and results:** - *To be recorded*

**Notes / blockers:** - *None recorded*

------------------------------------------------------------------------

## Phase 6 --- Product catalogue, category, and collection pages

**Status:** NOT STARTED

### Tasks

-   [ ] Build `/shop`.
-   [ ] Build `/category/[slug]`.
-   [ ] Build `/collections`.
-   [ ] Build `/collections/[slug]`.
-   [ ] Build `/new-arrivals`.
-   [ ] Build reusable product card.
-   [ ] Build responsive product grid.
-   [ ] Add category navigation and breadcrumbs.
-   [ ] Add sorting.
-   [ ] Add category, price, availability, colour, size, and relevant
    attribute filters.
-   [ ] Preserve filters in URL parameters where practical.
-   [ ] Add pagination/incremental loading.
-   [ ] Add loading, empty, and error states.
-   [ ] Add page metadata.

### Acceptance criteria

-   [ ] Catalogue data is accurate.
-   [ ] Category and collection results are correct.
-   [ ] Filters and sorting work together.
-   [ ] Pagination works without duplicate/missing results.
-   [ ] Out-of-stock states are accurate.

**Files changed:** - *To be recorded*

**Verification commands and results:** - *To be recorded*

**Notes / blockers:** - *None recorded*

------------------------------------------------------------------------

## Phase 7 --- Product detail and media management

**Status:** NOT STARTED

### Tasks

-   [ ] Build `/products/[slug]`.
-   [ ] Display product information and INR price.
-   [ ] Build accessible image gallery.
-   [ ] Build flexible variant selectors.
-   [ ] Support clothing and non-clothing attributes.
-   [ ] Validate variant selection.
-   [ ] Add quantity control and stock limits.
-   [ ] Add approved delivery/return information.
-   [ ] Add related products.
-   [ ] Configure Cloudinary integration.
-   [ ] Add secure image upload flow.
-   [ ] Validate image type, size, and authorization.

### Acceptance criteria

-   [ ] Product route resolves by slug.
-   [ ] Variant selection behaves correctly.
-   [ ] Products without clothing sizes work.
-   [ ] Quantity respects stock.
-   [ ] Images are optimized and accessible.
-   [ ] Upload secrets remain server-only.

**Files changed:** - *To be recorded*

**Verification commands and results:** - *To be recorded*

**Notes / blockers:** - *None recorded*

------------------------------------------------------------------------

## Phase 8 --- Authentication, customer profile, and addresses

**Status:** NOT STARTED

### Tasks

-   [ ] Integrate Supabase Auth.
-   [ ] Configure secure server-side sessions.
-   [ ] Build registration.
-   [ ] Build login.
-   [ ] Build logout.
-   [ ] Build password recovery.
-   [ ] Handle email verification if enabled.
-   [ ] Create profile records.
-   [ ] Build account overview and profile editing.
-   [ ] Build address CRUD.
-   [ ] Implement default address behavior.
-   [ ] Add RLS policies for customer-owned data.
-   [ ] Protect account routes.

### Acceptance criteria

-   [ ] Sign-up/sign-in work.
-   [ ] Session handling works.
-   [ ] Logout works.
-   [ ] Customers cannot access other customers' private records.
-   [ ] Protected routes are enforced server-side.

**Files changed:** - *To be recorded*

**Verification commands and results:** - *To be recorded*

**Notes / blockers:** - *None recorded*

------------------------------------------------------------------------

## Phase 9 --- Cart and wishlist

**Status:** NOT STARTED

### Tasks

-   [ ] Define variant-aware cart item identity.
-   [ ] Implement Zustand cart store.
-   [ ] Add item to cart.
-   [ ] Remove item from cart.
-   [ ] Update quantity.
-   [ ] Persist guest cart.
-   [ ] Persist signed-in cart in Supabase.
-   [ ] Implement guest-to-account cart merge.
-   [ ] Implement wishlist.
-   [ ] Synchronize header counts.
-   [ ] Handle inactive/out-of-stock items.
-   [ ] Revalidate price and stock server-side.

### Acceptance criteria

-   [ ] Cart operations work.
-   [ ] Variants are distinct cart lines.
-   [ ] Guest cart survives refresh.
-   [ ] Signed-in cart is owner-scoped.
-   [ ] Merge behavior is safe.
-   [ ] Checkout never trusts client totals.

**Files changed:** - *To be recorded*

**Verification commands and results:** - *To be recorded*

**Notes / blockers:** - *None recorded*

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
