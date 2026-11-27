import { createClient } from "@/lib/supabase/server";
import type { CatalogueFilters } from "@/lib/catalogue-filters";

export interface CatalogueCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

export interface CatalogueCollection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
}

export interface CatalogueProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  base_price: string | number;
  categories: Pick<CatalogueCategory, "name" | "slug">;
  product_images: {
    image_url: string;
    alt_text: string;
    sort_order: number;
    is_primary: boolean;
  }[];
  product_variants: {
    size: string | null;
    color: string | null;
    stock_quantity: number;
  }[];
}

export interface ProductDetailVariant {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  attributes: Record<string, unknown>;
  additional_price: string | number;
  stock_quantity: number;
  is_active: boolean;
  is_default: boolean;
}

export interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  fabric: string | null;
  attributes: Record<string, unknown>;
  base_price: string | number;
  compare_at_price: string | number | null;
  categories: Pick<CatalogueCategory, "name" | "slug">;
  product_images: CatalogueProduct["product_images"];
  product_variants: ProductDetailVariant[];
}

export interface CataloguePageData {
  products: CatalogueProduct[];
  total: number;
  pageSize: number;
}

const pageSize = 12;

function throwQueryError(resource: string, message: string): never {
  throw new Error(`Failed to load ${resource}: ${message}`);
}

function buildProductQuery(
  supabase: Awaited<ReturnType<typeof createClient>>,
  options: {
    filters: CatalogueFilters;
    categorySlug?: string;
    collectionSlug?: string;
    pinnedOnly?: boolean;
  },
  head = false,
) {
  const { filters, categorySlug, collectionSlug, pinnedOnly } = options;
  const filterVariants = Boolean(
    filters.size ||
      filters.color ||
      (filters.attribute && filters.attributeValue) ||
      filters.inStock,
  );
  const variantRelation = filterVariants
    ? "product_variants!inner(size,color,attributes,stock_quantity,is_active)"
    : "product_variants(size,color,attributes,stock_quantity,is_active)";
  const collectionRelation = collectionSlug
    ? "collection_products!inner(collections!inner(slug))"
    : "";
  const select = [
    "id",
    "slug",
    "name",
    "description",
    "base_price",
    "categories!inner(name,slug)",
    "product_images(image_url,alt_text,sort_order,is_primary)",
    variantRelation,
    collectionRelation,
  ]
    .filter(Boolean)
    .join(",");

  let query = supabase
    .from("products")
    .select(select, { count: "exact", head })
    .eq("is_active", true)
    .eq("categories.is_active", true);

  if (pinnedOnly) {
    query = query.eq("is_pinned", true);
  }
  if (categorySlug) {
    query = query.eq("categories.slug", categorySlug);
  }
  if (filters.category) {
    query = query.eq("categories.slug", filters.category);
  }
  if (collectionSlug) {
    query = query.eq("collection_products.collections.slug", collectionSlug);
  }
  if (filters.minPrice !== undefined) {
    query = query.gte("base_price", filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte("base_price", filters.maxPrice);
  }
  if (filters.size) {
    query = query.eq("product_variants.size", filters.size);
  }
  if (filters.color) {
    query = query.eq("product_variants.color", filters.color);
  }
  if (filters.attribute && filters.attributeValue) {
    query = query.eq(
      `product_variants.attributes->>${filters.attribute}`,
      filters.attributeValue,
    );
  }
  if (filters.inStock) {
    query = query
      .eq("product_variants.is_active", true)
      .gt("product_variants.stock_quantity", 0);
  }

  if (filters.sort === "price-asc") {
    query = query
      .order("base_price", { ascending: true })
      .order("id", { ascending: true });
  } else if (filters.sort === "price-desc") {
    query = query
      .order("base_price", { ascending: false })
      .order("id", { ascending: false });
  } else {
    query = query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
  }

  return query;
}

export async function getActiveCategories(): Promise<CatalogueCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description,image_url")
    .eq("is_active", true)
    .order("name")
    .overrideTypes<CatalogueCategory[], { merge: false }>();

  if (error) {
    throwQueryError("categories", error.message);
  }

  return data ?? [];
}

