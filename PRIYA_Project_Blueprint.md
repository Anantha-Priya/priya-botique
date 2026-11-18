# PRIYA Boutique --- Project Blueprint

> **Project status:** Planning and Stage 1 foundation\
> **Boutique name:** PRIYA (confirmed)\
> **Business type:** Mixed boutique e-commerce\
> **Product categories:** Clothing, jewellery, accessories\
> **Primary market:** India\
> **Currency:** Indian Rupee (INR / ₹)\
> **Payments:** Razorpay (planned)\
> **Delivery:** India-wide delivery (shipping provider and rules to be
> finalized)

------------------------------------------------------------------------

## 1. Project Overview

### 1.1 Vision

PRIYA is a modern, premium boutique e-commerce website designed to
make it easy for customers in India to discover and purchase clothing,
jewellery, and accessories.

The experience should combine an elegant, editorial fashion storefront
with the convenience and reliability expected from a modern online
store. Customers should be able to browse collections, search and filter
products, view product details, manage a cart and wishlist, place
orders, pay securely, and track their purchases.

A separate, protected admin dashboard will allow the boutique owner or
authorized staff to manage products, categories, inventory, orders,
customers, and store content.

### 1.2 Goals

-   Create a polished, trustworthy, mobile-friendly boutique storefront.
-   Support multiple product types: clothing, jewellery, and
    accessories.
-   Make browsing, searching, filtering, and navigation feel fast and
    intuitive.
-   Support product options such as size, colour, and other configurable
    attributes.
-   Provide a reliable cart, checkout, order, and payment workflow.
-   Provide an admin area for day-to-day store operations.
-   Optimize product images and page performance.
-   Build a maintainable application that can grow as the business
    expands.

### 1.3 Scope

**Customer storefront** - Homepage and promotional sections - Shop,
category, collection, and product pages - Search, filters, and sorting -
Customer registration, login, and account - Wishlist and shopping cart -
Checkout, payment, and order history - Contact, about, and policy pages

**Admin application** - Dashboard and sales overview - Product and
category management - Collections and inventory management - Order and
customer management - Coupons, reviews, and store settings

### 1.4 Initial assumptions

-   The first release targets customers in India.
-   Product prices are displayed in INR.
-   Razorpay is the intended payment gateway.
-   Indian delivery is required; courier integration and shipping rules
    will be selected later.
-   PRIYA is the confirmed boutique name; keep brand assets and business details easy to
    rename.
-   Clothing, jewellery, and accessories need flexible product
    attributes rather than one fixed size model.
-   Initial product data may be seeded or entered through the admin
    dashboard.

------------------------------------------------------------------------

## 2. Architecture

### 2.1 Architecture approach

Use a **Next.js full-stack application**. The storefront, admin
interface, and server-side application logic live in one codebase. This
avoids maintaining a separate frontend and backend service for the
initial version.

Next.js App Router supports server-rendered pages and server-side
functions. Use Server Components by default, and add Client Components
only where browser interaction or local state is required.

### 2.2 High-level architecture

``` text
Customer / Admin Browser
          |
          v
     Next.js App
   (App Router)
          |
          +-------------------------------+
          |                               |
          v                               v
  Storefront & Admin UI          Server-side application
                                (Server Components,
                                 Server Actions,
                                 Route Handlers)
                                          |
              +---------------------------+---------------------+
              |                           |                     |
              v                           v                     v
       Supabase                    Cloudinary              Razorpay
   PostgreSQL + Auth              Product media          Payment gateway
              |
              v
       Store data:
   products, variants,
   carts, orders, users,
   inventory, collections

          |
          v
       Vercel hosting
```

### 2.3 Main architectural responsibilities

**Next.js application** - Render public storefront pages. - Render
protected account and admin pages. - Handle server-side business
logic. - Expose Route Handlers for payment callbacks and webhooks. -
Generate metadata and search-engine-friendly pages.

**Supabase** - Store application data in PostgreSQL. - Manage customer
authentication. - Enforce database access through Row Level Security
(RLS). - Store profiles, products, variants, carts, wishlists, orders,
and related records.

**Cloudinary** - Store and deliver product and campaign images. - Resize
and optimize images for different screen sizes. - Provide responsive
image transformations.

**Razorpay** - Create payment orders through trusted server-side code. -
Support eligible Indian payment methods such as UPI, cards, and
netbanking. - Verify payment results before an order is marked paid. -
Process payment webhooks.

