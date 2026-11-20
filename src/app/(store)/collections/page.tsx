import { Suspense } from "react";
import type { Metadata } from "next";
import { CollectionList } from "@/components/catalogue/collection-list";
import CatalogueLoading from "../loading";

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore curated edits from PRIYA Boutique.",
  alternates: { canonical: "/collections" },
};

export default function CollectionsPage() {
  return (
    <Suspense fallback={<CatalogueLoading />}>
      <CollectionList />
    </Suspense>
  );
}
