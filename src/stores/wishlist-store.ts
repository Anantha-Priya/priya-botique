"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { WishlistItem } from "@/types/wishlist";
import {
  applyToggleWishlist,
  isProductInWishlist,
} from "@/lib/wishlist-logic";

export interface WishlistStore {
  items: WishlistItem[];
  isHydrated: boolean;
  addItem: (item: Omit<WishlistItem, "addedAt">) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: Omit<WishlistItem, "addedAt">) => boolean;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  setHydrated: (hydrated: boolean) => void;
  getTotalItems: () => number;
}

const safeStorage = createJSONStorage<WishlistStore>(() => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return window.localStorage;
});

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,
      addItem: (candidate) => {
        const currentItems = get().items;
        if (!isProductInWishlist(currentItems, candidate.productId)) {
          const result = applyToggleWishlist(currentItems, candidate);
          set({ items: result.items });
        }
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },
      toggleItem: (candidate) => {
        const currentItems = get().items;
        const result = applyToggleWishlist(currentItems, candidate);
        set({ items: result.items });
        return result.added;
      },
      isInWishlist: (productId) => isProductInWishlist(get().items, productId),
      clearWishlist: () => {
        set({ items: [] });
      },
      setHydrated: (hydrated) => {
        set({ isHydrated: hydrated });
      },
      getTotalItems: () => get().items.length,
    }),
    {
      name: "priya-wishlist-v1",
      storage: safeStorage,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
