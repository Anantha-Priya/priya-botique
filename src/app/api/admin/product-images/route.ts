import { v2 as cloudinary } from "cloudinary";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import {
  cloudinaryImageFormats,
  cloudinaryMaxImageBytes,
  isValidCloudinaryProductImageId,
} from "@/lib/cloudinary-upload";

const requestSchema = z.object({
  productId: z.string().uuid(),
  publicId: z.string().min(1).max(255),
  secureUrl: z.string().url(),
  altText: z.string().trim().min(1).max(300),
});

function isAllowedOrigin(request: NextRequest): boolean {
  const requestOrigin = request.headers.get("origin");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!requestOrigin || !siteUrl) {
    return false;
  }

  try {
    return new URL(requestOrigin).origin === new URL(siteUrl).origin;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
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
  const parsedBody = requestSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Uploaded image details are invalid." }, { status: 400 });
  }

  const { productId, publicId, secureUrl, altText } = parsedBody.data;
  if (!isValidCloudinaryProductImageId(publicId, productId)) {
    return NextResponse.json({ error: "Uploaded image is not scoped to this product." }, { status: 400 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary server configuration is incomplete." },
      { status: 503 },
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  let asset;
  try {
    asset = await cloudinary.api.resource(publicId, {
      resource_type: "image",
      type: "upload",
    });
  } catch {
    return NextResponse.json(
      { error: "Cloudinary could not verify the uploaded image." },
      { status: 422 },
    );
  }

  if (
    asset.resource_type !== "image" ||
    asset.public_id !== publicId ||
    asset.secure_url !== secureUrl ||
    !cloudinaryImageFormats.includes(
      asset.format as (typeof cloudinaryImageFormats)[number],
    ) ||
    asset.bytes <= 0 ||
    asset.bytes > cloudinaryMaxImageBytes
  ) {
    return NextResponse.json(
      { error: "The uploaded asset does not meet the image requirements." },
      { status: 422 },
    );
  }

  const { data: product, error: productError } = await admin.supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .maybeSingle();

  if (productError) {
    return NextResponse.json({ error: "Unable to verify the selected product." }, { status: 500 });
  }
  if (!product) {
    return NextResponse.json({ error: "The selected product was not found." }, { status: 404 });
  }

  const { data: existingImages, error: imagesError } = await admin.supabase
    .from("product_images")
    .select("sort_order,is_primary")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false });

  if (imagesError) {
    return NextResponse.json({ error: "Unable to read existing product images." }, { status: 500 });
  }

  const { data: savedImage, error: insertError } = await admin.supabase
    .from("product_images")
    .insert({
      product_id: productId,
      image_url: asset.secure_url,
      alt_text: altText,
      sort_order: (existingImages?.[0]?.sort_order ?? -1) + 1,
      is_primary: !existingImages?.some((image) => image.is_primary),
    })
    .select("id,image_url,alt_text,sort_order,is_primary")
    .single();

  if (insertError) {
    return NextResponse.json(
      {
        error:
          "The image was uploaded, but could not be attached to the product. Contact an administrator with its Cloudinary public ID.",
        publicId,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ image: savedImage }, { status: 201 });
}
