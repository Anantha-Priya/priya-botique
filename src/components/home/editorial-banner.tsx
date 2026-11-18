import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function EditorialBanner() {
  return (
    <section
      aria-labelledby="editorial-title"
      className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-brand-ivory px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -bottom-24 size-64 rounded-full border border-brand-champagne/50 sm:size-96"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-1 -bottom-16 size-48 rounded-full border border-brand-champagne/35 sm:size-72"
          />
          <div className="relative max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-burgundy">
              THE COLLECTIONS PREVIEW
            </p>
            <h2
              id="editorial-title"
              className="mt-4 text-3xl leading-tight font-medium sm:text-4xl lg:text-5xl"
            >
              Make space for your own point of view.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              Curated collection stories will live here as the PRIYA storefront
              grows. For now, explore the categories in this early preview.
            </p>
            <Link
              href="/collections"
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-burgundy underline decoration-brand-champagne underline-offset-4 transition-colors hover:text-foreground"
            >
              Explore collections
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
