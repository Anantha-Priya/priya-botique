# PRIYA --- AI-Agent Build Guide

> **Purpose:** An implementation-ready, phase-by-phase guide for
> building the PRIYA boutique e-commerce website with Claude Code,
> GitHub Copilot in VS Code, or another capable coding agent.
>
> **Project blueprint:** `PRIYA_Project_Blueprint.md`\
> **Progress tracker:** `progress.md`\
> **Boutique name:** PRIYA (confirmed; keep logo and brand assets configurable)\
> **Business:** Mixed boutique --- clothing, jewellery, accessories\
> **Market:** India · Currency: INR (₹) · Payment gateway: Razorpay
> (planned)

------------------------------------------------------------------------

## 0. How an AI coding agent must use this guide

This guide is the implementation contract. Read it before changing code.

### 0.1 Required files

At the start of a task, inspect these files if present:

1.  `PRIYA_Project_Blueprint.md` --- product and architecture
    decisions.
2.  `PRIYA_BUILD_GUIDE.md` --- implementation phases and acceptance
    criteria.
3.  `progress.md` --- actual implementation status.
4.  `README.md`, `package.json`, and relevant source files --- current
    repository state.

If the blueprint or progress file is missing, do not invent its
contents. Ask the user to add it or proceed only with clearly stated
assumptions.

### 0.2 Agent operating rules

The agent MUST:

-   Work only in the user's current PRIYA repository.
-   Inspect the existing project before making changes. Do not recreate
    a working project from scratch.
-   Identify the current phase from `progress.md` and confirm the
    requested scope.
-   Implement only the requested phase and its necessary dependencies.
    Do not jump ahead.
-   Preserve working code and existing user changes.
-   Avoid replacing files wholesale when a focused edit is safer.
-   Use the exact stack in the blueprint unless a genuine compatibility
    issue requires a change. Explain any proposed deviation before
    making it.
-   Use current stable, mutually compatible package versions and
    official documentation when package behavior is uncertain.
-   Never invent API keys, credentials, payment results, product facts,
    customer reviews, shipping promises, or business policies.
-   Use clearly labelled sample/demo content until the owner supplies
    real content.
-   Keep secrets out of source control and browser bundles.
-   Add or update tests for meaningful business logic and user flows.
-   Run relevant lint, type-check, test, and build commands after
    implementation.
-   Fix errors introduced by the current phase before declaring it
    complete.
-   Update `progress.md` after each phase with actual outcomes, test
    results, files changed, blockers, and next steps.
-   Never mark a task complete merely because code was generated. Verify
    it.
-   Stop and report blockers when credentials, business decisions, or
    external provider access are required. Continue with safe mock/local
    work where possible.

The agent MUST NOT:

-   Build the full project in one response or one uncontrolled
    code-generation pass.
-   expose Supabase service-role keys, Razorpay secrets, or Cloudinary
    API secrets in client code.
-   trust client-provided prices, discounts, stock counts, roles, or
    payment status.
-   mark a payment paid based only on a browser redirect.
-   create fake testimonials, fake reviews, false stock scarcity, or
    unverified delivery claims.
-   delete or reset a database, migration history, Git history, or user
    data without explicit approval.
-   run destructive commands or production migrations without explaining
    the impact and obtaining approval.
-   claim a deployment or external integration works without testing it.

### 0.3 Standard workflow for every phase

For each phase, follow this sequence:

1.  **Read:** Review the phase, blueprint, progress tracker, and
    relevant source files.
2.  **Inspect:** Check repository status, dependencies, routes,
    architecture, and existing tests.
3.  **Plan:** List the files and behavior to add/change. Identify risks
    and dependencies.
4.  **Implement:** Make small, coherent changes. Keep components
    reusable and accessible.
5.  **Verify:** Run the checks specified for the phase. Test the actual
    user flow where possible.
6.  **Review:** Check security, responsive behavior, errors, loading
    states, and regressions.
7.  **Document:** Update README or technical notes if needed.
8.  **Track:** Update `progress.md` with completed items, test evidence,
    blockers, and next phase.
9.  **Report:** Summarize what changed, what was tested, what remains,
    and any manual action needed from the user.

