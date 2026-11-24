import assert from "node:assert/strict";
import test from "node:test";
import {
  applyToggleWishlist,
  isProductInWishlist,
  mergeWishlistItems,
} from "./wishlist-logic.ts";

test("adds an item to an empty wishlist", () => {
  const candidate = {
    productId: "p1",
    productSlug: "aarohi-saree",
    productName: "Aarohi Saree",
    categoryName: "Clothing",
    imageUrl: "https://example.com/saree.jpg",
    imageAlt: "Aarohi Saree",
    basePrice: 12500,
    inStock: true,
  };

  const result = applyToggleWishlist([], candidate);
  assert.equal(result.added, true);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].productId, "p1");
  assert.ok(result.items[0].addedAt);
});

test("toggling an existing item removes it from the wishlist", () => {
  const existing = [
    {
      productId: "p1",
      productSlug: "aarohi-saree",
      productName: "Aarohi Saree",
      categoryName: "Clothing",
      imageUrl: "https://example.com/saree.jpg",
      imageAlt: "Aarohi Saree",
      basePrice: 12500,
      inStock: true,
      addedAt: new Date().toISOString(),
    },
  ];

  const result = applyToggleWishlist(existing, {
    productId: "p1",
    productSlug: "aarohi-saree",
    productName: "Aarohi Saree",
    categoryName: "Clothing",
    imageUrl: "https://example.com/saree.jpg",
    imageAlt: "Aarohi Saree",
    basePrice: 12500,
    inStock: true,
  });

  assert.equal(result.added, false);
  assert.equal(result.items.length, 0);
});

test("detects if a product is in the wishlist", () => {
  const items = [
    {
      productId: "p1",
      productSlug: "saree",
      productName: "Saree",
      categoryName: "Clothing",
      imageUrl: "https://example.com/saree.jpg",
      imageAlt: "Saree",
      basePrice: 5000,
      inStock: true,
      addedAt: new Date().toISOString(),
    },
  ];

  assert.equal(isProductInWishlist(items, "p1"), true);
  assert.equal(isProductInWishlist(items, "p2"), false);
});

test("merges two wishlists without duplicates", () => {
  const primary = [
    {
      productId: "p1",
      productSlug: "saree",
      productName: "Saree",
      categoryName: "Clothing",
      imageUrl: "https://example.com/saree.jpg",
      imageAlt: "Saree",
      basePrice: 5000,
      inStock: true,
      addedAt: "2026-11-20T10:00:00Z",
    },
  ];

  const secondary = [
    {
      productId: "p1",
      productSlug: "saree",
      productName: "Saree",
      categoryName: "Clothing",
      imageUrl: "https://example.com/saree.jpg",
      imageAlt: "Saree",
      basePrice: 5000,
      inStock: true,
      addedAt: "2026-11-21T10:00:00Z",
    },
    {
      productId: "p2",
      productSlug: "necklace",
      productName: "Necklace",
      categoryName: "Jewellery",
      imageUrl: "https://example.com/necklace.jpg",
      imageAlt: "Necklace",
      basePrice: 8000,
      inStock: true,
      addedAt: "2026-11-22T10:00:00Z",
    },
  ];

  const merged = mergeWishlistItems(primary, secondary);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].productId, "p1");
  assert.equal(merged[1].productId, "p2");
});
