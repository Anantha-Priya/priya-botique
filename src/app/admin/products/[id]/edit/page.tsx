import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import {
  ProductForm,
  type EditableProductData,
  type ExistingProductImage,
} from "@/components/admin/product-create-form";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import {
  CLOTHING_SIZES,
  PRODUCT_CATEGORY_SLUGS,
  type ClothingSize,
  type ProductCategorySlug,
} from "@/lib/admin/product-validation";

export const metadata: Metadata = { title: "Edit product" };

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
          <p role="status" className="text-sm text-muted-foreground">
            Loading product editor...
          </p>
        </main>
      }
    >
      <EditProductContent params={params} />
    </Suspense>
  );
}

async function EditProductContent({ params }: EditProductPageProps) {
  const { id } = await params;
  const { supabase, user, isAdmin } = await getAdminContext();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/admin/products/${id}/edit`)}`);
  }
  if (!isAdmin) {
    redirect("/account");
  }

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id,name,slug,description,fabric,attributes,base_price,is_active,categories(slug),product_images(id,image_url,alt_text,sort_order,is_primary),product_variants(id,size,color,attributes,stock_quantity,is_active,is_default)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !product) {
    notFound();
  }

  const categoryRecord = Array.isArray(product.categories)
    ? product.categories[0]
    : product.categories;
  const rawSlug = categoryRecord?.slug ?? "clothing";
  const categorySlug: ProductCategorySlug = PRODUCT_CATEGORY_SLUGS.includes(
    rawSlug as ProductCategorySlug,
  )
    ? (rawSlug as ProductCategorySlug)
    : "clothing";

  const variants = (product.product_variants ?? []) as {
    id: string;
    size: string | null;
    color: string | null;
    attributes: Record<string, unknown>;
    stock_quantity: number;
    is_active: boolean;
    is_default: boolean;
  }[];

  const activeVariants = variants.filter((v) => v.is_active);
  const firstVariant = activeVariants[0] ?? variants[0];
  const productAttributes = (product.attributes ?? {}) as Record<string, unknown>;

  const material =
    product.fabric ||
    (typeof productAttributes.material === "string" ? productAttributes.material : "") ||
    (typeof firstVariant?.attributes?.material === "string"
      ? firstVariant.attributes.material
      : "");

  const color =
    firstVariant?.color ||
    (typeof productAttributes.color === "string" ? productAttributes.color : "");

  const sizeStocks = Object.fromEntries(
    CLOTHING_SIZES.map((size) => {
      const match = activeVariants.find((v) => v.size === size);
      return [
        size,
        {
          enabled: Boolean(match),
          stock: String(match?.stock_quantity ?? 0),
        },
      ];
    }),
  ) as Record<ClothingSize, { enabled: boolean; stock: string }>;

  const nonSizeVariant = activeVariants.find((v) => !v.size) ?? firstVariant;
  const stockQuantity = nonSizeVariant?.stock_quantity ?? 0;

  const initialProduct: EditableProductData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    price: Number(product.base_price),
    material,
    color,
    categorySlug,
    isActive: product.is_active,
    stockQuantity,
    sizeStocks,
    images: (product.product_images ?? []) as ExistingProductImage[],
  };

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
          Edit Product
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Update product details, stock, and gallery images for {product.name}.
        </p>
      </header>

      <div className="mt-8">
        <ProductForm
          mode="edit"
          initialProduct={initialProduct}
          cloudinaryConfigured={cloudinaryConfigured}
        />
      </div>
    </main>
  );
}
