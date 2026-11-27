import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { ProductCreateForm } from "@/components/admin/product-create-form";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import {
  CATEGORY_LABELS,
  PRODUCT_CATEGORY_SLUGS,
  type ProductCategorySlug,
} from "@/lib/admin/product-validation";

export const metadata: Metadata = { title: "Add product" };

interface NewProductPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default function NewProductPage({ searchParams }: NewProductPageProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
          <p role="status" className="text-sm text-muted-foreground">
            Loading product creation form...
          </p>
        </main>
      }
    >
      <NewProductContent searchParams={searchParams} />
    </Suspense>
  );
}

async function NewProductContent({ searchParams }: NewProductPageProps) {
  const { user, isAdmin } = await getAdminContext();
  const params = await searchParams;
  const rawCategory = params.category ?? "clothing";
  const initialCategory: ProductCategorySlug = PRODUCT_CATEGORY_SLUGS.includes(
    rawCategory as ProductCategorySlug,
  )
    ? (rawCategory as ProductCategorySlug)
    : "clothing";

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/admin/products/new?category=${initialCategory}`)}`);
  }
  if (!isAdmin) {
    redirect("/account");
  }

  const cloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-burgundy hover:underline"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Back to Manage Products
      </Link>

      <header className="mt-4 border-b border-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-burgundy">
          PRIYA Administration
        </p>
        <h1 className="mt-2 font-heading text-4xl font-medium text-foreground">
          Add {CATEGORY_LABELS[initialCategory]} Product
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fill in the product details, upload images, and configure stock for your boutique catalogue.
        </p>
      </header>

      <div className="mt-8">
        <ProductCreateForm
          initialCategory={initialCategory}
          cloudinaryConfigured={cloudinaryConfigured}
        />
      </div>
    </main>
  );
}