**Vercel** - Host and deploy the Next.js application. - Provide
deployment previews and production deployments. - Deliver the
application through its hosting and CDN infrastructure.

### 2.4 Rendering and state strategy

-   Use Server Components for public product and collection pages where
    possible.
-   Use Client Components for interactive elements such as mobile
    navigation, filters, quantity controls, and cart interactions.
-   Use Zustand for shared client-side state such as the active cart and
    wishlist UI.
-   Use Supabase as the persistent source of truth for authenticated
    customer data and orders.
-   Use server-side validation and database prices for checkout
    calculations.
-   Cache public catalogue data carefully and revalidate it when admins
    update products.

### 2.5 Security principles

-   Keep Supabase service-role credentials and Razorpay secret keys on
    the server only.
-   Never expose private credentials through `NEXT_PUBLIC_` environment
    variables.
-   Enable and test RLS policies on protected Supabase tables.
-   Enforce admin authorization on the server for every protected admin
    operation.
-   Never trust a role value supplied by the browser.
-   Recalculate product prices, discounts, shipping, and totals on the
    server.
-   Verify Razorpay signatures and webhook events before confirming
    payment.
-   Do not store card numbers, CVV, or other sensitive payment
    credentials.
-   Use database transactions or atomic operations for order creation
    and stock changes.
-   Validate all user input on the server, even if client-side
    validation is also present.

------------------------------------------------------------------------

## 3. Technology Stack

  -----------------------------------------------------------------------
  Layer                   Technology              Responsibility
  ----------------------- ----------------------- -----------------------
  Full-stack framework    Next.js App Router      Storefront, admin,
                                                  server-side logic

  UI library              React                   Component-based user
                                                  interface

  Language                TypeScript              Static typing and
                                                  maintainability

  Styling                 Tailwind CSS            Responsive styling and
                                                  design tokens

  UI components           shadcn/ui               Accessible, reusable
                                                  interface primitives

  Icons                   Lucide React            Interface icons

  Animation               Motion                  Subtle transitions and
                                                  interactions

  Client state            Zustand                 Cart and wishlist
                                                  interaction state

  Forms                   React Hook Form         Form state and
                                                  submission

  Validation              Zod                     Shared input schemas
                                                  and validation

  Database                Supabase PostgreSQL     Persistent relational
                                                  application data

  Authentication          Supabase Auth           Customer sign-up,
                                                  login, and recovery

  Image management        Cloudinary              Product image storage
                                                  and optimization

  Payment gateway         Razorpay                Indian online payments

  Hosting                 Vercel                  Application hosting and
                                                  deployment

  Version control         Git and GitHub          Source control and
                                                  collaboration
  -----------------------------------------------------------------------

### 3.1 Technology selection notes

-   The project uses Next.js as a full-stack framework; a separate
    Spring Boot API is not part of the initial architecture.
-   Zustand is for shared client-side state, not a database.
-   Supabase PostgreSQL is the persistent data store.
-   Cloudinary is for media, not product or order records.
-   Razorpay handles payment processing; the application remains
    responsible for order state and payment verification.
-   Integrations should be added when their corresponding features are
    implemented, rather than configuring every service during the
    initial UI setup.

### 3.2 Suggested environment variables

Create `.env.local` for local development and keep it out of Git.

