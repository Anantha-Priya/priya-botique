import type { WishlistItem } from "@/types/wishlist";

export function isProductInWishlist(
  items: WishlistItem[],
  productId: string,
): boolean {
  return items.some((item) => item.productId === productId);
}

export interface ToggleWishlistResult {
  items: WishlistItem[];
  added: boolean;
}

export function applyToggleWishlist(
  items: WishlistItem[],
  candidate: Omit<WishlistItem, "addedAt">,
): ToggleWishlistResult {
  const exists = isProductInWishlist(items, candidate.productId);

  if (exists) {
    return {
      items: items.filter((item) => item.productId !== candidate.productId),
      added: false,
    };
  }

  const newItem: WishlistItem = {
    ...candidate,
    addedAt: new Date().toISOString(),
  };

  return {
    items: [newItem, ...items],
    added: true,
  };
}

export function mergeWishlistItems(
  primaryItems: WishlistItem[],
  secondaryItems: WishlistItem[],
): WishlistItem[] {
  const seenIds = new Set(primaryItems.map((item) => item.productId));
  const uniqueSecondary: WishlistItem[] = [];

  for (const item of secondaryItems) {
    if (!seenIds.has(item.productId)) {
      seenIds.add(item.productId);
      uniqueSecondary.push(item);
    }
  }

  return [...primaryItems, ...uniqueSecondary];
}
