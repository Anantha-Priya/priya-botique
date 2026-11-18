import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { homepageCategories } from "@/data/homepage";

export function FeaturedProductsSection() {
  return (
    <section
      id="featured"
      aria-labelledby="featured-title"
      className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-burgundy">
              THE FEATURED EDIT
            </p>
            <h2
              id="featured-title"
              className="mt-3 text-3xl font-medium sm:text-4xl"
            >
              A preview of what’s to come
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
            Sample photography only. These are not live products; names,
            details, and prices will be added with the catalogue.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {homepageCategories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="group rounded-xl focus-visible:outline-offset-4"
            >
              <div className="relative aspect-[4/4.7] overflow-hidden rounded-xl bg-brand-beige">
                <Image
                  src={category.image}
                  alt={category.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.04]"
                />
                <span className="absolute top-4 left-4 rounded-full bg-background/90 px-3 py-1.5 text-[0.65rem] font-semibold tracking-wide text-foreground backdrop-blur-sm">
                  PREVIEW ONLY
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 pt-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Sample category
                  </p>
                  <h3 className="mt-1 text-lg font-medium">
                    {category.label} preview
                  </h3>
                </div>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-5 shrink-0 text-brand-burgundy transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