``` env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Only values that must be available to browser code should use the
`NEXT_PUBLIC_` prefix. The Supabase service-role key, Cloudinary API
secret, and Razorpay secrets must remain server-only. Confirm the
current SDK conventions and key names when implementing each
integration.

------------------------------------------------------------------------

## 4. Screen Map and Navigation

### 4.1 Storefront navigation

**Desktop primary navigation** - Home - Shop - Clothing - Jewellery -
Accessories - Collections - New Arrivals - About Us - Contact

**Header utility actions** - Search - Account - Wishlist - Shopping bag
/ Cart

**Mobile navigation** - Compact brand header - Menu drawer - Search
access - Account access - Wishlist and cart access - Touch-friendly
category navigation

### 4.2 Customer-facing routes

  -----------------------------------------------------------------------
  Route                   Screen                  Purpose
  ----------------------- ----------------------- -----------------------
  `/`                     Home                    Brand introduction,
                                                  promotions, categories,
                                                  featured products

  `/shop`                 Shop                    Browse the full product
                                                  catalogue

  `/category/[slug]`      Category                Browse clothing,
                                                  jewellery, or
                                                  accessories

  `/collections`          Collections             Browse curated
                                                  collections

  `/collections/[slug]`   Collection detail       View products in a
                                                  collection

  `/new-arrivals`         New arrivals            Discover recently added
                                                  products

  `/products/[slug]`      Product detail          Images, description,
                                                  options, price, stock,
                                                  and purchase actions

  `/search`               Search results          Search products and
                                                  refine results

  `/wishlist`             Wishlist                View saved products

  `/cart`                 Shopping cart           Review products and
                                                  quantities

  `/checkout`             Checkout                Address, delivery,
                                                  order review, and
                                                  payment

  `/order-success`        Order confirmation      Show confirmed order
                                                  information

  `/login`                Login                   Customer sign-in

  `/register`             Registration            Create a customer
                                                  account

  `/account`              Account                 Customer profile
                                                  overview

  `/account/orders`       My orders               Order history and
                                                  status

  `/account/addresses`    Addresses               Manage delivery
                                                  addresses

  `/about`                About us                Brand story

  `/contact`              Contact                 Customer support
                                                  information

  `/policies/[slug]`      Policies                Shipping, returns,
                                                  privacy, and terms
  -----------------------------------------------------------------------

### 4.3 Admin routes

  Route                         Screen         Purpose
  ----------------------------- -------------- ----------------------------------
  `/admin`                      Dashboard      Sales summary and store overview
  `/admin/products`             Products       List and manage products
  `/admin/products/new`         Add product    Create a product
  `/admin/products/[id]/edit`   Edit product   Update product details
  `/admin/categories`           Categories     Manage product categories
  `/admin/collections`          Collections    Manage curated collections
  `/admin/inventory`            Inventory      Track stock and variants
  `/admin/orders`               Orders         View and manage orders
  `/admin/orders/[id]`          Order detail   Review and update an order
  `/admin/customers`            Customers      View customer records
  `/admin/coupons`              Coupons        Manage discounts
  `/admin/reviews`              Reviews        Moderate product reviews
  `/admin/settings`             Settings       Store configuration

### 4.4 Navigation behavior

-   Use real Next.js links for internal navigation.
-   Keep the header consistent across storefront pages.
-   Make cart and wishlist counts visible in the header.
-   Use a mobile drawer for navigation on small screens.
-   Preserve filter and sorting state in URL search parameters where
    practical.
-   Provide breadcrumbs on category, collection, and product detail
    pages.
-   Protect account and admin routes through server-side authentication
    and authorization.

------------------------------------------------------------------------

## 5. Core Features

### 5.1 Homepage

-   Announcement bar for offers or delivery messages.
-   Responsive header and navigation.
-   Large editorial hero banner with a primary shopping action.
-   Category cards for Clothing, Jewellery, and Accessories.
-   New arrivals section.
-   Featured or best-selling products.
-   Curated collection banners.
-   Brand story / why shop with us.
-   Genuine customer testimonials when available.
-   Optional Instagram/social section.
-   Newsletter sign-up.
-   Footer with contact, policies, and social links.

### 5.2 Product catalogue

-   Product grid with responsive layouts.
-   Category and collection browsing.
-   Search by product name and relevant attributes.
-   Filters for category, price, availability, colour, size, and other
    applicable attributes.
-   Sorting by newest, price, and popularity when meaningful data is
    available.
-   Pagination or incremental loading.
-   Clear out-of-stock state.
-   Product badges such as New, Sale, or Featured when accurate.

### 5.3 Product details

-   Product name and description.
-   Multiple product images and a primary image.
-   Price and optional comparison/discount price.
-   Product category and relevant attributes.
-   Variant selection where applicable.
-   Stock availability.
-   Quantity selection.
-   Add to cart and buy now actions.
-   Delivery and return information.
-   Related products.

**Flexible product options are important:** clothing may have sizes and
colours; jewellery may have material, finish, or length; accessories may
have colour or dimensions. Do not require every product to have a
clothing size.

### 5.4 Authentication and customer account

-   Customer registration and login.
-   Email verification where configured.
-   Password recovery.
-   Customer profile.
-   Saved delivery addresses.
-   Protected order history.
-   Account sign-out.

Supabase Auth manages authentication credentials. A separate profile
record stores application-specific customer details.

### 5.5 Cart and wishlist

-   Add and remove cart items.
-   Update item quantity.
-   Identify cart items by selected product variant where variants
    exist.
-   Show subtotal, applicable discounts, shipping, and total.
-   Persist guest cart locally.
-   Synchronize cart data for signed-in customers.
-   Save wishlist items for signed-in customers.
-   Validate current price and stock on the server before checkout.

### 5.6 Checkout and orders

-   Select or add a delivery address.
-   Review cart items and quantities.
-   Calculate shipping and discounts on the server.
-   Show final payable total in INR.
-   Create a pending order.
-   Initiate Razorpay payment securely from the server.
-   Verify payment signature and webhook events.
-   Confirm the order only after reliable payment confirmation.
-   Support COD only if the business chooses to offer it.
-   Display order confirmation and order history.

Suggested order statuses:

-   `PENDING`
-   `CONFIRMED`
-   `PROCESSING`
-   `SHIPPED`
-   `DELIVERED`
-   `CANCELLED`
-   `RETURN_REQUESTED`
-   `RETURNED`

Suggested payment statuses:

-   `PENDING`
-   `PAID`
-   `FAILED`
-   `REFUNDED`

Order status and payment status should be separate fields.

### 5.7 Admin dashboard

-   Sales and order summary.
-   Recent orders.
-   Product creation, editing, publishing, and archiving.
-   Multiple product image uploads.
-   Category and collection management.
-   Product variant and inventory management.
-   Order review and status updates.
-   Customer overview.
-   Coupon management.
-   Review moderation.
-   Store settings and basic analytics.

### 5.8 Later enhancements

These are useful but can follow the first working release:

-   Product reviews and ratings.
-   Coupon and promotional campaigns.
-   Newsletter integration.
-   WhatsApp support or order notifications.
-   Courier/shipping provider integration and tracking.
-   Recently viewed products.
-   Advanced analytics and recommendations.
-   Abandoned cart reminders.

------------------------------------------------------------------------

## 6. Data Model and Database Schema

Use PostgreSQL with UUID primary keys, foreign keys, indexes, unique
constraints, check constraints, and appropriate RLS policies.

Store monetary values using `NUMERIC`, not floating-point types. Store
timestamps consistently (normally `TIMESTAMPTZ`). Use database
constraints to protect data integrity.

### 6.1 Entity relationship overview

``` text
auth.users
    |
    +---- profiles
    |
    +---- addresses
    |
    +---- carts ---- cart_items ---- product_variants ---- products
    |
    +---- wishlists ------------------------------ products
    |
    +---- orders ---- order_items
             |
             +---- payments
             |
             +---- order_status_history

