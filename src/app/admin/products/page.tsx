import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Gem, Plus, Shirt, Sparkles } from "lucide-react";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import { formatINR } from "@/lib/format-currency";

export const metadata: Metadata = { title: "Manage products" };

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

export default function AdminProductsPage() {
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
      <AdminProductsContent />
    </Suspense>
  );
}

async function AdminProductsContent() {
  const { supabase, user, isAdmin } = await getAdminContext();

  if (!user) {
    redirect("/login?next=%2Fadmin%2Fproducts");
  }
  if (!isAdmin) {
    notFound();
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("id,name,slug,base_price,is_active,categories(name,slug)")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    throw new Error(`Unable to load products: ${error.message}`);
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
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
            Choose a category below to add a new product to PRIYA&apos;S BOUTIQUE.
          </p>
        </div>

        <Link
          href="/admin/product-images"
          className="inline-flex min-h-10 items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Upload Product Images
        </Link>
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
        <h2 id="recent-products-heading" className="font-heading text-2xl font-medium text-foreground">
          Recent Catalogue Products
        </h2>
        {products && products.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-(--shadow-card)">
            <ul className="divide-y divide-border">
              {products.map((product) => {
                const categoryRecord = Array.isArray(product.categories)
                  ? product.categories[0]
                  : product.categories;
                return (
                  <li
                    key={product.id}
                    className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:px-6"
                  >
                    <div>
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
                        {formatINR(Number(product.base_price))} · /{product.slug}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {product.is_active ? (
                        <Link
                          href={`/products/${product.slug}`}
                          className="text-sm font-medium text-brand-burgundy underline underline-offset-4"
                        >
                          View
                        </Link>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No products found yet.</p>
        )}
      </section>
    </main>
  );
}
