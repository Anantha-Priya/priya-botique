import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCatalogueHref,
  parseCatalogueFilters,
} from "./catalogue-filters.ts";

test("catalogue filters validate values and use the first repeated parameter", () => {
  const filters = parseCatalogueFilters({
    category: ["clothing", "jewellery"],
    minPrice: "12.50",
    maxPrice: "-1",
    color: "  Maroon  ",
    attribute: "material",
    attributeValue: "Silk",
    sort: "not-a-sort",
    page: "0",
    inStock: "1",
  });

  assert.deepEqual(filters, {
    category: "clothing",
    minPrice: 12.5,
    maxPrice: undefined,
    size: "",
    color: "Maroon",
    attribute: "material",
    attributeValue: "Silk",
    inStock: true,
    sort: "newest",
    page: 1,
  });
});

test("pagination links preserve active filters without carrying the old page", () => {
  const filters = parseCatalogueFilters({
    category: "jewellery",
    minPrice: "100",
    size: "Free Size",
    attribute: "finish",
    attributeValue: "Matte",
    sort: "price-asc",
    page: "3",
  });

  assert.equal(
    buildCatalogueHref("/shop", filters, 4),
    "/shop?category=jewellery&minPrice=100&size=Free+Size&attribute=finish&attributeValue=Matte&sort=price-asc&page=4",
  );
  assert.equal(buildCatalogueHref("/shop", filters, 1), "/shop?category=jewellery&minPrice=100&size=Free+Size&attribute=finish&attributeValue=Matte&sort=price-asc");
});

test("invalid slugs, prices, sorts, and oversized pages fall back safely", () => {
  const filters = parseCatalogueFilters({
    category: "../products",
    minPrice: "Infinity",
    maxPrice: "1.999",
    attribute: "admin",
    attributeValue: "Anything",
    sort: "random",
    page: "999999999999999999999",
  });

  assert.equal(filters.category, "");
  assert.equal(filters.minPrice, undefined);
  assert.equal(filters.maxPrice, undefined);
  assert.equal(filters.sort, "newest");
  assert.equal(filters.page, 1);
  assert.equal(filters.attribute, "");
  assert.equal(filters.attributeValue, "Anything");
});