categories ---- products ---- product_images
                    |
                    +---- product_variants
                    |
                    +---- collection_products ---- collections

products ---- reviews
coupons  ---- (redemption relationship, when implemented)
```

### 6.2 Core tables

#### 1. `profiles`

Supabase Auth stores login credentials. `profiles` stores
application-specific user information.

  Column         Suggested type   Notes
  -------------- ---------------- -----------------------------------------------
  `id`           UUID             Primary key; references `auth.users.id`
  `full_name`    TEXT             Customer name
  `phone`        TEXT             Contact number
  `role`         TEXT             `customer` or `admin`; controlled server-side
  `avatar_url`   TEXT             Optional profile image
  `created_at`   TIMESTAMPTZ      Creation timestamp
  `updated_at`   TIMESTAMPTZ      Last update

#### 2. `categories`

  Column          Suggested type   Notes
  --------------- ---------------- -------------------------
  `id`            UUID             Primary key
  `name`          TEXT             Category name
  `slug`          TEXT             Unique URL slug
  `description`   TEXT             Optional description
  `image_url`     TEXT             Optional category image
  `is_active`     BOOLEAN          Visibility
  `created_at`    TIMESTAMPTZ      Creation timestamp

Seed categories can include Clothing, Jewellery, and Accessories.
Subcategories can be introduced as needed.

#### 3. `products`

  Column               Suggested type   Notes
  -------------------- ---------------- --------------------------------------
  `id`                 UUID             Primary key
  `category_id`        UUID             Foreign key to categories
  `name`               TEXT             Product name
  `slug`               TEXT             Unique URL slug
  `description`        TEXT             Product description
  `fabric`             TEXT             Optional clothing-specific attribute
  `base_price`         NUMERIC(10,2)    Base price in INR
  `compare_at_price`   NUMERIC(10,2)    Optional reference price
  `is_featured`        BOOLEAN          Featured product flag
  `is_active`          BOOLEAN          Published/active state
  `created_at`         TIMESTAMPTZ      Creation timestamp
  `updated_at`         TIMESTAMPTZ      Last update

Do not assume every product has a fabric. Additional category-specific
attributes can be represented using structured attributes or a carefully
designed JSONB field.

#### 4. `product_images`

  Column         Suggested type   Notes
  -------------- ---------------- ------------------------------
  `id`           UUID             Primary key
  `product_id`   UUID             Foreign key to products
  `image_url`    TEXT             Cloudinary delivery URL
  `alt_text`     TEXT             Accessible image description
  `sort_order`   INTEGER          Display order
  `is_primary`   BOOLEAN          Primary image flag

#### 5. `product_variants`

  -----------------------------------------------------------------------
  Column                  Suggested type          Notes
  ----------------------- ----------------------- -----------------------
  `id`                    UUID                    Primary key

  `product_id`            UUID                    Foreign key to products

  `sku`                   TEXT                    Unique stock keeping
                                                  unit

  `size`                  TEXT                    Nullable; clothing size

  `color`                 TEXT                    Nullable

  `attributes`            JSONB                   Flexible options such
                                                  as material, finish, or
                                                  length

  `additional_price`      NUMERIC(10,2)           Optional price
                                                  adjustment

  `stock_quantity`        INTEGER                 Available stock

  `is_active`             BOOLEAN                 Variant availability
  -----------------------------------------------------------------------

Products without selectable options can have a default variant. Ensure
the application has a consistent rule for stock and pricing at product
versus variant level.

#### 6. `collections`

  Column          Suggested type   Notes
  --------------- ---------------- ------------------------
  `id`            UUID             Primary key
  `name`          TEXT             Collection name
  `slug`          TEXT             Unique URL slug
  `description`   TEXT             Collection description
  `banner_url`    TEXT             Optional banner
  `is_active`     BOOLEAN          Visibility

#### 7. `collection_products`

  Column            Suggested type   Notes
  ----------------- ---------------- ----------------------------
  `collection_id`   UUID             Foreign key to collections
  `product_id`      UUID             Foreign key to products
  `sort_order`      INTEGER          Display order

Use a composite primary key or unique constraint on (`collection_id`,
`product_id`).

#### 8. `addresses`

  Column             Suggested type   Notes
  ------------------ ---------------- -------------------------
  `id`               UUID             Primary key
  `user_id`          UUID             Foreign key to profiles
  `full_name`        TEXT             Recipient
  `phone`            TEXT             Contact number
  `address_line_1`   TEXT             Required address
  `address_line_2`   TEXT             Optional
  `city`             TEXT             City
  `state`            TEXT             State
  `postal_code`      TEXT             PIN code
  `country`          TEXT             Country; default India
  `is_default`       BOOLEAN          Default address

#### 9. `carts`

  Column         Suggested type   Notes
  -------------- ---------------- -----------------------------------
  `id`           UUID             Primary key
  `user_id`      UUID             Nullable for guest carts
  `session_id`   TEXT             Guest session identifier, if used
  `created_at`   TIMESTAMPTZ      Creation timestamp
  `updated_at`   TIMESTAMPTZ      Last update

Define a safe guest-cart strategy. Do not expose or trust arbitrary
session identifiers as authorization.

#### 10. `cart_items`

  Column         Suggested type   Notes
  -------------- ---------------- ---------------------------------
  `id`           UUID             Primary key
  `cart_id`      UUID             Foreign key to carts
  `variant_id`   UUID             Foreign key to product_variants
  `quantity`     INTEGER          Must be greater than zero
  `created_at`   TIMESTAMPTZ      Creation timestamp

Use a unique constraint on (`cart_id`, `variant_id`) so the same variant
is not duplicated unintentionally.

#### 11. `wishlists`

  Column         Suggested type   Notes
  -------------- ---------------- -------------------------
  `id`           UUID             Primary key
  `user_id`      UUID             Foreign key to profiles
  `product_id`   UUID             Foreign key to products
  `created_at`   TIMESTAMPTZ      Creation timestamp

Use a unique constraint on (`user_id`, `product_id`).

#### 12. `orders`

  Column               Suggested type   Notes
  -------------------- ---------------- -------------------------------------
  `id`                 UUID             Primary key
  `order_number`       TEXT             Unique customer-facing order number
  `user_id`            UUID             Customer reference
  `address_snapshot`   JSONB            Delivery address as placed
  `subtotal`           NUMERIC(10,2)    Item subtotal
  `shipping_amount`    NUMERIC(10,2)    Shipping charge
  `discount_amount`    NUMERIC(10,2)    Discount
  `total_amount`       NUMERIC(10,2)    Final amount
  `order_status`       TEXT             Order lifecycle
  `payment_status`     TEXT             Payment lifecycle
  `created_at`         TIMESTAMPTZ      Order timestamp

The address snapshot preserves the original delivery address even if the
customer later edits their saved address.

#### 13. `order_items`

  Column             Suggested type   Notes
  ------------------ ---------------- -------------------------------
  `id`               UUID             Primary key
  `order_id`         UUID             Foreign key to orders
  `variant_id`       UUID             Nullable reference to variant
  `product_name`     TEXT             Product name snapshot
  `sku`              TEXT             SKU snapshot
  `selected_size`    TEXT             Snapshot, if applicable
  `selected_color`   TEXT             Snapshot, if applicable
  `quantity`         INTEGER          Purchased quantity
  `unit_price`       NUMERIC(10,2)    Price at purchase
  `subtotal`         NUMERIC(10,2)    Item line total

Order item snapshots preserve the purchased product description and
price if the catalogue changes later.

#### 14. `payments`

  Column                 Suggested type   Notes
  ---------------------- ---------------- ----------------------------
  `id`                   UUID             Primary key
  `order_id`             UUID             Foreign key to orders
  `gateway`              TEXT             Example: Razorpay
  `gateway_order_id`     TEXT             Gateway order identifier
  `gateway_payment_id`   TEXT             Gateway payment identifier
  `amount`               NUMERIC(10,2)    Payment amount
  `payment_status`       TEXT             Payment state
  `verified_at`          TIMESTAMPTZ      Verification timestamp
  `created_at`           TIMESTAMPTZ      Creation timestamp

Add appropriate uniqueness constraints for gateway identifiers. Never
store card numbers or CVV.

### 6.3 Supporting tables for later releases

  Table                      Purpose
  -------------------------- ----------------------------------------
  `coupons`                  Discount code definitions and rules
  `coupon_redemptions`       Track customer coupon use
  `reviews`                  Product ratings and reviews
  `order_status_history`     Audit trail of order status changes
  `inventory_movements`      Stock adjustments and movement history
  `newsletter_subscribers`   Newsletter subscription records

### 6.4 Database integrity and access rules

-   Add indexes to commonly queried fields such as product slug,
    category, active status, order user, order status, and foreign keys.
-   Add unique constraints for slugs, SKUs, order numbers, and relevant
    junction pairs.
-   Add check constraints for positive quantities and non-negative
    prices/stock.
-   Use RLS to restrict customer access to their own profiles,
    addresses, carts, wishlists, and orders.
-   Public users should only read published/active catalogue data.
-   Admin writes must be protected by trusted server-side role checks.
-   Use atomic database functions or transactions for stock reservation,
    order creation, and payment-related updates.
-   Define deletion behavior carefully; order history should not
    disappear when a product is archived or removed from the active
    catalogue.

------------------------------------------------------------------------

## 7. UI/UX Guidelines

### 7.1 Brand personality

The storefront should feel: - Premium - Elegant - Modern - Warm -
Fashion-focused - Trustworthy - Easy to use

Avoid an overly decorative interface, excessive gradients, crowded
layouts, or animations that interfere with shopping.

### 7.2 Initial colour palette

  Colour           Hex         Intended use
  ---------------- ----------- ------------------------------------
  Warm Ivory       `#F7F3EC`   Main page background
  Deep Burgundy    `#6D263B`   Primary buttons and brand accents
  Champagne Gold   `#C5A572`   Small decorative accents
  Charcoal         `#292522`   Main text
  Soft Beige       `#E8DFD3`   Secondary backgrounds and surfaces
  White            `#FFFFFF`   Cards and clean content surfaces

