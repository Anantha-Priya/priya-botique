import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogueBrowser } from "@/components/catalogue/catalogue-browser";
import type { CatalogueSearchParams } from "@/lib/catalogue-filters";
import CatalogueLoading from "../loading";

export const metadata: Metadata = {
  title: "New Arrivals",
  description: "See the latest published arrivals from PRIYA Boutique.",
  alternates: { canonical: "/new-arrivals" },
};

interface NewArrivalsPageProps {
  searchParams: Promise<CatalogueSearchParams>;
}

export default function NewArrivalsPage({
  searchParams,
}: NewArrivalsPageProps) {
  return (
    <Suspense fallback={<CatalogueLoading />}>
      <NewArrivalsCatalogue searchParams={searchParams} />
    </Suspense>
  );
}

async function NewArrivalsCatalogue({
  searchParams,
}: NewArrivalsPageProps) {
  return (
    <CatalogueBrowser
      pathname="/new-arrivals"
      title="New Arrivals"
      description="The latest products, ordered by when they were added."
      searchParams={await searchParams}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "New Arrivals" },
      ]}
      showCategoryFilter={false}
    />
  );
}
