import assert from "node:assert/strict";
import test from "node:test";
import {
  applyAddItem,
  applyRemoveItem,
  applyUpdateQuantity,
  calculateCartItemCount,
  calculateCartSubtotal,
  createCartItemId,
  mergeCartItems,
} from "./cart-logic.ts";

test("creates composite cart item ID from product ID and variant ID", () => {
  const id = createCartItemId("prod-1", "var-red-m");
  assert.equal(id, "prod-1:var-red-m");
});

test("adds a new variant as a distinct cart line", () => {
  const initial = [];
  const item = {
    productId: "p1",
    productSlug: "aarohi-kanjivaram-saree",
    productName: "Aarohi Kanjivaram Saree",
    categoryName: "Clothing",
    imageUrl: "https://example.com/saree.jpg",
    imageAlt: "Kanjivaram Saree",
    variantId: "v1",
    selectedSize: "Free Size",
    selectedColor: "Crimson Red",
    unitPrice: 12500,
    quantity: 1,
    stockLimit: 5,
  };

  const result = applyAddItem(initial, item);
  assert.equal(result.status, "added");
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].id, "p1:v1");
  assert.equal(result.items[0].quantity, 1);
});

test("adding the same variant increases quantity on the same line", () => {
  const initial = [
    {
      id: "p1:v1",
      productId: "p1",
      productSlug: "saree",
      productName: "Saree",
      categoryName: "Clothing",
      imageUrl: "https://example.com/saree.jpg",
      imageAlt: "Saree",
      variantId: "v1",
      unitPrice: 1000,
      quantity: 2,
      stockLimit: 5,
    },
  ];

  const result = applyAddItem(initial, {
    productId: "p1",
    productSlug: "saree",
    productName: "Saree",
    categoryName: "Clothing",
    imageUrl: "https://example.com/saree.jpg",
    imageAlt: "Saree",
    variantId: "v1",
    unitPrice: 1000,
    quantity: 2,
    stockLimit: 5,
  });

  assert.equal(result.status, "updated");
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].quantity, 4);
});

test("different variants of the same product remain distinct lines", () => {
  const initial = [
    {
      id: "p1:v1",
      productId: "p1",
      productSlug: "saree",
      productName: "Saree",
      categoryName: "Clothing",
      imageUrl: "https://example.com/saree.jpg",
      imageAlt: "Saree",
      variantId: "v1",
      selectedColor: "Red",
      unitPrice: 1000,
      quantity: 1,
      stockLimit: 5,
    },
  ];

  const result = applyAddItem(initial, {
    productId: "p1",
    productSlug: "saree",
    productName: "Saree",
    categoryName: "Clothing",
    imageUrl: "https://example.com/saree.jpg",
    imageAlt: "Saree",
    variantId: "v2",
    selectedColor: "Green",
    unitPrice: 1000,
    quantity: 1,
    stockLimit: 5,
  });

  assert.equal(result.status, "added");
  assert.equal(result.items.length, 2);
  assert.equal(result.items[0].variantId, "v1");
  assert.equal(result.items[1].variantId, "v2");
});

test("adding an item caps quantity at available stock limit", () => {
  const initial = [
    {
      id: "p1:v1",
      productId: "p1",
      productSlug: "necklace",
      productName: "Necklace",
      categoryName: "Jewellery",
      imageUrl: "https://example.com/necklace.jpg",
      imageAlt: "Necklace",
      variantId: "v1",
      unitPrice: 5000,
      quantity: 3,
      stockLimit: 4,
    },
  ];

  const result = applyAddItem(initial, {
    productId: "p1",
    productSlug: "necklace",
    productName: "Necklace",
    categoryName: "Jewellery",
    imageUrl: "https://example.com/necklace.jpg",
    imageAlt: "Necklace",
    variantId: "v1",
    unitPrice: 5000,
    quantity: 3,
    stockLimit: 4,
  });

  assert.equal(result.status, "updated");
  assert.equal(result.addedCount, 1);
  assert.equal(result.items[0].quantity, 4);
});

