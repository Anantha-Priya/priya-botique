import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function NewArrivalsSection() {
  return (
    <section
      id="new-arrivals"
      aria-labelledby="new-arrivals-title"
      className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10 lg:pb-24"
    >
      <div className="mx-auto max-w-7xl">
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
                  The first collection is taking shape.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-primary-foreground/80 sm:text-base">
                  New-arrival products will appear here when the catalogue is
                  ready. This preview does not show live products, prices, or
                  availability.
                </p>
                <Link
                  href="/new-arrivals"
                  className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-foreground underline decoration-brand-champagne underline-offset-4 transition-colors hover:text-brand-champagne"
                >
                  View the arrivals preview
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
