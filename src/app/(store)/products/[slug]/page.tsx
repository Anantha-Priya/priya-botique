import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { ProductCard } from "@/components/catalogue/product-card";
import { ProductDetail } from "@/components/catalogue/product-detail";
import { getActiveProduct, getRelatedProducts } from "@/lib/catalogue";
import CatalogueLoading from "../../loading";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getActiveProduct(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  return (
    <Suspense fallback={<CatalogueLoading />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getActiveProduct(slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product);
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Breadcrumbs
        items={[
           { label: "Home", href: "/" },
           {
             label: product.categories.name,
             href: `/category/${product.categories.slug}`,
           },
          { label: product.name },
        ]}
      />

      <ProductDetail product={product} />

      <section className="mt-16 border-t border-border pt-10" aria-labelledby="related-products-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-burgundy">
          YOU MAY ALSO LIKE
        </p>
        <h2 id="related-products-heading" className="mt-2 font-heading text-3xl font-medium">
          Related products
        </h2>
        {related.length > 0 ? (
          <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-muted-foreground">
            More published products from this category will appear here.
          </p>
        )}
      </section>
    </main>
  );
}
