import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Gem,
  Pencil,
  Plus,
  Shirt,
  Sparkles,
} from "lucide-react";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import { optimizeCloudinaryImageUrl } from "@/lib/cloudinary-image";
import { formatINR } from "@/lib/format-currency";

export const metadata: Metadata = { title: "Manage products" };

const PAGE_SIZE = 20;

const CATEGORY_CARDS = [
  {
    slug: "clothing",
    name: "Clothing",
    description: "Add sarees, lehengas, kurtis, and tailored apparel with size-wise stock.",
    icon: Shirt,
  },
  {
    slug: "jewellery",
    name: "Jewellery",
    description: "Add necklaces, earrings, bangles, and bridal sets with material & stock.",
    icon: Gem,
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "Add clutches, potlis, stoles, and hair accessories with stock.",
    icon: Sparkles,
  },
] as const;

export default function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
          <p role="status" className="text-sm text-muted-foreground">
            Loading product management...
          </p>
        </main>
      }
    >
      <AdminProductsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminProductsContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { supabase, user, isAdmin } = await getAdminContext();

  if (!user) {
    redirect("/login?next=%2Fadmin%2Fproducts");
  }
  if (!isAdmin) {
    notFound();
  }

  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: products, error, count } = await supabase
    .from("products")
    .select(
      "id,name,slug,base_price,is_active,fabric,categories(name,slug),product_images(image_url,alt_text,is_primary,sort_order),product_variants(stock_quantity,is_active)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Unable to load products: ${error.message}`);
  }

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <div>
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-burgundy hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to Account
        </Link>
        <h1 className="mt-3 font-heading text-4xl font-medium text-foreground">
          Manage Products
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add new products by category or edit existing catalogue products and their images.
        </p>
      </div>

      <section className="mt-8 grid gap-5 sm:grid-cols-3" aria-label="Add product by category">
        {CATEGORY_CARDS.map((category) => {
          const Icon = category.icon;
          return (
            <div
              key={category.slug}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-(--shadow-card)"
            >
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-brand-beige/70 text-brand-burgundy">
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-heading text-2xl font-medium text-foreground">
                  {category.name}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {category.description}
                </p>
              </div>

              <Link
                href={`/admin/products/new?category=${category.slug}`}
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-burgundy px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-burgundy/90"
              >
                <Plus className="size-4" aria-hidden="true" />
                {category.name} – Add Product
              </Link>
            </div>
          );
        })}
      </section>

      <section className="mt-12" aria-labelledby="recent-products-heading">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="recent-products-heading" className="font-heading text-2xl font-medium text-foreground">
            Recent Catalogue Products
          </h2>
          <span className="rounded-full bg-brand-beige px-3 py-1 text-xs font-semibold text-foreground">
            {totalCount} total
          </span>
        </div>

        {products && products.length > 0 ? (
          <>
            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-(--shadow-card)">
              <ul className="divide-y divide-border">
                {products.map((product) => {
                  const categoryRecord = Array.isArray(product.categories)
                    ? product.categories[0]
                    : product.categories;
                  const images = [...(product.product_images ?? [])].sort(
                    (a, b) =>
                      Number(b.is_primary) - Number(a.is_primary) ||
                      a.sort_order - b.sort_order,
                  );
                  const primaryImage = images[0];
                  const activeVariants = (product.product_variants ?? []).filter(
                    (v) => v.is_active,
                  );
                  const totalStock = activeVariants.reduce(
                    (sum, v) => sum + Math.max(0, v.stock_quantity),
                    0,
                  );

                  return (
                    <li
                      key={product.id}
                      className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:px-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-brand-beige/60">
                          {primaryImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={optimizeCloudinaryImageUrl(primaryImage.image_url)}
                              alt={primaryImage.alt_text || product.name}
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-[11px] text-muted-foreground">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-foreground">{product.name}</p>
                            <span className="rounded-full bg-brand-beige px-2.5 py-0.5 text-xs font-medium text-foreground">
                              {categoryRecord?.name ?? "Uncategorized"}
                            </span>
                            {!product.is_active ? (
                              <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                                Draft
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatINR(Number(product.base_price))} · {totalStock} in stock ·{" "}
                            {images.length} {images.length === 1 ? "image" : "images"}
                            {product.fabric ? ` · ${product.fabric}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3 self-end sm:self-center">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-1.5 text-sm font-medium text-brand-burgundy transition-colors hover:border-brand-burgundy hover:bg-brand-beige/50"
                        >
                          <Pencil className="size-3.5" aria-hidden="true" />
                          Edit
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {totalPages > 1 ? (
              <nav
                aria-label="Catalogue pagination"
                className="mt-6 flex items-center justify-between text-sm"
              >
                <p className="text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  {page > 1 ? (
                    <Link
                      href={`/admin/products?page=${page - 1}`}
                      className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-border bg-card px-3 font-medium hover:bg-secondary"
                    >
                      <ChevronLeft className="size-4" aria-hidden="true" />
                      Previous
                    </Link>
                  ) : null}
                  {page < totalPages ? (
                    <Link
                      href={`/admin/products?page=${page + 1}`}
                      className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-border bg-card px-3 font-medium hover:bg-secondary"
                    >
                      Next
                      <ChevronRight className="size-4" aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>
              </nav>
            ) : null}
          </>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No products found yet.</p>
        )}
      </section>
    </main>
  );
}
