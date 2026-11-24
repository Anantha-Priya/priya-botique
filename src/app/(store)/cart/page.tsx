import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";

export const metadata: Metadata = {
  title: "Shopping bag",
  description: "Review and manage the items in your PRIYA shopping bag.",
};

export default function CartPage() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shopping bag" },
        ]}
      />
      <h1 className="mt-4 font-heading text-3xl font-medium sm:text-4xl">
        Shopping bag
      </h1>
      <CartView />
    </main>
  );
}
