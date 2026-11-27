import { Suspense } from "react";
import { BrandStorySection } from "@/components/home/brand-story-section";
import { CategorySection } from "@/components/home/category-section";
import { HomeHero } from "@/components/home/home-hero";
import { NewArrivalsSection } from "@/components/home/new-arrivals-section";

function NewArrivalsFallback() {
  return (
    <section
      id="new-arrivals"
      aria-label="Loading new arrivals"
      className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10 lg:pb-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="h-64 animate-pulse rounded-2xl bg-brand-beige/60" />
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <HomeHero />
      <CategorySection />
      <Suspense fallback={<NewArrivalsFallback />}>
        <NewArrivalsSection />
      </Suspense>
      <BrandStorySection />
    </main>
  );
}
