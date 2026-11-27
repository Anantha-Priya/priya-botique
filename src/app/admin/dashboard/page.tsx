import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowRight,
  Gem,
  Package,
  Pencil,
  Pin,
  PlusCircle,
  Shirt,
  Sparkles,
  Store,
} from "lucide-react";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import { optimizeCloudinaryImageUrl } from "@/lib/cloudinary-image";
import { formatINR } from "@/lib/format-currency";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
          <p role="status" className="text-sm text-muted-foreground">
            Loading dashboard overview...
          </p>
        </main>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}

interface DashboardProductRow {
  id: string;
  name: string;
  slug: string;
  base_price: string | number;
  is_active: boolean;
  is_pinned?: boolean;
  categories: { name: string; slug: string } | { name: string; slug: string }[] | null;
  product_images: {
    image_url: string;
    alt_text: string;
    is_primary: boolean;
    sort_order: number;
  }[];
}

async function AdminDashboardContent() {
  const { supabase, user, isAdmin, fullName } = await getAdminContext();

  if (!user) {
    redirect("/login?next=%2Fadmin%2Fdashboard");
  }
  if (!isAdmin) {
    redirect("/account");
  }

  let migrationPending = false;
  let { data: allProducts, error: productsError } = await supabase
    .from("products")
    .select(
      "id,name,slug,base_price,is_active,is_pinned,categories(name,slug),product_images(image_url,alt_text,is_primary,sort_order)",
    )
    .order("created_at", { ascending: false })
    .overrideTypes<DashboardProductRow[], { merge: false }>();

  if (productsError && (productsError.code === "42703" || productsError.code === "PGRST204")) {
    migrationPending = true;
    const fallback = await supabase
      .from("products")
      .select(
        "id,name,slug,base_price,is_active,categories(name,slug),product_images(image_url,alt_text,is_primary,sort_order)",
      )
      .order("created_at", { ascending: false })
      .overrideTypes<DashboardProductRow[], { merge: false }>();
    allProducts = fallback.data;
    productsError = fallback.error;
  }

  if (productsError) {
    throw new Error(`Unable to load dashboard metrics: ${productsError.message}`);
  }

  const rows = allProducts ?? [];
  const totalProducts = rows.length;

  let clothingCount = 0;
  let jewelleryCount = 0;
  let accessoriesCount = 0;
  let pinnedCount = 0;

  for (const row of rows) {
    const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories;
    const slug = cat?.slug?.toLowerCase() ?? "";
    if (slug === "clothing") clothingCount += 1;
    else if (slug === "jewellery") jewelleryCount += 1;
    else if (slug === "accessories") accessoriesCount += 1;
    if (row.is_pinned) pinnedCount += 1;
  }

  const overviewCards = [
    {
      label: "Total Products",
      value: totalProducts,
      icon: Package,
      href: "/admin/products",
    },
    {
      label: "Clothing Products",
      value: clothingCount,
      icon: Shirt,
      href: "/admin/products",
    },
    {
      label: "Jewellery Products",
      value: jewelleryCount,
      icon: Gem,
      href: "/admin/products",
    },
    {
      label: "Accessories Products",
      value: accessoriesCount,
      icon: Sparkles,
      href: "/admin/products",
    },
    {
      label: "Pinned New Arrivals",
      value: migrationPending ? "—" : pinnedCount,
      icon: Pin,
      href: "/admin/new-arrivals",
    },
  ];

  const recentProducts = rows.slice(0, 5);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <header className="border-b border-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-burgundy">
          PRIYA&apos;S BOUTIQUE · Administration
        </p>
        <h1 className="mt-2 font-heading text-3xl font-medium text-foreground sm:text-4xl">
          Welcome{fullName ? `, ${fullName}` : ""}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your boutique catalogue, product galleries, and curated New Arrivals from one place.
        </p>
      </header>

      {/* Overview cards */}
      <section aria-labelledby="overview-heading" className="mt-8">
        <h2 id="overview-heading" className="sr-only">
          Catalogue Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {overviewCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="group rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) transition-colors hover:border-brand-champagne"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-brand-beige/70 text-brand-burgundy">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <ArrowRight
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-burgundy"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-4 font-heading text-3xl font-semibold text-foreground">
                  {card.value}
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {card.label}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick Actions */}
      <section aria-labelledby="quick-actions-heading" className="mt-10">
        <h2
          id="quick-actions-heading"
          className="font-heading text-2xl font-medium text-foreground"
        >
          Quick Actions
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-3 rounded-2xl bg-brand-burgundy p-5 text-white shadow-sm transition-colors hover:bg-brand-burgundy/90"
          >
            <PlusCircle className="size-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Add New Product</p>
              <p className="text-xs text-white/80">Clothing, Jewellery, or Accessories</p>
            </div>
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 text-foreground shadow-(--shadow-card) transition-colors hover:border-brand-burgundy/60 hover:bg-brand-beige/30"
          >
            <Package className="size-5 shrink-0 text-brand-burgundy" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Manage Products</p>
              <p className="text-xs text-muted-foreground">Edit details, images &amp; stock</p>
            </div>
          </Link>

          <Link
            href="/admin/new-arrivals"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 text-foreground shadow-(--shadow-card) transition-colors hover:border-brand-burgundy/60 hover:bg-brand-beige/30"
          >
            <Pin className="size-5 shrink-0 text-brand-burgundy" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Manage New Arrivals</p>
              <p className="text-xs text-muted-foreground">Pin or unpin homepage arrivals</p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 text-foreground shadow-(--shadow-card) transition-colors hover:border-brand-burgundy/60 hover:bg-brand-beige/30"
          >
            <Store className="size-5 shrink-0 text-brand-burgundy" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">View Storefront</p>
              <p className="text-xs text-muted-foreground">Open customer boutique</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Recent products */}
      <section aria-labelledby="recent-catalogue-heading" className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2
            id="recent-catalogue-heading"
            className="font-heading text-2xl font-medium text-foreground"
          >
            Recently Added Products
          </h2>
          <Link
            href="/admin/products"
            className="text-sm font-semibold text-brand-burgundy hover:underline"
          >
            View all products
          </Link>
        </div>

        {recentProducts.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-(--shadow-card)">
            <ul className="divide-y divide-border">
              {recentProducts.map((product) => {
                const cat = Array.isArray(product.categories)
                  ? product.categories[0]
                  : product.categories;
                const images = [...(product.product_images ?? [])].sort(
                  (a, b) =>
                    Number(b.is_primary) - Number(a.is_primary) ||
                    a.sort_order - b.sort_order,
                );
                const primaryImage = images[0];

                return (
                  <li
                    key={product.id}
                    className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:px-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-brand-beige/60">
                        {primaryImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={optimizeCloudinaryImageUrl(primaryImage.image_url)}
                            alt={primaryImage.alt_text || product.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-foreground">{product.name}</p>
                          <span className="rounded-full bg-brand-beige px-2.5 py-0.5 text-xs font-medium text-foreground">
                            {cat?.name ?? "Uncategorized"}
                          </span>
                          {product.is_pinned ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-burgundy/10 px-2.5 py-0.5 text-xs font-semibold text-brand-burgundy">
                              <Pin className="size-3 fill-current" aria-hidden="true" />
                              Pinned
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {formatINR(Number(product.base_price))}
                          {!product.is_active ? " · Draft" : ""}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="inline-flex min-h-9 w-fit items-center gap-1.5 self-end rounded-lg border border-border bg-background px-4 py-1.5 text-sm font-medium text-brand-burgundy transition-colors hover:border-brand-burgundy hover:bg-brand-beige/50 sm:self-center"
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
            No products in the catalogue yet.
          </p>
        )}
      </section>
    </main>
  );
}
