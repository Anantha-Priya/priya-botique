import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogueBrowser } from "@/components/catalogue/catalogue-browser";
import { getActiveCategory } from "@/lib/catalogue";
import type { CatalogueSearchParams } from "@/lib/catalogue-filters";
import CatalogueLoading from "../../loading";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogueSearchParams>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getActiveCategory(slug);

  if (!category) {
    return { title: "Category not found" };
  }

  return {
    title: category.name,
    description:
      category.description ??
      `Explore published ${category.name.toLowerCase()} from PRIYA Boutique.`,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  return (
    <Suspense fallback={<CatalogueLoading />}>
      <CategoryCatalogue params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CategoryCatalogue({
  params,
  searchParams,
}: CategoryPageProps) {
  const [{ slug }, filters] = await Promise.all([params, searchParams]);
  const category = await getActiveCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <CatalogueBrowser
      pathname={`/category/${slug}`}
      title={category.name}
      description={category.description}
      categorySlug={category.slug}
      searchParams={filters}
      showCategoryFilter={false}
       breadcrumbs={[
         { label: "Home", href: "/" },
         { label: category.name },
       ]}
    />
  );
}