Do not proceed to the next phase automatically unless the user has
authorized continuous execution. At the end of a phase, present the
result and wait for approval or the next instruction.

### 0.4 Definition of phase completion

A phase is complete only when:

-   Its acceptance criteria are satisfied.
-   Relevant automated checks pass.
-   The affected user flow has been manually checked where practical.
-   No known critical regression remains.
-   Required documentation is updated.
-   `progress.md` accurately reflects the result.

Use these status values in `progress.md`:

-   `NOT STARTED`
-   `IN PROGRESS`
-   `BLOCKED`
-   `DONE`

A partially implemented phase remains `IN PROGRESS`, not `DONE`.

------------------------------------------------------------------------

## 1. Product and technical constraints

### 1.1 Product direction

Build a premium, modern Indian boutique storefront selling:

-   Clothing
-   Jewellery
-   Accessories

The product model must support different attributes by product type. Do
not force every item to have clothing sizes. Examples:

-   Clothing: size, colour, fabric, fit, care instructions.
-   Jewellery: material, finish, length, stone, weight where supplied.
-   Accessories: colour, dimensions, material, style.

These are examples of flexible attributes, not claims about actual
products.

### 1.2 Agreed technology stack

  Concern                Technology
  ---------------------- ---------------------
  Full-stack framework   Next.js App Router
  UI                     React
  Language               TypeScript
  Styling                Tailwind CSS
  Component primitives   shadcn/ui
  Icons                  Lucide React
  Animation              Motion
  Shared client state    Zustand
  Forms                  React Hook Form
  Validation             Zod
  Database               Supabase PostgreSQL
  Authentication         Supabase Auth
  Media                  Cloudinary
  Payments               Razorpay
  Hosting                Vercel
  Source control         Git and GitHub

Use Next.js server-side capabilities for business logic. A separate
Spring Boot API is not part of this project unless the owner explicitly
changes the architecture.

### 1.3 Architecture rules

-   Prefer Server Components for public pages and data display.
-   Use Client Components only where interaction requires browser state
    or event handlers.
-   Use Server Actions or Route Handlers for appropriate server-side
    operations.
-   Use Supabase PostgreSQL as the persistent source of truth.
-   Use Zustand for client-side interaction state, not as a replacement
    for the database.
-   Use Cloudinary for image assets and transformations.
-   Keep Razorpay secret operations on the server.
-   Use Vercel for deployment, subject to a plan suitable for commercial
    use.

### 1.4 Initial design tokens

  Token            Value
  ---------------- -----------
  Warm ivory       `#F7F3EC`
  Deep burgundy    `#6D263B`
  Champagne gold   `#C5A572`
  Charcoal         `#292522`
  Soft beige       `#E8DFD3`
  White            `#FFFFFF`

Typography: - Headings: Playfair Display - Body and UI: Inter

Design personality: premium, elegant, warm, modern, editorial,
uncluttered, trustworthy.

### 1.5 Important business decisions still requiring owner input

Do not invent these values. Use configuration or clearly labelled
placeholders until confirmed:

-   Final brand name, logo, domain, and legal business identity.
-   Actual product list, product photos, prices, SKUs, and inventory.
-   Shipping provider, delivery coverage, shipping charges, and delivery
    estimates.
-   COD availability.
-   Return, exchange, cancellation, and refund rules.
-   GST/tax and invoice requirements.
-   Customer support contact details.
-   Admin users and permission levels.
-   Production service plans and budget.

------------------------------------------------------------------------

# 2. Phase-by-phase implementation plan

## Phase 0 --- Repository audit and implementation baseline

**Goal:** Understand the existing project before editing it.

### Tasks

-   Inspect the repository root and Git status.
-   Check Node.js, npm, and package manager versions.
-   Inspect `package.json`, lockfile, `tsconfig.json`, Next.js
    configuration, Tailwind configuration, and shadcn configuration.
-   Identify whether Next.js App Router, TypeScript, Tailwind, and
    `src/` are already configured.
-   Inspect existing routes, components, assets, tests, and environment
    files.
-   Check whether the initial homepage or any Stage 1 work already
    exists.