These are initial design tokens and can be refined after the first
visual prototype.

### 7.3 Typography

-   **Headings:** Playfair Display
-   **Body and UI:** Inter
-   Use a clear hierarchy for page titles, section titles, product
    names, prices, and helper text.
-   Keep body text readable on mobile devices.
-   Avoid using too many font weights and sizes.

### 7.4 Layout and components

**Header** - Minimal and consistent. - Sticky behavior only if it
improves browsing. - Clear logo and category navigation. - Search,
account, wishlist, and cart access. - Mobile navigation drawer.

**Hero** - Strong editorial fashion photography. - One clear headline
and primary action. - Avoid placing important text over visually busy
areas.

**Product cards** - Consistent image ratios. - Clear product names and
INR prices. - Optional accurate badges such as New or Sale. - Wishlist
action. - Quick add only when the product's options allow it. - Visible
focus and hover states.

**Product detail** - Prominent product imagery. - Clear price and
options. - Easy-to-find add-to-cart action. - Stock and delivery
information. - Descriptive material, size, care, and return information
where relevant.

**Forms** - Clear labels and helpful validation messages. -
Keyboard-accessible controls. - Avoid asking for unnecessary customer
information.

**Admin** - Prioritize clarity and operational efficiency over
decorative styling. - Use tables, filters, status labels, and
confirmation dialogs where appropriate.