test("rejects adding an out of stock product", () => {
  const result = applyAddItem([], {
    productId: "p1",
    productSlug: "bangle",
    productName: "Bangle",
    categoryName: "Jewellery",
    imageUrl: "https://example.com/bangle.jpg",
    imageAlt: "Bangle",
    variantId: "v1",
    unitPrice: 2000,
    quantity: 1,
    stockLimit: 0,
  });

  assert.equal(result.status, "out_of_stock");
  assert.equal(result.items.length, 0);
});

test("updates quantity correctly and clamps to stock limit", () => {
  const items = [
    {
      id: "p1:v1",
      productId: "p1",
      productSlug: "saree",
      productName: "Saree",
      categoryName: "Clothing",
      imageUrl: "https://example.com/saree.jpg",
      imageAlt: "Saree",
      variantId: "v1",
      unitPrice: 1000,
      quantity: 2,
      stockLimit: 5,
    },
  ];

  const updated = applyUpdateQuantity(items, "p1:v1", 4);
  assert.equal(updated[0].quantity, 4);

  const clamped = applyUpdateQuantity(items, "p1:v1", 10);
  assert.equal(clamped[0].quantity, 5);
});

test("updating quantity to zero or negative removes the line", () => {
  const items = [
    {
      id: "p1:v1",
      productId: "p1",
      productSlug: "saree",
      productName: "Saree",
      categoryName: "Clothing",
      imageUrl: "https://example.com/saree.jpg",
      imageAlt: "Saree",
      variantId: "v1",
      unitPrice: 1000,
      quantity: 2,
      stockLimit: 5,
    },
  ];

  const updated = applyUpdateQuantity(items, "p1:v1", 0);
  assert.equal(updated.length, 0);
});

test("removes item by ID", () => {
  const items = [
    {
      id: "p1:v1",
      productId: "p1",
      productSlug: "saree",
      productName: "Saree",
      categoryName: "Clothing",
      imageUrl: "https://example.com/saree.jpg",
      imageAlt: "Saree",
      variantId: "v1",
      unitPrice: 1000,
      quantity: 1,
      stockLimit: 5,
    },
  ];

  const result = applyRemoveItem(items, "p1:v1");
  assert.equal(result.length, 0);
});

test("calculates total items and subtotal accurately", () => {
  const items = [
    {
      id: "p1:v1",
      productId: "p1",
      productSlug: "saree",
      productName: "Saree",
      categoryName: "Clothing",
      imageUrl: "https://example.com/saree.jpg",
      imageAlt: "Saree",
      variantId: "v1",
      unitPrice: 2499.5,
      quantity: 2,
      stockLimit: 5,
    },
    {
      id: "p2:v1",
      productId: "p2",
      productSlug: "necklace",
      productName: "Necklace",
      categoryName: "Jewellery",
      imageUrl: "https://example.com/necklace.jpg",
      imageAlt: "Necklace",
      variantId: "v1",
      unitPrice: 5000,
      quantity: 1,
      stockLimit: 5,
    },
  ];

  assert.equal(calculateCartItemCount(items), 3);
  assert.equal(calculateCartSubtotal(items), 9999);
});

test("merges guest cart into customer cart without losing items", () => {
  const primary = [
    {
      id: "p1:v1",
      productId: "p1",
      productSlug: "saree",
      productName: "Saree",
      categoryName: "Clothing",
      imageUrl: "https://example.com/saree.jpg",
      imageAlt: "Saree",
      variantId: "v1",
      unitPrice: 1000,
      quantity: 1,
      stockLimit: 5,
    },
  ];

  const guest = [
    {
      id: "p1:v1",
      productId: "p1",
      productSlug: "saree",
      productName: "Saree",
      categoryName: "Clothing",
      imageUrl: "https://example.com/saree.jpg",
      imageAlt: "Saree",
      variantId: "v1",
      unitPrice: 1000,
      quantity: 2,
      stockLimit: 5,
    },
    {
      id: "p2:v2",
      productId: "p2",
      productSlug: "bangle",
      productName: "Bangle",
      categoryName: "Jewellery",
      imageUrl: "https://example.com/bangle.jpg",
      imageAlt: "Bangle",
      variantId: "v2",
      unitPrice: 3000,
      quantity: 1,
      stockLimit: 5,
    },
  ];

  const merged = mergeCartItems(primary, guest);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].quantity, 3); // 1 + 2
  assert.equal(merged[1].id, "p2:v2");
});
