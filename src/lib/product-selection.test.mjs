import assert from "node:assert/strict";
import test from "node:test";
import {
  findMatchingVariant,
  getAttributeOptions,
  getEffectivePrice,
  getVariantOptions,
} from "./product-selection.ts";

const variants = [
  {
    id: "one",
    size: "M",
    color: "Ruby",
    attributes: { material: "Silk", occasion: "Wedding" },
    additional_price: "500.00",
    stock_quantity: 3,
    is_active: true,
    is_default: true,
  },
  {
    id: "two",
    size: null,
    color: "Gold",
    attributes: { finish: "Antique", occasion: "Festive" },
    additional_price: "0.00",
    stock_quantity: 0,
    is_active: true,
    is_default: false,
  },
];

test("variant options omit inactive variants and duplicates", () => {
  assert.deepEqual(getVariantOptions(variants, "size"), ["M"]);
  assert.deepEqual(getVariantOptions(variants, "color"), ["Ruby", "Gold"]);
  assert.deepEqual(getAttributeOptions(variants), {
    material: ["Silk"],
    occasion: ["Wedding", "Festive"],
    finish: ["Antique"],
  });
});

test("matching variants respect size, colour, and attributes", () => {
  assert.equal(
    findMatchingVariant(variants, {
      size: "M",
      color: "Ruby",
      attributes: { material: "Silk", occasion: "Wedding" },
    })?.id,
    "one",
  );
  assert.equal(
    findMatchingVariant(variants, {
      size: "",
      color: "Gold",
      attributes: { finish: "Antique", occasion: "Festive" },
    })?.id,
    "two",
  );
});

test("effective price adds only the numeric variant adjustment", () => {
  assert.equal(getEffectivePrice("18990.00", variants[0]), 19490);
  assert.equal(getEffectivePrice("1590.00", variants[1]), 1590);
});
