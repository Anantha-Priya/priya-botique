import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Gem,
  Plus,
  Shirt,
  Sparkles,
} from "lucide-react";
import {
  AdminProductList,
  type AdminProductListItem,
} from "@/components/admin/admin-product-list";
import { getAdminContext } from "@/lib/admin/get-admin-context";

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

interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  base_price: string | number;
  is_active: boolean;
  is_pinned?: boolean;
  fabric: string | null;
  categories: { name: string; slug: string } | { name: string; slug: string }[] | null;
  product_images: {
    image_url: string;
    alt_text: string;
    is_primary: boolean;
    sort_order: number;
  }[];
  product_variants: { stock_quantity: number; is_active: boolean }[];
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
    redirect("/account");
  }

  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let migrationPending = false;
  let { data: products, error, count } = await supabase
    .from("products")
    .select(
      "id,name,slug,base_price,is_active,is_pinned,fabric,categories(name,slug),product_images(image_url,alt_text,is_primary,sort_order),product_variants(stock_quantity,is_active)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to)
    .overrideTypes<AdminProductRow[], { merge: false }>();

  if (error && (error.code === "42703" || error.code === "PGRST204")) {
    migrationPending = true;
    const fallback = await supabase
      .from("products")
      .select(
        "id,name,slug,base_price,is_active,fabric,categories(name,slug),product_images(image_url,alt_text,is_primary,sort_order),product_variants(stock_quantity,is_active)",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to)
      .overrideTypes<AdminProductRow[], { merge: false }>();
    products = fallback.data;
    error = fallback.error;
    count = fallback.count;
  }

  if (error) {
    throw new Error(`Unable to load products: ${error.message}`);
  }

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const listItems: AdminProductListItem[] = (products ?? []).map((product) => {
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

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      base_price: product.base_price,
      is_active: product.is_active,
      is_pinned: Boolean(product.is_pinned),
      fabric: product.fabric,
      categoryName: categoryRecord?.name ?? "Uncategorized",
      categorySlug: categoryRecord?.slug ?? "",
      primaryImageUrl: primaryImage?.image_url ?? null,
      primaryImageAlt: primaryImage?.alt_text || product.name,
      imageCount: images.length,
      totalStock,
    };
  });

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-burgundy hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to Dashboard
        </Link>
        <h1 className="mt-3 font-heading text-4xl font-medium text-foreground">
          Manage Products
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add new products by category, edit existing products, or pin products to feature them in New Arrivals.
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

        <AdminProductList
          initialProducts={listItems}
          migrationPending={migrationPending}
        />

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
      </section>
    </main>
  );
}
