"use client";

import Link from "next/link";
import { Heart, Search, ShoppingBag, UserRound } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { useIsClient } from "@/hooks/use-is-client";

export function HeaderUtilityActions() {
  const isClient = useIsClient();
  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  const wishlistItemsCount = useWishlistStore((state) => state.getTotalItems());

  const cartCount = isClient ? cartItemsCount : 0;
  const wishlistCount = isClient ? wishlistItemsCount : 0;

  return (
    <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
      {/* Search */}
      <Link
        href="/search"
        aria-label="Search catalogue"
        className="inline-flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary hover:text-primary"
      >
        <Search aria-hidden="true" className="size-5" />
      </Link>

      {/* Account */}
      <Link
        href="/account"
        aria-label="My account"
        className="hidden size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary hover:text-primary sm:inline-flex"
      >
        <UserRound aria-hidden="true" className="size-5" />
      </Link>

      {/* Wishlist */}
      <Link
        href="/wishlist"
        aria-label={`Wishlist (${wishlistCount} ${wishlistCount === 1 ? "item" : "items"})`}
        className="relative inline-flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary hover:text-primary"
      >
        <Heart aria-hidden="true" className="size-5" />
        {wishlistCount > 0 ? (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-brand-burgundy text-[0.625rem] font-bold text-white"
          >
            {wishlistCount > 99 ? "99+" : wishlistCount}
          </span>
        ) : null}
      </Link>

      {/* Shopping bag / Cart */}
      <Link
        href="/cart"
        aria-label={`Shopping bag (${cartCount} ${cartCount === 1 ? "item" : "items"})`}
        className="relative inline-flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary hover:text-primary"
      >
        <ShoppingBag aria-hidden="true" className="size-5" />
        {cartCount > 0 ? (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-brand-burgundy text-[0.625rem] font-bold text-white"
          >
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        ) : null}
      </Link>

      {/* Mobile Drawer */}
      <MobileNavigation />
    </div>
  );
}
