import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Store } from "lucide-react";
import {
  AdminProductList,
  type AdminProductListItem,
} from "@/components/admin/admin-product-list";
import { getDeletePermissionState } from "@/lib/admin/delete-permission";
import { getAdminContext } from "@/lib/admin/get-admin-context";

export const metadata: Metadata = { title: "Manage New Arrivals" };

export default function AdminNewArrivalsPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
          <p role="status" className="text-sm text-muted-foreground">
            Loading New Arrivals manager...
          </p>
        </main>
      }
    >
      <AdminNewArrivalsContent />
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

async function AdminNewArrivalsContent() {
  const { supabase, user, isAdmin } = await getAdminContext();

  if (!user) {
    redirect("/login?next=%2Fadmin%2Fnew-arrivals");
  }
  if (!isAdmin) {
    redirect("/account");
  }

  const deletePermissionState = await getDeletePermissionState(user.id);

  let migrationPending = false;
  let { data: products, error } = await supabase
    .from("products")
    .select(
      "id,name,slug,base_price,is_active,is_pinned,fabric,categories(name,slug),product_images(image_url,alt_text,is_primary,sort_order),product_variants(stock_quantity,is_active)",
    )
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .overrideTypes<AdminProductRow[], { merge: false }>();

  if (error && (error.code === "42703" || error.code === "PGRST204")) {
    migrationPending = true;
    const fallback = await supabase
      .from("products")
      .select(
        "id,name,slug,base_price,is_active,fabric,categories(name,slug),product_images(image_url,alt_text,is_primary,sort_order),product_variants(stock_quantity,is_active)",
      )
      .order("created_at", { ascending: false })
      .overrideTypes<AdminProductRow[], { merge: false }>();
    products = fallback.data;
    error = fallback.error;
  }

  if (error) {
    throw new Error(`Unable to load products: ${error.message}`);
  }

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
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-burgundy hover:underline"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to Dashboard
          </Link>
          <h1 className="mt-3 font-heading text-3xl font-medium text-foreground sm:text-4xl">
            Manage New Arrivals
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pin or unpin products from Clothing, Jewellery, and Accessories to control what appears in the storefront New Arrivals section.
          </p>
        </div>

        <Link
          href="/new-arrivals"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-brand-burgundy hover:text-brand-burgundy"
        >
          <Store className="size-4 text-brand-burgundy" aria-hidden="true" />
          Preview Storefront New Arrivals
        </Link>
      </div>

      <section className="mt-8" aria-label="Pin or unpin products for New Arrivals">
        <AdminProductList
          initialProducts={listItems}
          migrationPending={migrationPending}
          initialDeletePermission={deletePermissionState}
        />
      </section>
    </main>
  );
}
