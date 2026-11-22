import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import {
  cloudinaryUploadPreset,
  isValidCloudinaryProductImageId,
} from "@/lib/cloudinary-upload";

const requestSchema = z.object({
  productId: z.string().uuid(),
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
    return NextResponse.json({ error: "A valid product ID is required." }, { status: 400 });
  }

  const { data: product, error: productError } = await admin.supabase
    .from("products")
    .select("id")
    .eq("id", parsedBody.data.productId)
    .maybeSingle();

  if (productError) {
    return NextResponse.json({ error: "Unable to verify the selected product." }, { status: 500 });
  }
  if (!product) {
    return NextResponse.json({ error: "The selected product was not found." }, { status: 404 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset =
    process.env.CLOUDINARY_UPLOAD_PRESET ?? cloudinaryUploadPreset;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary server configuration is incomplete." },
      { status: 503 },
    );
  }

  const publicId = `priya-products/${product.id}/${randomUUID().replaceAll("-", "")}`;
  if (!isValidCloudinaryProductImageId(publicId, product.id)) {
    throw new Error("Generated Cloudinary public ID was invalid.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  const paramsToSign = {
    overwrite: false,
    public_id: publicId,
    timestamp: Math.floor(Date.now() / 1000),
    upload_preset: uploadPreset,
  };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return NextResponse.json({
    cloudName,
    apiKey,
    params: paramsToSign,
    signature,
  });
}
