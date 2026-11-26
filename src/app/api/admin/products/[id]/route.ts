import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import { isSameSiteRequest } from "@/lib/admin/is-same-site-request";
import { updateProductSchema } from "@/lib/admin/product-validation";

const idSchema = z.string().uuid();

function buildVariantSku(slug: string, suffix: string): string {
  const prefix = slug.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 24);
  const shortId = randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
  return `${prefix}-${suffix}-${shortId}`;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
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

  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Invalid product details.";
    return NextResponse.json({ error: firstIssue }, { status: 400 });
  }

  const data = parsed.data;

  const { data: existingProduct, error: existingError } = await admin.supabase
    .from("products")
    .select("id,slug")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: "Unable to load the selected product." }, { status: 500 });
  }
  if (!existingProduct) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const { data: category, error: categoryError } = await admin.supabase
    .from("categories")
    .select("id,slug")
    .eq("slug", data.categorySlug)
    .maybeSingle();

  if (categoryError || !category) {
    return NextResponse.json({ error: "Selected category was not found." }, { status: 404 });
  }

  const { data: updatedProduct, error: updateError } = await admin.supabase
    .from("products")
    .update({
      category_id: category.id,
      name: data.name,
      description: data.description,
      fabric: data.material,
      attributes: {
        material: data.material,
        color: data.color,
      },
      base_price: data.price,
      is_active: data.isActive,
    })
    .eq("id", id)
    .select("id,name,slug")
    .single();

  if (updateError || !updatedProduct) {
    return NextResponse.json(
      { error: updateError?.message ?? "Unable to update product." },
      { status: 500 },
    );
  }

  // Sync product_variants safely without deleting referenced rows
  const { data: existingVariants, error: variantsFetchError } = await admin.supabase
    .from("product_variants")
    .select("id,size,is_default")
    .eq("product_id", id);

  if (variantsFetchError) {
    return NextResponse.json(
      { error: "Product updated, but unable to load variants." },
      { status: 500 },
    );
  }

  const currentVariants = existingVariants ?? [];

  if (data.categorySlug === "clothing") {
    const enabledSizes = (data.sizeStocks ?? []).filter((item) => item.enabled);
    const enabledSizeSet = new Set<string>(enabledSizes.map((item) => item.size));

    // Clear default flag first to respect unique partial index
    await admin.supabase
      .from("product_variants")
      .update({ is_default: false })
      .eq("product_id", id)
      .eq("is_default", true);

    // Deactivate variants not in enabledSizes (including non-size variants)
    const toDeactivateIds = currentVariants
      .filter((v) => !v.size || !enabledSizeSet.has(v.size))
      .map((v) => v.id);

    if (toDeactivateIds.length > 0) {
      await admin.supabase
        .from("product_variants")
        .update({ is_active: false, is_default: false, stock_quantity: 0 })
        .in("id", toDeactivateIds);
    }

    for (let index = 0; index < enabledSizes.length; index++) {
      const item = enabledSizes[index];
      const match = currentVariants.find((v) => v.size === item.size);
      const isDefault = index === 0;

      if (match) {
        const { error: varUpdateErr } = await admin.supabase
          .from("product_variants")
          .update({
            color: data.color,
            attributes: { material: data.material },
            stock_quantity: item.stock,
            is_active: true,
            is_default: isDefault,
          })
          .eq("id", match.id);
        if (varUpdateErr) {
          return NextResponse.json({ error: varUpdateErr.message }, { status: 500 });
        }
      } else {
        const { error: varInsertErr } = await admin.supabase
          .from("product_variants")
          .insert({
            product_id: id,
            sku: buildVariantSku(existingProduct.slug, item.size),
            size: item.size,
            color: data.color,
            attributes: { material: data.material },
            additional_price: 0,
            stock_quantity: item.stock,
            is_active: true,
            is_default: isDefault,
          });
        if (varInsertErr) {
          return NextResponse.json({ error: varInsertErr.message }, { status: 500 });
        }
      }
    }
  } else {
    // Jewellery or Accessories: single non-size variant
    await admin.supabase
      .from("product_variants")
      .update({ is_default: false })
      .eq("product_id", id)
      .eq("is_default", true);

    const stdVariant = currentVariants.find((v) => !v.size) ?? currentVariants[0] ?? null;
    const otherIds = currentVariants
      .filter((v) => v.id !== stdVariant?.id)
      .map((v) => v.id);

    if (otherIds.length > 0) {
      await admin.supabase
        .from("product_variants")
        .update({ is_active: false, is_default: false, stock_quantity: 0 })
        .in("id", otherIds);
    }

    if (stdVariant) {
      const { error: stdUpdateErr } = await admin.supabase
        .from("product_variants")
        .update({
          size: null,
          color: data.color,
          attributes: { material: data.material },
          stock_quantity: data.stockQuantity ?? 0,
          is_active: true,
          is_default: true,
        })
        .eq("id", stdVariant.id);
      if (stdUpdateErr) {
        return NextResponse.json({ error: stdUpdateErr.message }, { status: 500 });
      }
    } else {
      const { error: stdInsertErr } = await admin.supabase
        .from("product_variants")
        .insert({
          product_id: id,
          sku: buildVariantSku(existingProduct.slug, "STD"),
          size: null,
          color: data.color,
          attributes: { material: data.material },
          additional_price: 0,
          stock_quantity: data.stockQuantity ?? 0,
          is_active: true,
          is_default: true,
        });
      if (stdInsertErr) {
        return NextResponse.json({ error: stdInsertErr.message }, { status: 500 });
      }
    }
  }

  // Handle explicit image removals
  if (data.removeImageIds.length > 0) {
    const { error: removeImgErr } = await admin.supabase
      .from("product_images")
      .delete()
      .eq("product_id", id)
      .in("id", data.removeImageIds);

    if (removeImgErr) {
      return NextResponse.json(
        { error: `Unable to remove selected images: ${removeImgErr.message}` },
        { status: 500 },
      );
    }
  }

  // Handle primary image selection among remaining existing images
  if (!data.willUploadPrimaryImage) {
    const { data: remainingImages } = await admin.supabase
      .from("product_images")
      .select("id,is_primary,sort_order")
      .eq("product_id", id)
      .order("sort_order", { ascending: true });

    if (remainingImages && remainingImages.length > 0) {
      const targetId =
        data.primaryImageId && remainingImages.some((img) => img.id === data.primaryImageId)
          ? data.primaryImageId
          : remainingImages.find((img) => img.is_primary)?.id ?? remainingImages[0].id;

      const currentPrimary = remainingImages.find((img) => img.is_primary);
      if (currentPrimary && currentPrimary.id !== targetId) {
        await admin.supabase
          .from("product_images")
          .update({ is_primary: false })
          .eq("id", currentPrimary.id);
      }

      if (!currentPrimary || currentPrimary.id !== targetId) {
        await admin.supabase
          .from("product_images")
          .update({ is_primary: true })
          .eq("id", targetId);
      }
    }
  }

  return NextResponse.json({ product: updatedProduct });
}
