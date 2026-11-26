import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import { isSameSiteRequest } from "@/lib/admin/is-same-site-request";
import {
  createProductSchema,
  slugifyProductName,
} from "@/lib/admin/product-validation";

function buildVariantSku(slug: string, suffix: string): string {
  const prefix = slug.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 24);
  const shortId = randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
  return `${prefix}-${suffix}-${shortId}`;
}

export async function POST(request: NextRequest) {
  if (!isSameSiteRequest(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }

  const admin = await getAdminContext();
  if (!admin.user) {
    return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  }
  if (!admin.isAdmin) {
    return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Invalid product details.";
    return NextResponse.json({ error: firstIssue }, { status: 400 });
  }

  const data = parsed.data;

  const { data: category, error: categoryError } = await admin.supabase
    .from("categories")
    .select("id,slug,name")
    .eq("slug", data.categorySlug)
    .maybeSingle();

  if (categoryError) {
    return NextResponse.json({ error: "Unable to look up the selected category." }, { status: 500 });
  }
  if (!category) {
    return NextResponse.json({ error: "Selected category was not found." }, { status: 404 });
  }

  const baseSlug = slugifyProductName(data.name);
  const { data: existingSlug } = await admin.supabase
    .from("products")
    .select("id")
    .eq("slug", baseSlug)
    .maybeSingle();

  const finalSlug = existingSlug
    ? `${baseSlug}-${randomUUID().replaceAll("-", "").slice(0, 6)}`
    : baseSlug;

  const { data: product, error: productError } = await admin.supabase
    .from("products")
    .insert({
      category_id: category.id,
      name: data.name,
      slug: finalSlug,
      description: data.description,
      fabric: data.material,
      attributes: {
        material: data.material,
        color: data.color,
      },
      base_price: data.price,
      is_active: data.isActive,
    })
    .select("id,name,slug")
    .single();

  if (productError || !product) {
    return NextResponse.json(
      { error: productError?.message ?? "Unable to create product." },
      { status: 500 },
    );
  }

  const variantRows: {
    product_id: string;
    sku: string;
    size: string | null;
    color: string;
    attributes: { material: string };
    additional_price: number;
    stock_quantity: number;
    is_active: boolean;
    is_default: boolean;
  }[] =
    data.categorySlug === "clothing"
      ? (data.sizeStocks ?? [])
          .filter((item) => item.enabled)
          .map((item, index) => ({
            product_id: product.id,
            sku: buildVariantSku(finalSlug, item.size),
            size: item.size,
            color: data.color,
            attributes: { material: data.material },
            additional_price: 0,
            stock_quantity: item.stock,
            is_active: true,
            is_default: index === 0,
          }))
      : [
          {
            product_id: product.id,
            sku: buildVariantSku(finalSlug, "STD"),
            size: null,
            color: data.color,
            attributes: { material: data.material },
            additional_price: 0,
            stock_quantity: data.stockQuantity ?? 0,
            is_active: true,
            is_default: true,
          },
        ];

  const { error: variantError } = await admin.supabase
    .from("product_variants")
    .insert(variantRows);

  if (variantError) {
    await admin.supabase.from("products").delete().eq("id", product.id);
    return NextResponse.json(
      { error: `Unable to save product stock variants: ${variantError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ product }, { status: 201 });
}
