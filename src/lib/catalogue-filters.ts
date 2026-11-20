export type CatalogueSort = "newest" | "price-asc" | "price-desc";

export interface CatalogueFilters {
  category: string;
  minPrice?: number;
  maxPrice?: number;
  size: string;
  color: string;
  attribute: string;
  attributeValue: string;
  inStock: boolean;
  sort: CatalogueSort;
  page: number;
}

export type CatalogueSearchParams = Record<
  string,
  string | string[] | undefined
>;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedSorts = new Set<CatalogueSort>([
  "newest",
  "price-asc",
  "price-desc",
]);
const allowedAttributes = new Set([
  "material",
  "finish",
  "occasion",
  "dimensions",
  "style",
]);

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function cleanText(value: string | undefined, maxLength: number): string {
  return value?.trim().slice(0, maxLength) ?? "";
}

function parsePrice(value: string | undefined): number | undefined {
  if (!value || !/^\d+(?:\.\d{1,2})?$/.test(value)) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseCatalogueFilters(
  params: CatalogueSearchParams,
): CatalogueFilters {
  const sortValue = firstValue(params.sort);
  const pageValue = firstValue(params.page);
  const parsedPage = pageValue && /^\d+$/.test(pageValue)
    ? Number(pageValue)
    : 1;

  return {
    category: cleanText(firstValue(params.category), 80).match(slugPattern)
      ? cleanText(firstValue(params.category), 80)
      : "",
    minPrice: parsePrice(firstValue(params.minPrice)),
    maxPrice: parsePrice(firstValue(params.maxPrice)),
    size: cleanText(firstValue(params.size), 40),
    color: cleanText(firstValue(params.color), 40),
    attribute: allowedAttributes.has(firstValue(params.attribute) ?? "")
      ? firstValue(params.attribute) ?? ""
      : "",
    attributeValue: cleanText(firstValue(params.attributeValue), 60),
    inStock: firstValue(params.inStock) === "1",
    sort:
      sortValue && allowedSorts.has(sortValue as CatalogueSort)
        ? (sortValue as CatalogueSort)
        : "newest",
    page:
      Number.isSafeInteger(parsedPage) && parsedPage > 0
        ? Math.min(parsedPage, 1_000_000)
        : 1,
  };
}

export function buildCatalogueHref(
  pathname: string,
  filters: CatalogueFilters,
  page: number,
): string {
  const params = new URLSearchParams();

  if (filters.category) params.set("category", filters.category);
  if (filters.minPrice !== undefined) {
    params.set("minPrice", String(filters.minPrice));
  }
  if (filters.maxPrice !== undefined) {
    params.set("maxPrice", String(filters.maxPrice));
  }
  if (filters.size) params.set("size", filters.size);
  if (filters.color) params.set("color", filters.color);
  if (filters.attribute && filters.attributeValue) {
    params.set("attribute", filters.attribute);
    params.set("attributeValue", filters.attributeValue);
  }
  if (filters.inStock) params.set("inStock", "1");
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
