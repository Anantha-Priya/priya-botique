import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ProductImageUploader } from "@/components/admin/product-image-uploader";
import { getAdminContext } from "@/lib/admin/get-admin-context";

export const metadata: Metadata = { title: "Product image uploads" };

export default function ProductImageAdminPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
          <p role="status" className="text-sm text-muted-foreground">
            Loading administrator tools...
          </p>
        </main>
      }
    >
      <ProductImageAdminContent />
    </Suspense>
  );
}

async function ProductImageAdminContent() {
  const { supabase, user, isAdmin } = await getAdminContext();

  if (!user) {
    redirect("/login?next=%2Fadmin%2Fproduct-images");
  }
  if (!isAdmin) {
    notFound();
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("id,name,slug")
    .order("name");

  if (error) {
    throw new Error(`Unable to load products for image uploads: ${error.message}`);
  }

  const cloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-burgundy">
        PRIYA administration
      </p>
      <h1 className="mt-3 font-heading text-4xl font-medium">Product images</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        Upload images directly to Cloudinary and attach them to a catalogue
        product. Only signed-in administrators can use this page.
      </p>

      {!cloudinaryConfigured ? (
        <p role="status" className="mt-6 rounded-md border border-border p-4 text-sm">
          Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
          CLOUDINARY_API_SECRET, and CLOUDINARY_UPLOAD_PRESET in your local
          environment, then restart the development server. Keep the API secret
          server-side.
        </p>
      ) : products?.length ? (
        <div className="mt-8">
          <ProductImageUploader products={products} />
        </div>
      ) : (
        <p role="status" className="mt-6 rounded-md border border-border p-4 text-sm">
          No products are available for image uploads.
        </p>
      )}
    </main>
  );
}
