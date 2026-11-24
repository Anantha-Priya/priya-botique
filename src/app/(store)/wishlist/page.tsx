import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist/wishlist-view";
import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Review and manage your saved items at PRIYA Boutique.",
};

export default function WishlistPage() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Wishlist" },
        ]}
      />
      <h1 className="mt-4 font-heading text-3xl font-medium sm:text-4xl">
        My Wishlist
      </h1>
      <WishlistView />
    </main>
  );
}