-   Identify missing blueprint/build/progress documents.
-   Record the actual starting state in `progress.md`.

### Expected output

-   A short repository audit.
-   A list of existing working features.
-   A list of missing or inconsistent setup items.
-   A safe implementation plan for Phase 1.

### Acceptance criteria

-   No existing user work is overwritten.
-   Current project commands and known issues are documented.
-   The next phase is clear.

------------------------------------------------------------------------

## Phase 1 --- Project foundation and developer tooling

**Goal:** Establish a clean, reproducible Next.js development
environment.

### Tasks

1.  Create or validate the Next.js App Router project with TypeScript.
2.  Configure Tailwind CSS using the version-compatible setup generated
    by the installed Next.js tooling.
3.  Configure ESLint and strict TypeScript settings.
4.  Initialize shadcn/ui and verify `components.json`.
5.  Add required Stage 1 libraries:
    -   `lucide-react`
    -   `motion`
    -   `zustand`
    -   `react-hook-form`
    -   `zod`
    -   `@hookform/resolvers`
6.  Ensure package scripts exist for development, build, start, and
    lint. Add type-check and test scripts where appropriate.
7.  Configure a clean `src/` structure.
8.  Verify `.gitignore` excludes `.env*` secrets, dependencies, build
    output, and local artifacts while allowing `.env.example`.
9.  Create `.env.example` with variable names and blank/example
    placeholders only.
10. Ensure the app starts successfully.

### Expected structure

``` text
src/
  app/
  components/
    ui/
    layout/
    home/
    products/
    shared/
  data/
  features/
  hooks/
  lib/
  stores/
  types/
  validations/
public/
  images/
    banners/
    products/
    categories/
  icons/
supabase/
  migrations/
  seed.sql
```

Create folders as needed; do not create empty abstractions without a
purpose.

### Acceptance criteria

-   `npm run dev` starts the app.
-   Production build succeeds.
-   TypeScript and lint checks pass.
-   No secret values are committed.
-   shadcn/ui components can be added and imported successfully.
-   The project setup is documented in README.

------------------------------------------------------------------------

## Phase 2 --- Brand system, global styles, and shared UI foundation

**Goal:** Establish a consistent PRIYA visual language.

### Tasks

1.  Configure Playfair Display and Inter using a suitable Next.js font
    strategy.
2.  Define design tokens for the agreed palette, typography, spacing,
    borders, radii, and shadows.
3.  Set global background, foreground, selection, and focus styles.
4.  Configure reusable button variants and common UI primitives.
5.  Add shared utility helpers, including INR currency formatting.
6.  Define common TypeScript types for navigation items and product
    display data.
7.  Add accessible focus indicators and reduced-motion behavior.
8.  Ensure the confirmed boutique name and key brand content are
    centralized/configurable where practical.

### Acceptance criteria

-   Design tokens are used consistently rather than scattered arbitrary
    values.
-   Headings and body text use the intended font families.
-   Buttons, links, and focus states are consistent.
-   INR formatting uses `Intl.NumberFormat` with `en-IN` and `INR`.
-   No horizontal overflow at common viewport widths.

------------------------------------------------------------------------

## Phase 3 --- Storefront shell and navigation

**Goal:** Build the shared layout used across customer-facing pages.

### Tasks

1.  Create the storefront route group and its layout.
2.  Build the announcement bar.
3.  Build the desktop header with brand mark and primary navigation.
4.  Add search, account, wishlist, and cart actions.
5.  Build a mobile menu drawer using an accessible shadcn/ui primitive.
6.  Build the footer with navigation, support, policies, and social
    placeholders.
7.  Use Next.js `Link` for internal navigation.
8.  Add active/focus/hover states and keyboard support.
9.  Add responsive behavior for mobile, tablet, and desktop.
10. Ensure header and footer are reusable components.

### Routes/links

-   `/`
-   `/shop`
-   `/category/clothing`
-   `/category/jewellery`
-   `/category/accessories`
-   `/collections`
-   `/new-arrivals`
-   `/about`
-   `/contact`
-   `/search`
-   `/login`
-   `/wishlist`
-   `/cart`

