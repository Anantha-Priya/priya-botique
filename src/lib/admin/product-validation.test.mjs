import assert from "node:assert/strict";
import test from "node:test";
import { createProductSchema, slugifyProductName } from "./product-validation.ts";

test("slugifyProductName produces valid lowercase hyphenated slugs", () => {
  assert.equal(slugifyProductName("Banarasi Silk Anarkali!"), "banarasi-silk-anarkali");
  assert.equal(slugifyProductName("  Kundan   Pearl Jhumka  "), "kundan-pearl-jhumka");
});

test("clothing products require at least one enabled size", () => {
  const invalid = createProductSchema.safeParse({
    categorySlug: "clothing",
    name: "Silk Kurta",
    description: "Handwoven",
    price: 4500,
    material: "Mulberry Silk",
    color: "Burgundy",
    sizeStocks: [
      { size: "XS", enabled: false, stock: 0 },
      { size: "S", enabled: false, stock: 0 },
    ],
  });
  assert.equal(invalid.success, false);

  const valid = createProductSchema.safeParse({
    categorySlug: "clothing",
    name: "Silk Kurta",
    description: "Handwoven",
    price: 4500,
    material: "Mulberry Silk",
    color: "Burgundy",
    sizeStocks: [
      { size: "S", enabled: true, stock: 4 },
      { size: "M", enabled: true, stock: 0 },
    ],
  });
  assert.equal(valid.success, true);
});

test("jewellery and accessories do not require clothing sizes", () => {
  const jewellery = createProductSchema.safeParse({
    categorySlug: "jewellery",
    name: "Kundan Choker",
    description: "Bridal choker",
    price: 8900,
    material: "22k Gold-Plated Brass",
    color: "Gold",
    stockQuantity: 3,
  });
  assert.equal(jewellery.success, true);

  const accessories = createProductSchema.safeParse({
    categorySlug: "accessories",
    name: "Embroidered Potli",
    description: "Zari work potli",
    price: 2200,
    material: "Raw Silk",
    color: "Champagne",
    stockQuantity: 12,
  });
  assert.equal(accessories.success, true);
});
