import { BrandStorySection } from "@/components/home/brand-story-section";
import { CategorySection } from "@/components/home/category-section";
import { EditorialBanner } from "@/components/home/editorial-banner";
import { FeaturedProductsSection } from "@/components/home/featured-products-section";
import { HomeHero } from "@/components/home/home-hero";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { NewArrivalsSection } from "@/components/home/new-arrivals-section";

export default function Home() {
  return (
    <main>
      <HomeHero />
      <CategorySection />
      <NewArrivalsSection />
      <FeaturedProductsSection />
      <EditorialBanner />
      <BrandStorySection />
      <NewsletterSection />
    </main>
  );
}
