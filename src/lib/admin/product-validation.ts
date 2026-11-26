import { z } from "zod";

export const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type ClothingSize = (typeof CLOTHING_SIZES)[number];

export const PRODUCT_CATEGORY_SLUGS = ["clothing", "jewellery", "accessories"] as const;
export type ProductCategorySlug = (typeof PRODUCT_CATEGORY_SLUGS)[number];

export const CATEGORY_LABELS: Record<ProductCategorySlug, string> = {
  clothing: "Clothing",
  jewellery: "Jewellery",
  accessories: "Accessories",
};

export function slugifyProductName(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "product";
}

export const clothingSizeStockSchema = z.object({
  size: z.enum(CLOTHING_SIZES),
  enabled: z.boolean(),
  stock: z.coerce.number().int().min(0, "Stock must be 0 or more."),
});

export const createProductSchema = z
  .object({
    categorySlug: z.enum(PRODUCT_CATEGORY_SLUGS),
    name: z.string().trim().min(2, "Product name must be at least 2 characters.").max(160),
    description: z.string().trim().max(4000).default(""),
    price: z.coerce.number().min(0, "Price must be 0 or more.").max(10000000),
    material: z.string().trim().min(1, "Material is required.").max(120),
    color: z.string().trim().min(1, "Colour is required.").max(80),
    isActive: z.boolean().default(true),
    stockQuantity: z.coerce.number().int().min(0, "Stock must be 0 or more.").optional(),
    sizeStocks: z.array(clothingSizeStockSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.categorySlug === "clothing") {
      const enabledSizes = (data.sizeStocks ?? []).filter((item) => item.enabled);
      if (enabledSizes.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sizeStocks"],
          message: "Select at least one available size for clothing products.",
        });
      }
    } else if (data.stockQuantity === undefined || !Number.isInteger(data.stockQuantity) || data.stockQuantity < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stockQuantity"],
        message: "Enter a valid available quantity.",
      });
    }
  });

export type CreateProductInput = z.infer<typeof createProductSchema>;
