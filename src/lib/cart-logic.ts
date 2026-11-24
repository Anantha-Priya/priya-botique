import type { CartItem } from "@/types/cart";

export function createCartItemId(productId: string, variantId: string): string {
  return `${productId}:${variantId}`;
}

export function calculateCartItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + Math.max(0, item.quantity), 0);
}

export function calculateCartSubtotal(items: CartItem[]): number {
  const sum = items.reduce(
    (total, item) => total + Math.max(0, item.unitPrice) * Math.max(0, item.quantity),
    0,
  );
  return Math.round(sum * 100) / 100;
}

export interface AddItemResult {
  items: CartItem[];
  addedCount: number;
  status: "added" | "updated" | "out_of_stock" | "limit_reached";
}

export function applyAddItem(
  items: CartItem[],
  newItem: Omit<CartItem, "id">,
): AddItemResult {
  const id = createCartItemId(newItem.productId, newItem.variantId);
  const stockLimit = Math.max(0, newItem.stockLimit);

  if (stockLimit <= 0) {
    return { items, addedCount: 0, status: "out_of_stock" };
  }

  const existingIndex = items.findIndex((item) => item.id === id);

  if (existingIndex >= 0) {
    const existing = items[existingIndex];
    const requestedTotal = existing.quantity + Math.max(1, newItem.quantity);
    const newQuantity = Math.min(stockLimit, requestedTotal);
    const actuallyAdded = newQuantity - existing.quantity;

    if (actuallyAdded <= 0) {
      return { items, addedCount: 0, status: "limit_reached" };
    }

    const updatedItems = [...items];
    updatedItems[existingIndex] = {
      ...existing,
      ...newItem,
      id,
      quantity: newQuantity,
      stockLimit,
    };

    return { items: updatedItems, addedCount: actuallyAdded, status: "updated" };
  }

  const initialQuantity = Math.min(stockLimit, Math.max(1, newItem.quantity));
  const createdItem: CartItem = {
    ...newItem,
    id,
    quantity: initialQuantity,
    stockLimit,
  };

  return {
    items: [...items, createdItem],
    addedCount: initialQuantity,
    status: "added",
  };
}

export function applyUpdateQuantity(
  items: CartItem[],
  id: string,
  quantity: number,
): CartItem[] {
  if (quantity <= 0) {
    return items.filter((item) => item.id !== id);
  }

  return items.map((item) => {
    if (item.id !== id) return item;
    const stockLimit = Math.max(0, item.stockLimit);
    return {
      ...item,
      quantity: Math.min(stockLimit, Math.max(1, quantity)),
    };
  });
}

export function applyRemoveItem(items: CartItem[], id: string): CartItem[] {
  return items.filter((item) => item.id !== id);
}

export function mergeCartItems(
  primaryItems: CartItem[],
  secondaryItems: CartItem[],
): CartItem[] {
  let merged = [...primaryItems];

  for (const item of secondaryItems) {
    const result = applyAddItem(merged, item);
    merged = result.items;
  }

  return merged;
}
