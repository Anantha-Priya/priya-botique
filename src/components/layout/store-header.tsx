import Link from "next/link";
import { HeaderUtilityActions } from "@/components/layout/header-utility-actions";
import { NavigationLink } from "@/components/layout/navigation-link";
import { primaryNavigation } from "@/data/navigation";
import { brand } from "@/lib/brand";

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

        <HeaderUtilityActions />
      </div>
    </header>
  );
}