export async function getActiveCategory(
  slug: string,
): Promise<CatalogueCategory | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description,image_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()
    .overrideTypes<CatalogueCategory | null, { merge: false }>();

  if (error) {
    throwQueryError("category", error.message);
  }

  return data;
}

export async function getActiveCollections(): Promise<CatalogueCollection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id,name,slug,description,banner_url")
    .eq("is_active", true)
    .order("name")
    .overrideTypes<CatalogueCollection[], { merge: false }>();

  if (error) {
    throwQueryError("collections", error.message);
  }

  return data ?? [];
}

export async function getActiveCollection(
  slug: string,
): Promise<CatalogueCollection | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id,name,slug,description,banner_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()
    .overrideTypes<CatalogueCollection | null, { merge: false }>();

  if (error) {
    throwQueryError("collection", error.message);
  }

  return data;
}

export async function getActiveProduct(
  slug: string,
): Promise<ProductDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      [
        "id",
        "slug",
        "name",
        "description",
        "fabric",
        "attributes",
        "base_price",
        "compare_at_price",
        "categories!inner(name,slug)",
        "product_images(image_url,alt_text,sort_order,is_primary)",
        "product_variants(id,sku,size,color,attributes,additional_price,stock_quantity,is_active,is_default)",
      ].join(","),
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .eq("categories.is_active", true)
    .maybeSingle()
    .overrideTypes<ProductDetail | null, { merge: false }>();

  if (error) {
    throwQueryError("product", error.message);
  }

  return data;
}

export async function getRelatedProducts(
  product: Pick<ProductDetail, "id" | "categories">,
): Promise<CatalogueProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      [
        "id",
        "slug",
        "name",
        "description",
        "base_price",
        "categories!inner(name,slug)",
        "product_images(image_url,alt_text,sort_order,is_primary)",
        "product_variants(size,color,stock_quantity)",
      ].join(","),
    )
    .eq("is_active", true)
    .eq("categories.slug", product.categories.slug)
    .eq("categories.is_active", true)
    .neq("id", product.id)
    .order("created_at", { ascending: false })
    .limit(4)
    .overrideTypes<CatalogueProduct[], { merge: false }>();

  if (error) {
    throwQueryError("related products", error.message);
  }

  return data ?? [];
}

export async function getPinnedNewArrivals(
  limit = 12,
): Promise<CatalogueProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      [
        "id",
        "slug",
        "name",
        "description",
        "base_price",
        "categories!inner(name,slug)",
        "product_images(image_url,alt_text,sort_order,is_primary)",
        "product_variants(size,color,stock_quantity)",
      ].join(","),
    )
    .eq("is_active", true)
    .eq("categories.is_active", true)
    .eq("is_pinned", true)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit)
    .overrideTypes<CatalogueProduct[], { merge: false }>();

  if (error) {
    // Gracefully return empty if the is_pinned migration has not been applied yet.
    if (error.code === "42703" || error.code === "PGRST204") {
      return [];
    }
    throwQueryError("pinned new arrivals", error.message);
  }

  return data ?? [];
}

export async function getCatalogueProducts(options: {
  filters: CatalogueFilters;
  categorySlug?: string;
  collectionSlug?: string;
  pinnedOnly?: boolean;
}): Promise<CataloguePageData & { redirectPage?: number }> {
  const supabase = await createClient();
  const { filters } = options;
  const from = (filters.page - 1) * pageSize;
  const { data, error, count } = await buildProductQuery(supabase, options)
    .range(from, from + pageSize - 1)
    .overrideTypes<CatalogueProduct[], { merge: false }>();

  if (error) {
    if (options.pinnedOnly && (error.code === "42703" || error.code === "PGRST204")) {
      return { products: [], total: 0, pageSize };
    }
    if (error.code === "PGRST103") {
      const { count: total, error: countError } = await buildProductQuery(
        supabase,
        options,
        true,
      );

      if (countError) {
        throwQueryError("product count", countError.message);
      }

      const lastPage = Math.max(1, Math.ceil((total ?? 0) / pageSize));
      if (filters.page > lastPage) {
        return {
          products: [],
          total: total ?? 0,
          pageSize,
          redirectPage: lastPage,
        };
      }
    }

    throwQueryError("products", error.message);
  }

  return {
    products: data ?? [],
    total: count ?? 0,
    pageSize,
  };
}