### 7.5 Responsive behavior

Design mobile-first and test at: - Small mobile - Large mobile -
Tablet - Laptop - Desktop

Requirements: - No horizontal overflow. - Comfortable touch targets. -
Responsive product grids. - Mobile filter drawer. - Readable typography
and spacing. - Responsive product image galleries. - Navigation that
works without hover. - Checkout forms that are easy to complete on a
phone.

### 7.6 Motion and interaction

-   Use subtle transitions for menus, drawers, cards, and buttons.
-   Keep motion short and purposeful.
-   Avoid animations that delay navigation or block shopping actions.
-   Respect reduced-motion preferences.
-   Provide clear loading, success, empty, and error states.

### 7.7 Accessibility

-   Use semantic HTML.
-   Provide meaningful alt text for product images.
-   Ensure keyboard navigation and visible focus states.
-   Maintain sufficient colour contrast.
-   Associate form labels with inputs.
-   Do not communicate status using colour alone.
-   Ensure dialogs and drawers are keyboard accessible.

### 7.8 Image guidelines

-   Use high-quality, properly licensed product and campaign
    photography.
-   Keep image aspect ratios consistent within a product grid.
-   Use Next.js image optimization for local or configured remote
    sources.
-   Use responsive Cloudinary transformations when integrated.
-   Reserve image dimensions to prevent layout shifts.
-   Lazy-load below-the-fold imagery; do not unnecessarily lazy-load the
    main hero/LCP image.
