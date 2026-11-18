import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function HomeHero() {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="bg-brand-beige/50"
    >
      <div className="mx-auto grid max-w-7xl items-center lg:grid-cols-[0.88fr_1.12fr]">
        <div className="px-5 py-14 sm:px-8 sm:py-20 lg:px-14 lg:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-burgundy">
            PRIYA · A STOREFRONT PREVIEW
          </p>
          <h1
            id="home-hero-title"
            className="mt-6 max-w-xl text-5xl leading-[1.08] font-medium tracking-tight sm:text-6xl lg:text-7xl"
          >
            A softer kind of statement.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            A first look at PRIYA: a thoughtful home for clothing, jewellery,
            and accessories, made to feel like your own.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              href="/shop"
              className={buttonVariants({
                size: "lg",
                className: "rounded-full px-6",
              })}
            >
              Explore the preview
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              href="#categories"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              Meet the categories
              <ArrowDown aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <p className="mt-8 text-xs text-muted-foreground">
            Sample editorial photography · replace with PRIYA campaign imagery
          </p>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden bg-brand-beige lg:aspect-[4/4.5]">
          <Image
            src="/images/hero-editorial.webp"
            alt="Sample editorial photograph of a woman in blue outerwear at a city landmark."
            fill
            preload
            sizes="(min-width: 1280px) 57vw, (min-width: 1024px) 55vw, 100vw"
            className="object-cover object-[center_38%]"
          />
          <span className="absolute right-4 bottom-4 rounded-full bg-background/90 px-3 py-1.5 text-[0.65rem] font-semibold tracking-wide text-foreground backdrop-blur-sm sm:right-6 sm:bottom-6">
            SAMPLE IMAGE
          </span>
        </div>
      </div>
    </section>
  );
}