Routes may be implemented in later phases; navigation should not point
to broken or misleading destinations. Use temporary placeholder pages
where necessary and label them appropriately.

### Acceptance criteria

-   Header and footer render consistently.
-   Desktop navigation works with keyboard and pointer.
-   Mobile drawer opens, closes, and navigates correctly.
-   Internal links use Next.js navigation.
-   No layout overflow on mobile.

------------------------------------------------------------------------

## Phase 4 --- Homepage and editorial storefront

**Goal:** Build the premium homepage using clearly identified sample
content.

### Sections

1.  Announcement bar.
2.  Hero image, headline, supporting text, and primary CTA.
3.  Clothing, jewellery, and accessories category cards.
4.  New arrivals.
5.  Featured products or curated selection.
6.  Collection/editorial banner.
7.  Brand story / why shop with us.
8.  Testimonials section only when real testimonials are supplied;
    otherwise omit or use a clearly labelled design placeholder.
9.  Optional social/Instagram section; do not fabricate social content.
10. Newsletter section, initially UI-only unless a provider is
    configured.
11. Footer.

### Tasks

-   Create small reusable section components.
-   Use temporary, appropriately licensed or clearly replaceable images.
-   Add descriptive alt text.
-   Use responsive image dimensions and reserved aspect ratios.
-   Use Next.js Image for supported local/remote image configuration.
-   Optimize the hero image loading priority; lazy-load appropriate
    below-the-fold images.
-   Add clear empty/loading states for product sections.
-   Use subtle Motion transitions only where they improve the
    experience.

### Acceptance criteria

-   Homepage sections render in the intended order.
-   Primary CTA navigates to a valid destination.
-   Category links work.
-   Product sections do not display invented real product claims.
-   Responsive layout is verified at mobile, tablet, and desktop sizes.
-   Images do not cause major layout shifts.

------------------------------------------------------------------------

## Phase 5 --- Catalogue data model and Supabase foundation

**Goal:** Establish the database and safe data access patterns.

### Tasks

1.  Use the owner's existing original Supabase project as the sole
    application database; do not create or link a second project.
2.  Configure local Supabase access without Docker unless the owner
    explicitly changes that requirement. Never reset a hosted database.
3.  Add Supabase client packages and separate browser/server client
    utilities using current official guidance.
4.  Create version-controlled SQL migrations.
5.  Implement core tables:
    -   `profiles`
    -   `categories`
    -   `products`
    -   `product_images`
    -   `product_variants`
    -   `collections`
    -   `collection_products`
6.  Add UUID keys, foreign keys, indexes, unique constraints, check
    constraints, and timestamps.
7.  Implement public read policies for active/published catalogue
    records.
8.  Keep write access restricted to authorized admin operations.
9.  Add sample seed data clearly labelled as demo data.
10. Document local setup and required environment variables.

### Data rules

-   Use `NUMERIC(10,2)` or an appropriate numeric type for currency.
-   Do not use floating-point arithmetic for money.
-   Product variants must support flexible JSONB attributes where
    appropriate.
-   Clothing sizes must not be mandatory for jewellery/accessories.
-   A product may have a default variant when no selectable options
    exist.
-   Decide and document whether price is stored at product or variant
    level; avoid ambiguous duplicate sources of truth.
-   Use a safe migration process. Never reset a database containing user
    data.

### Acceptance criteria

-   The migrations are recorded and verified against the owner's original
    project; no second hosted project is used.
-   Foreign keys and constraints work.
-   Public users can read only active catalogue content.
-   Unauthorized users cannot write catalogue records.
-   Seed data is clearly marked as sample data.
-   Database schema and relationships are documented.

------------------------------------------------------------------------

## Phase 6 --- Product catalogue, category, and collection pages

**Goal:** Make products discoverable.

### Routes

-   `/shop`
-   `/category/[slug]`
-   `/collections`
-   `/collections/[slug]`
-   `/new-arrivals`

### Tasks

1.  Fetch catalogue data server-side where practical.
2.  Build reusable product cards.
3.  Build responsive product grids.
4.  Add category navigation and breadcrumbs.
5.  Add sorting by newest and price.
6.  Add filters for category, price range, stock, colour, size, and
    relevant attributes.