-   Avoid oversized source images and unnecessary image downloads.

### 7.9 Performance goals

Target the following Core Web Vitals for the 75th percentile of real
user visits:

  Metric   Target
  -------- --------------------------
  LCP      2.5 seconds or less
  INP      200 milliseconds or less
  CLS      0.1 or less

Additional practices: - Prefer server rendering for public catalogue
pages. - Keep client-side JavaScript limited to interactive areas. -
Paginate or incrementally load large product lists. - Avoid unnecessary
re-renders and duplicate requests. - Add database indexes for catalogue
and order queries. - Use caching and revalidation deliberately. -
Measure performance on real mobile devices and slower networks.

These are goals, not guarantees; actual performance depends on
implementation, hosting, content, network, and third-party services.

------------------------------------------------------------------------

## 8. Suggested Project Folder Structure

``` text
priya-boutique/
├── public/
│   ├── images/
│   │   ├── banners/
│   │   ├── products/
│   │   └── categories/
│   └── icons/
│
├── src/
│   ├── app/
│   │   ├── (store)/
│   │   │   ├── page.tsx
│   │   │   ├── shop/
│   │   │   ├── category/
│   │   │   ├── collections/
│   │   │   ├── new-arrivals/
│   │   │   ├── products/
│   │   │   ├── search/
│   │   │   ├── wishlist/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   ├── about/
│   │   │   └── contact/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── account/
│   │   ├── admin/
│   │   ├── api/
│   │   │   ├── payments/
│   │   │   └── webhooks/
│   │   ├── globals.css
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── home/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── admin/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── wishlist/
│   │   ├── orders/
│   │   └── payments/
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   ├── cloudinary/
│   │   ├── razorpay/
│   │   └── utils/
│   ├── stores/
│   ├── types/
│   └── validations/
│
├── supabase/
│   ├── migrations/
│   └── seed.sql
│
├── .env.example
├── .env.local
├── components.json
├── next.config.ts
├── package.json
└── tsconfig.json
```

The folder structure is a target architecture. Create folders as
features are introduced; do not add empty abstractions just to match the
diagram.

------------------------------------------------------------------------

## 9. Development Roadmap

### Stage 1 --- Foundation and storefront UI

-   Create the Next.js project with TypeScript and Tailwind CSS.
-   Initialize shadcn/ui.
-   Configure fonts, colours, and shared design tokens.
-   Build announcement bar, header, mobile navigation, and footer.
-   Build homepage hero, category sections, featured products, and brand
    story.
