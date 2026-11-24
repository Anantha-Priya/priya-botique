"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useIsClient } from "@/hooks/use-is-client";
import { cn } from "@/lib/utils";
import type { WishlistItem } from "@/types/wishlist";

interface WishlistButtonProps {
  item: Omit<WishlistItem, "addedAt">;
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function WishlistButton({
  item,
  className,
  showText = false,
  size = "md",
}: WishlistButtonProps) {
  const isClient = useIsClient();
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(item.productId));

  const active = isClient && isInWishlist;

  const iconSizes = {
    sm: "size-4",
    md: "size-5",
    lg: "size-5",
  };

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    toggleItem(item);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? `Remove ${item.productName} from wishlist` : `Add ${item.productName} to wishlist`}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        showText
          ? "min-h-12 border border-border bg-white px-5 text-sm font-medium hover:bg-secondary"
          : "size-10 bg-white/90 text-foreground shadow-sm hover:bg-white hover:text-brand-burgundy",
        active && !showText && "text-brand-burgundy",
        className,
      )}
    >
      <Heart
        aria-hidden="true"
        className={cn(
          iconSizes[size],
          "transition-colors",
          active && "fill-brand-burgundy text-brand-burgundy",
        )}
      />
      {showText ? (
        <span>{active ? "In wishlist" : "Save to wishlist"}</span>
      ) : null}
    </button>
  );
}
