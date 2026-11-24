"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { NavigationLink } from "@/components/layout/navigation-link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { primaryNavigation, utilityNavigation } from "@/data/navigation";
import { brand } from "@/lib/brand";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useIsClient } from "@/hooks/use-is-client";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const isClient = useIsClient();
  const cartCount = useCartStore((state) => state.getTotalItems());
  const wishlistCount = useWishlistStore((state) => state.getTotalItems());

  const closeMenu = () => setOpen(false);

  return (
    <div className="xl:hidden">
      <Sheet open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation menu"
            >
              <Menu aria-hidden="true" className="size-5" />
            </Button>
          }
        />
        <SheetContent
          side="left"
          className="max-w-[calc(100vw-2rem)] w-[min(85vw,24rem)] overflow-y-auto"
        >
          <SheetHeader className="border-b border-border p-6">
            <SheetTitle className="text-xl">{brand.name}</SheetTitle>
            <SheetDescription>Browse PRIYA Boutique</SheetDescription>
          </SheetHeader>
          <nav aria-label="Mobile primary navigation" className="px-4">
            <ul className="space-y-1">
              {primaryNavigation.map((item) => (
                <li key={item.href}>
                  <NavigationLink
                    {...item}
                    className="flex min-h-11 items-center rounded-md px-3 text-base font-medium hover:bg-secondary"
                    onClick={closeMenu}
                  />
                </li>
              ))}
            </ul>
          </nav>
          <div className="mx-4 border-t border-border pt-3">
            <nav aria-label="Account and shopping">
              <ul className="space-y-1">
                {utilityNavigation.map((item) => {
                  const badge =
                    isClient && item.label === "Shopping bag" && cartCount > 0
                      ? cartCount
                      : isClient && item.label === "Wishlist" && wishlistCount > 0
                        ? wishlistCount
                        : null;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex min-h-11 items-center justify-between rounded-md px-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                        onClick={closeMenu}
                      >
                        <span>{item.label}</span>
                        {badge !== null ? (
                          <span className="flex size-5 items-center justify-center rounded-full bg-brand-burgundy text-[0.625rem] font-bold text-white">
                            {badge > 99 ? "99+" : badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