-   Make the layout responsive.
-   Add loading and empty states where useful.
-   Commit the foundation to GitHub.

**Stage 1 deliverable:** A polished, responsive storefront prototype
using temporary/sample content.

### Stage 2 --- Catalogue and database

-   Create Supabase project and PostgreSQL schema.
-   Add categories, products, images, collections, and variants.
-   Add sample/seed data.
-   Integrate Cloudinary.
-   Build shop, category, collection, search, filter, and product detail
    pages.
-   Add catalogue caching and revalidation.

**Stage 2 deliverable:** A working product catalogue backed by the
database.

### Stage 3 --- Customer features

-   Integrate Supabase Auth.
-   Build registration, login, and account pages.
-   Add customer profiles and addresses.
-   Implement cart and wishlist.
-   Support guest cart persistence and signed-in cart synchronization.
-   Build order history.

**Stage 3 deliverable:** Customers can sign in and manage their shopping
activity.

### Stage 4 --- Checkout and payments

-   Implement server-side checkout calculations.
-   Create pending orders and order item snapshots.
-   Add inventory reservation/stock handling.
-   Integrate Razorpay.
-   Verify payment signatures and webhooks.
-   Add order confirmation and payment failure handling.
-   Define shipping charges, delivery rules, and return policies.

**Stage 4 deliverable:** A secure end-to-end order and payment flow.

### Stage 5 --- Admin dashboard

-   Add protected admin authorization.
-   Build dashboard and sales summary.
-   Implement product, category, collection, and image management.
-   Implement inventory and order management.
-   Add customer management.
-   Add coupons, reviews, and settings as required.

**Stage 5 deliverable:** Authorized staff can operate the store.

### Stage 6 --- Testing, security, and production deployment

-   Test customer and admin workflows.
-   Test RLS and authorization rules.
-   Test payment success, failure, duplicate webhook, and retry
    scenarios.
-   Test stock consistency and concurrent checkout behavior.
-   Check responsive layouts and accessibility.
-   Optimize images, database queries, and page performance.
-   Configure production environment variables and domain.
-   Deploy to an appropriate commercial hosting plan.
-   Complete production payment and order verification.

**Stage 6 deliverable:** A tested production deployment ready for real
customers.

------------------------------------------------------------------------

## 10. MVP Priorities

### Required for the first usable store

1.  Responsive homepage and navigation.
2.  Product categories and catalogue.
3.  Product detail pages and variants.
4.  Search, filters, and sorting.
5.  Customer authentication.
6.  Cart and wishlist.
7.  Address and checkout flow.
8.  Order creation and payment verification.
9.  Admin product and inventory management.
10. Admin order management.

### Can follow after the first release

-   Reviews and ratings.
-   Coupons and advanced promotions.
-   Newsletter automation.
-   WhatsApp notifications.
-   Advanced analytics.
-   Product recommendations.
-   Recently viewed products.

------------------------------------------------------------------------

## 11. Open Decisions

The following business decisions should be confirmed before production
implementation:

-   Final brand name, logo, and domain.
-   Exact product subcategories and product attribute requirements.
-   Whether guest checkout will be allowed.
-   Shipping provider, serviceable PIN codes, charges, and delivery
    estimates.
-   Whether Cash on Delivery (COD) will be offered.
-   Return, exchange, cancellation, and refund policies.
-   Tax/GST requirements and invoice format.
-   Product photography and content ownership.
-   Admin users and permission levels.
-   Commercial hosting and service-plan budget.

------------------------------------------------------------------------

## 12. Definition of Done

The project should not be considered production-ready until:

-   Customers can browse and search published products.
-   Product variants and inventory are validated correctly.
-   Customer accounts and private data are protected.
-   Cart and checkout totals are calculated on the server.
-   Orders preserve product, price, and address snapshots.
-   Payment status is confirmed through verified gateway events.
-   Stock updates are safe under concurrent purchases.
-   Admin access is enforced server-side.
-   RLS and other security rules have been tested.
-   Mobile, tablet, and desktop experiences have been checked.
-   Accessibility, SEO, and performance have been reviewed.
-   Production environment variables, domain, backups, and operational
    processes are configured.

------------------------------------------------------------------------

**Document note:** This is the working project blueprint for PRIYA. It
records the agreed direction and proposed architecture; implementation
details, service pricing, payment configuration, shipping rules, and
legal/tax requirements must be verified when those stages begin.
