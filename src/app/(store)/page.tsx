import { BrandStorySection } from "@/components/home/brand-story-section";
import { CategorySection } from "@/components/home/category-section";
import { HomeHero } from "@/components/home/home-hero";
import { NewArrivalsSection } from "@/components/home/new-arrivals-section";

export default function Home() {
  return (
    <main>
      <HomeHero />
      <CategorySection />
      <NewArrivalsSection />
      <BrandStorySection />
    </main>
  );
}
