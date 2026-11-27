import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/catalogue/product-card";
import { getPinnedNewArrivals } from "@/lib/catalogue";

export async function NewArrivalsSection() {
  const pinnedProducts = await getPinnedNewArrivals(12);

  return (
    <section
      id="new-arrivals"
      aria-labelledby="new-arrivals-title"
      className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10 lg:pb-24"
    >
      <div className="mx-auto max-w-7xl">
        {pinnedProducts.length > 0 ? (
          <div>
            <div className="mb-8 flex flex-col justify-between gap-4 sm:mb-10 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-burgundy">
                  NEW ARRIVALS
                </p>
                <h2
                  id="new-arrivals-title"
                  className="mt-3 text-3xl font-medium sm:text-4xl"
                >
                  Curated New Arrivals
                </h2>
              </div>
              <Link
                href="/new-arrivals"
                className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-brand-burgundy underline decoration-brand-champagne underline-offset-4 transition-colors hover:text-brand-burgundy/80"
              >
                View all new arrivals
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
              {pinnedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl bg-brand-burgundy px-6 py-10 text-primary-foreground sm:px-10 sm:py-14 lg:px-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 -right-14 size-64 rounded-full border border-white/15 sm:size-96"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-8 -right-2 size-48 rounded-full border border-white/10 sm:size-72"
            />
            <div className="relative max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-champagne">
                NEW ARRIVALS
              </p>
              <div className="mt-5 flex items-start gap-4">
                <Sparkles
                  aria-hidden="true"
                  className="mt-1 size-6 shrink-0 text-brand-champagne"
                />
                <div>
                  <h2
                    id="new-arrivals-title"
                    className="text-3xl leading-tight font-medium sm:text-4xl"
                  >
                    The next curation is arriving soon.
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-primary-foreground/80 sm:text-base">
                    No products are pinned to New Arrivals yet. Explore our
                    clothing, jewellery, and accessories collections in the
                    meantime.
                  </p>
                  <Link
                    href="/category/clothing"
                    className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-foreground underline decoration-brand-champagne underline-offset-4 transition-colors hover:text-brand-champagne"
                  >
                    Explore the collection
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