7.  Preserve filter and sort state in URL search parameters where
    practical.
8.  Add pagination or incremental loading.
9.  Add empty, loading, and error states.
10. Add metadata and canonical URLs as appropriate.

### Acceptance criteria

-   Product cards show accurate name, image, and INR price from data.
-   Category and collection pages show only matching active products.
-   Filters and sorting work together.
-   URL state is shareable where implemented.
-   Pagination does not duplicate or skip products.
-   Out-of-stock products are represented accurately.

------------------------------------------------------------------------

## Phase 7 --- Product detail and media management

**Goal:** Deliver a complete product information and selection
experience.

### Tasks

1.  Build `/products/[slug]`.
2.  Display product images, name, description, price, category, and
    available stock.
3.  Build an accessible image gallery.
4.  Render variant selectors dynamically based on product attributes.
5.  Support clothing sizes/colours and non-clothing attributes such as
    material, finish, or dimensions.
6.  Validate variant selection before adding to cart.
7.  Add quantity selection and stock limits.
8.  Add delivery/returns information only from owner-approved policy
    configuration.
9.  Add related products.
10. Integrate Cloudinary for admin-side image uploads and optimized
    delivery when credentials are available.
11. Validate file types, file sizes, upload authorization, and image
    ownership.

### Acceptance criteria

-   Product detail route resolves by a unique slug.
-   Variant selection reflects available options.
-   Products without size options work correctly.
-   Quantity cannot exceed available stock.
-   Product data and price are server-derived.
-   Images have alt text and responsive sizing.
-   Upload secrets remain server-only.

**Implementation status:** The server-derived `/products/[slug]` route, responsive
gallery, dynamic clothing/non-clothing variants, quantity/stock validation,
invalid-slug handling, related products, Cloudinary signed-upload handlers, and
an admin upload page are implemented. Upload authorization is checked against
the signed-in Supabase profile, uploaded assets are verified server-side, and
Cloudinary delivery URLs receive automatic format/quality transformations.
The owner-approved Shipping & Delivery policy is published on the storefront
and summarized on product detail pages. Returns & Exchanges terms and
return-request instructions remain unpublished until a support-handling method
is configured and tested. Cloudinary credentials and a signed upload preset
must be configured and a real upload verified before this phase is complete.

### Cloudinary setup and verification

1. In Cloudinary Console, create an upload preset named
   `priya-product-images` and configure it for **signed** uploads.
2. Restrict its allowed formats to JPEG, PNG, WebP, and AVIF and set the maximum
   file size to 10 MB. Keep the preset's format and size restrictions aligned
   with the server-side checks.
3. Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
   `CLOUDINARY_API_SECRET`, and `CLOUDINARY_UPLOAD_PRESET` to the ignored local
   `.env.local` file and to the hosting provider's server environment. Never
   use a `NEXT_PUBLIC_` prefix for the API secret or share it in chat.
4. Before any real upload test, obtain explicit owner approval: it creates a
   Cloudinary asset and inserts a row into `product_images` in the original
   Supabase project. After approval, restart the local server, sign in with a
   profile whose `role` is `admin`, and open `/admin/product-images`. Use only
   the owner-approved test product, then confirm the image is displayed on its
   product page.
5. Repeat the test as a non-admin and confirm the page and API requests are
   denied. Confirm unsupported formats, files over 10 MB, and images not
   scoped to the selected product are rejected.

The application requests `f_auto,q_auto,c_limit,w_1600` for Cloudinary images;
other image hosts are left unchanged. This transforms delivery only and does
not replace or modify uploaded originals.

------------------------------------------------------------------------

## Phase 8 --- Authentication, customer profile, and addresses

**Goal:** Implement secure customer identity and account features.

### Tasks

1.  Integrate Supabase Auth using current official Next.js SSR guidance.
2.  Configure server-side session handling and cookie behavior.
3.  Build registration, login, logout, and password recovery.
4.  Handle verification states if email verification is enabled.
5.  Create profile records linked to `auth.users`.
6.  Build account overview and profile editing.
7.  Build address list, create, edit, delete, and default address
    behavior.
