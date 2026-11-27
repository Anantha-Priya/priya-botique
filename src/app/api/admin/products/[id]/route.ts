import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getDeletePermissionState } from "@/lib/admin/delete-permission";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import { isSameSiteRequest } from "@/lib/admin/is-same-site-request";
import { updateProductSchema } from "@/lib/admin/product-validation";
import { getCloudinaryServerClient } from "@/lib/cloudinary-server";

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

function extractCloudinaryPublicId(imageUrl: string, cloudName: string): string | null {
  try {
    const parsed = new URL(imageUrl);
    if (parsed.hostname !== "res.cloudinary.com") return null;
    const prefix = `/${cloudName}/image/upload/`;
    const idx = parsed.pathname.indexOf(prefix);
    if (idx === -1) return null;

    const rest = parsed.pathname.slice(idx + prefix.length);
    const segments = rest.split("/").filter(Boolean);
    // Skip transformation segments and optional version segment (v123456)
    while (segments.length > 0 && (segments[0].includes(",") || /^(f|q|w|h|c|dpr)_/.test(segments[0]))) {
      segments.shift();
    }
    if (segments.length > 0 && /^v\d+$/.test(segments[0])) {
      segments.shift();
    }
    if (segments.length === 0) return null;

    const joined = segments.join("/");
    const lastDot = joined.lastIndexOf(".");
    return lastDot > 0 ? joined.slice(0, lastDot) : joined;
  } catch {
    return null;
  }
}

export async function DELETE(
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

  const permission = await getDeletePermissionState(admin.user.id);
  if (!permission.enabled) {
    return NextResponse.json(
      {
        error:
          permission.status === "expired"
            ? "Your deletion permission has expired. Enable it again in Admin Profile."
            : "Product deletion is currently disabled.",
        code:
          permission.status === "expired"
            ? "DELETE_PERMISSION_EXPIRED"
            : "DELETE_PERMISSION_DISABLED",
      },
      { status: 403 },
    );
  }

  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
  }

  const { data: existingProduct, error: fetchError } = await admin.supabase
    .from("products")
    .select("id,name,product_images(id,image_url)")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json(
      { error: "Unable to load the selected product." },
      { status: 500 },
    );
  }
  if (!existingProduct) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const imageUrls = Array.from(
    new Set(
      (
        (existingProduct.product_images ?? []) as {
          id: string;
          image_url: string;
        }[]
      ).map((img) => img.image_url),
    ),
  );

  const { error: deleteError } = await admin.supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (deleteError) {
    if (deleteError.code === "23503") {
      return NextResponse.json(
        {
          error:
            "This product cannot be deleted permanently because it is referenced by existing order or customer records.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: deleteError.message || "Unable to delete product." },
      { status: 500 },
    );
  }

  // Safely clean up unshared Cloudinary assets after DB deletion succeeds
  const cloudinaryConfig = getCloudinaryServerClient();
  if (cloudinaryConfig && imageUrls.length > 0) {
    for (const imageUrl of imageUrls) {
      const publicId = extractCloudinaryPublicId(imageUrl, cloudinaryConfig.cloudName);
      if (!publicId) continue;

      const { count } = await admin.supabase
        .from("product_images")
        .select("id", { count: "exact", head: true })
        .eq("image_url", imageUrl);

      if ((count ?? 0) === 0) {
        await cloudinaryConfig.client.uploader
          .destroy(publicId, { resource_type: "image" })
          .catch(() => null);
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/new-arrivals");
  revalidatePath("/admin/products");
  revalidatePath("/admin/new-arrivals");
  revalidatePath("/admin/dashboard");

  return NextResponse.json({ deleted: true, id });
}
