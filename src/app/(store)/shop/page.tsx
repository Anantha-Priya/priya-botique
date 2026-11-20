import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogueBrowser } from "@/components/catalogue/catalogue-browser";
import { parseCatalogueFilters } from "@/lib/catalogue-filters";
import CatalogueLoading from "../loading";

export const metadata: Metadata = {
  title: "Shop",
  description: "Explore clothing, jewellery, and accessories from PRIYA.",
  alternates: { canonical: "/shop" },
};

interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function ShopPage({ searchParams }: ShopPageProps) {
  return (
    <Suspense fallback={<CatalogueLoading />}>
      <ShopCatalogue searchParams={searchParams} />
    </Suspense>
  );
}

async function ShopCatalogue({ searchParams }: ShopPageProps) {
  const filters = parseCatalogueFilters(await searchParams);

  return (
    <CatalogueBrowser
      pathname="/shop"
      title="Shop"
      description="Explore the published PRIYA Boutique catalogue."
      searchParams={{
        category: filters.category,
        minPrice: filters.minPrice === undefined ? undefined : String(filters.minPrice),
        maxPrice: filters.maxPrice === undefined ? undefined : String(filters.maxPrice),
        size: filters.size,
        color: filters.color,
        attribute: filters.attribute,
        attributeValue: filters.attributeValue,
        inStock: filters.inStock ? "1" : undefined,
        sort: filters.sort,
        page: String(filters.page),
      }}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]}
    />
  );
}
