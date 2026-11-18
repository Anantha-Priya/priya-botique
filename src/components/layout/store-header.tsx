import Link from "next/link";
import { Heart, Search, ShoppingBag, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { NavigationLink } from "@/components/layout/navigation-link";
import { primaryNavigation, utilityNavigation } from "@/data/navigation";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

type UtilityNavigationLabel = (typeof utilityNavigation)[number]["label"];

const utilityIcons: Record<UtilityNavigationLabel, LucideIcon> = {
  Search,
  "My account": UserRound,
  Wishlist: Heart,
  "Shopping bag": ShoppingBag,
};

export function StoreHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label={`${brand.name} Boutique home`}
          className="shrink-0 rounded-sm text-foreground transition-colors hover:text-primary"
        >
          <span className="block font-heading text-2xl leading-none tracking-wide">
            {brand.name}
          </span>
          <span className="mt-1 block text-[0.625rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Boutique
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-3 text-sm font-medium xl:flex 2xl:gap-5"
        >
          {primaryNavigation.map((item) => (
            <NavigationLink
              key={item.href}
              {...item}
              className="whitespace-nowrap"
            />
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          {utilityNavigation.map((item) => {
            const Icon = utilityIcons[item.label];
            const hideOnSmallScreens =
              item.label === "My account" || item.label === "Wishlist";

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={cn(
                  "inline-flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary hover:text-primary",
                  hideOnSmallScreens && "hidden sm:inline-flex",
                )}
              >
                <Icon aria-hidden="true" className="size-5" />
              </Link>
            );
          })}
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}