8.  Add RLS policies so customers can access only their own private
    records.
9.  Add server-side validation and useful error messages.
10. Add protected account routes.

### Acceptance criteria

-   Sign-up and sign-in work in the configured environment.
-   Session survives expected navigation/refresh behavior.
-   Logout invalidates the session correctly.
-   A customer cannot read or modify another customer's profile or
    addresses.
-   Protected routes redirect or deny access appropriately.
-   Secrets are not exposed in browser bundles.

**Implementation status:** Phase 8 authentication, profile, password recovery,
logout, callback, protected-route code, and address management UI are
implemented. The approved `20261121000000_customer_addresses.sql` migration
was applied to the original hosted project. No address records were inserted.

**Dependency status:** Phase 8 is independent of the unfinished delivery/returns
copy and Cloudinary upload tasks in Phase 7. It requires the existing Supabase
Auth/SSR setup and profile trigger, plus the prepared `addresses` migration.
The address migration was not applied because hosted database writes require
separate explicit approval. Until it is applied, the account UI reports address
storage as pending rather than silently inventing or resetting customer data.

------------------------------------------------------------------------

## Phase 9 --- Cart and wishlist

**Goal:** Implement reliable shopping state for guests and authenticated
customers.

### Tasks

1.  Define a cart item using product/variant identity.
2.  Implement a Zustand cart store with focused selectors.
3.  Add, remove, and update quantity actions.
4.  Add a persistent guest cart using a safe persistence strategy.
5.  Implement signed-in cart storage in Supabase.
6.  Define and test guest-to-account cart merge behavior.
7.  Implement wishlist interactions and page.
8.  Synchronize header cart/wishlist counts.
9.  Handle deleted, inactive, or out-of-stock products.
10. Revalidate price and stock on the server before checkout.

### Acceptance criteria

-   Add/remove/update operations work.
-   Same variant is not accidentally duplicated as separate lines.
-   Different variants of one product remain distinct.
-   Guest cart survives refresh.
-   Signed-in cart is persisted and scoped to its owner.
-   Cart merge behavior avoids duplicate quantities or data loss.
-   Client state is never trusted for final price or stock.

------------------------------------------------------------------------

## Phase 10 --- Checkout, orders, inventory, and Razorpay

**Goal:** Implement a secure end-to-end order workflow.

### Database additions

-   `orders`
-   `order_items`
-   `payments`
-   `order_status_history`
-   Optional inventory movement/reservation records

### Tasks

1.  Confirm business decisions for shipping, COD, returns, taxes, and
    invoices with the owner.
2.  Implement server-side cart validation.
3.  Recalculate item prices, discounts, shipping, taxes (as legally
    configured), and final total on the server.
4.  Create a pending order with address and product snapshots.
5.  Implement safe inventory reservation/decrement using transactional
    or atomic database logic.
6.  Create Razorpay orders from server-side code.
7.  Use the Razorpay public key only where the browser checkout SDK
    requires it; keep the secret key server-only.
8.  Verify payment signatures on the server.
9.  Implement webhook signature verification and idempotent event
    processing.
10. Handle success, failure, cancellation, duplicate callbacks, retries,
    and delayed webhooks.
11. Mark orders paid only after trusted verification.
12. Build order confirmation and customer order history.
13. Add order status transitions and audit history.

### Security and consistency requirements

-   Never accept the browser's total as authoritative.
-   Never mark an order paid based only on a client redirect or
    callback.
-   Verify webhook signatures using the raw request body as required by
    the provider.
-   Make webhook processing idempotent.
-   Do not decrement inventory multiple times for duplicate payment
    events.
-   Define how failed or abandoned payments release reserved stock.
-   Do not store card data or CVV.
-   Use test mode and test credentials before production.
-   Do not enable live payments until the owner has completed merchant
    onboarding and approved the production configuration.

### Acceptance criteria

-   Server computes the final amount from trusted data.
-   Pending order is created consistently.
-   Payment verification succeeds for valid test transactions.
-   Invalid signatures are rejected.
-   Duplicate webhooks do not duplicate payment/order actions.
-   Failed payments are represented correctly.
-   Inventory cannot be oversold under tested concurrent purchase
    conditions.
