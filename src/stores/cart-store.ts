"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/types/cart";
import {
  applyAddItem,
  applyRemoveItem,
  applyUpdateQuantity,
  calculateCartItemCount,
  calculateCartSubtotal,
} from "@/lib/cart-logic";

export interface AddItemFeedback {
  success: boolean;
  status: "added" | "updated" | "out_of_stock" | "limit_reached";
  message: string;
}

export interface CartStore {
  items: CartItem[];
  isHydrated: boolean;
  addItem: (item: Omit<CartItem, "id">) => AddItemFeedback;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setHydrated: (hydrated: boolean) => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

const safeStorage = createJSONStorage<CartStore>(() => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return window.localStorage;
});

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,
      addItem: (item) => {
        const currentItems = get().items;
        const result = applyAddItem(currentItems, item);
        set({ items: result.items });

        if (result.status === "out_of_stock") {
          return {
            success: false,
            status: result.status,
            message: "This product is currently out of stock.",
          };
        }
        if (result.status === "limit_reached") {
          return {
            success: false,
            status: result.status,
            message: `You already have the maximum available stock (${item.stockLimit}) in your bag.`,
          };
        }
        if (result.status === "updated") {
          return {
            success: true,
            status: result.status,
            message: "Shopping bag quantity updated.",
          };
        }
        return {
          success: true,
          status: result.status,
          message: "Added to shopping bag.",
        };
      },
      removeItem: (id) => {
        set((state) => ({ items: applyRemoveItem(state.items, id) }));
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: applyUpdateQuantity(state.items, id, quantity),
        }));
      },
      clearCart: () => {
        set({ items: [] });
      },
      setHydrated: (hydrated) => {
        set({ isHydrated: hydrated });
      },
      getTotalItems: () => calculateCartItemCount(get().items),
      getSubtotal: () => calculateCartSubtotal(get().items),
    }),
    {
      name: "priya-cart-v1",
      storage: safeStorage,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
