import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogueBrowser } from "@/components/catalogue/catalogue-browser";
import { getActiveCollection } from "@/lib/catalogue";
import type { CatalogueSearchParams } from "@/lib/catalogue-filters";
import CatalogueLoading from "../../loading";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogueSearchParams>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getActiveCollection(slug);

  if (!collection) {
    return { title: "Collection not found" };
  }

  return {
    title: collection.name,
    description:
      collection.description ?? `Explore the ${collection.name} edit from PRIYA.`,
    alternates: { canonical: `/collections/${collection.slug}` },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  return (
    <Suspense fallback={<CatalogueLoading />}>
      <CollectionCatalogue params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CollectionCatalogue({
  params,
  searchParams,
}: CollectionPageProps) {
  const [{ slug }, filters] = await Promise.all([params, searchParams]);
  const collection = await getActiveCollection(slug);

  if (!collection) {
    notFound();
  }

  return (
    <CatalogueBrowser
      pathname={`/collections/${slug}`}
      title={collection.name}
      description={collection.description}
      collectionSlug={collection.slug}
      searchParams={filters}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Collections", href: "/collections" },
        { label: collection.name },
      ]}
    />
  );
}