-   Customer can view their own order, not another customer's order.

------------------------------------------------------------------------

## Phase 11 --- Admin dashboard and store operations

**Goal:** Allow authorized staff to manage the store.

### Routes

-   `/admin`
-   `/admin/products`
-   `/admin/products/new`
-   `/admin/products/[id]/edit`
-   `/admin/categories`
-   `/admin/collections`
-   `/admin/inventory`
-   `/admin/orders`
-   `/admin/orders/[id]`
-   `/admin/customers`
-   `/admin/coupons`
-   `/admin/reviews`
-   `/admin/settings`

### Tasks

1.  Implement server-side admin authorization.
2.  Define trusted admin provisioning; never allow users to self-assign
    admin.
3.  Build admin layout and navigation.
4.  Build dashboard summary from real database data.
5.  Implement product CRUD and publish/archive behavior.
6.  Implement image upload and ordering.
7.  Implement category and collection management.
8.  Implement variant and inventory management.
9.  Implement order list, detail, and allowed status transitions.
10. Implement customer view with appropriate data minimization.
11. Add coupons/reviews/settings only when their underlying rules are
    defined.
12. Add audit logging for sensitive administrative actions where
    appropriate.

### Acceptance criteria

-   Non-admin users cannot access admin data or mutations, even by
    directly calling server endpoints.
-   Admin can create, edit, publish, and archive products.
-   Product variants and inventory are managed consistently.
-   Order status changes follow allowed transitions.
-   Admin screens have loading, empty, error, and confirmation states.
-   Sensitive customer data is not unnecessarily exposed.

------------------------------------------------------------------------

## Phase 12 --- Quality assurance, accessibility, SEO, and performance

**Goal:** Validate the complete customer and admin experience.

### Tasks

1.  Add or complete unit tests for utilities, validation, and business
    rules.
2.  Add integration tests for data access and server operations.
3.  Add end-to-end tests for key customer and admin flows.
4.  Test registration, login, logout, cart, checkout, payment states,
    and order history.
5.  Test admin authorization and RLS boundaries.
6.  Test duplicate webhook handling and stock concurrency.
7.  Test mobile, tablet, laptop, and desktop layouts.
8.  Test keyboard navigation, focus states, labels, contrast, and
    reduced motion.
9.  Review metadata, titles, descriptions, canonical URLs, sitemap,
    robots, and product structured data where appropriate.
10. Optimize images and remove unnecessary client-side JavaScript.
11. Review database indexes, caching, and revalidation.
12. Measure Core Web Vitals and Lighthouse performance.

### Performance targets

-   LCP: 2.5 seconds or less.
-   INP: 200 milliseconds or less.
-   CLS: 0.1 or less.

These are targets, not guarantees. Validate using real-device and field
measurements where possible.

### Acceptance criteria

-   Critical user journeys pass.
-   No critical security or authorization defects remain.
-   Responsive and accessibility checks are recorded.
-   No known high-severity console/runtime errors remain.
-   Performance issues found during testing are addressed or documented.

------------------------------------------------------------------------

## Phase 13 --- Production deployment and handover

**Goal:** Deploy safely and provide operational documentation.

### Tasks

1.  Confirm production domain and hosting plan appropriate for
    commercial use.
2.  Configure production Supabase project and migration process.
3.  Configure production Cloudinary account and upload restrictions.
4.  Configure Razorpay live credentials only after merchant approval.
5.  Set environment variables in the hosting platform.
6.  Verify production secrets are not present in Git or client bundles.
7.  Configure domain, HTTPS, and redirect behavior.
8.  Configure production database backups and recovery expectations.
9.  Run migrations in a controlled manner.
10. Deploy and verify health, critical routes, and logs.
11. Perform a controlled end-to-end production smoke test.
12. Document deployment, environment variables, admin provisioning,
    backup/recovery, and common troubleshooting.
13. Record known limitations and future enhancements.

### Acceptance criteria

-   Production deployment is reachable over HTTPS.
-   Production environment variables are configured correctly.
-   Database migrations and RLS policies are applied.
-   Customer and admin flows are smoke-tested.
-   Payment configuration is tested according to the approved launch
    plan.
-   Backup/recovery and operational ownership are documented.
-   No secrets or test-only credentials are exposed.

------------------------------------------------------------------------

# 3. Recommended execution order

``` text
Phase 0  Repository audit
   |
Phase 1  Project foundation
   |
Phase 2  Brand and shared UI system
   |
Phase 3  Storefront shell and navigation
   |
Phase 4  Homepage
   |
Phase 5  Supabase schema and data foundation
   |
Phase 6  Catalogue and collections
   |
Phase 7  Product details and media
   |
Phase 8  Authentication and account
   |
Phase 9  Cart and wishlist
   |
Phase 10 Checkout, inventory, and payments
   |
Phase 11 Admin dashboard
   |
Phase 12 QA, security, SEO, performance
   |
Phase 13 Production deployment
```

Some tasks can be developed in parallel only when their dependencies are
satisfied. Do not integrate checkout against a placeholder or unverified
pricing model.

------------------------------------------------------------------------

# 4. Standard commands and checks

The agent must inspect `package.json` and use the actual scripts
available. Typical commands may include:

``` powershell
npm install
npm run dev
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Do not assume `npm test` exists. If no test framework is configured,
recommend and configure one in the appropriate phase, then document the
command.

Before committing:

``` powershell
git status
git diff --check
git diff
```

Do not commit secrets, local database files, generated build output, or
unrelated user changes.

------------------------------------------------------------------------

# 5. Standard phase completion report

At the end of every phase, the agent must report:

``` text
Phase:
Status: DONE / IN PROGRESS / BLOCKED

Implemented:
- ...

Files created/updated:
- ...

Verification:
- Command:
  Result:
- Manual checks:
  Result:

Known issues / blockers:
- ...

User actions required:
- ...

Progress tracker:
- Updated progress.md: Yes / No

Next recommended phase:
- ...
```

------------------------------------------------------------------------

# 6. Copy-paste prompt for any AI coding agent

Use this prompt in Claude Code, GitHub Copilot Chat/Agent mode, or
another coding agent after placing the project documents in the
repository root.

``` text
You are the implementation agent for the PRIYA boutique e-commerce project.

First read:
- PRIYA_Project_Blueprint.md
- PRIYA_BUILD_GUIDE.md
- progress.md

Follow the build guide as the implementation contract.

Before editing:
1. Inspect the repository, Git status, package.json, current routes, source files, and tests.
2. Read progress.md and identify the current phase.
3. Do not overwrite existing working code or user changes.
4. Report the current state and a short plan for the requested phase.

Implementation rules:
- Use the agreed stack: Next.js App Router, React, TypeScript, Tailwind CSS,
  shadcn/ui, Motion, Zustand, React Hook Form, Zod, Supabase PostgreSQL/Auth,
  Cloudinary, Razorpay, and Vercel.
- Follow Server Components by default; use Client Components only when needed.
- Keep secrets server-side.
- Validate all important inputs and business rules on the server.
- Never trust client prices, stock, roles, or payment state.
- Build accessible, responsive UI consistent with the blueprint.
- Use clearly labelled demo content until real business content is supplied.
- Do not invent credentials, policies, products, testimonials, or delivery promises.
- Do not perform destructive database or Git operations without approval.
- Implement only the requested phase. Do not silently jump to later phases.

After implementation:
1. Run relevant lint, type-check, tests, and production build.
2. Fix errors caused by your changes.
3. Review the diff and check for security and responsive issues.
4. Update progress.md with verified completion status, tasks, files changed,
   commands run, test results, blockers, and the next phase.
5. Do not mark a phase DONE unless its acceptance criteria pass.
6. Summarize the work and wait for approval before starting another phase.

Start by auditing the repository. Do not begin implementation until you have
reported the current state and identified the next incomplete phase.
```

------------------------------------------------------------------------

## 7. Final project completion standard

PRIYA is ready for launch only when the customer storefront, account,
cart, checkout, payment verification, inventory, admin authorization,
database security, responsive behavior, and production operations have
all been tested.

A visually complete homepage is a Stage 1 milestone, not a completed
e-commerce application.
