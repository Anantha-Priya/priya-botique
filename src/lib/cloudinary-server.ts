import "server-only";

import { v2 as cloudinary } from "cloudinary";
import { cloudinaryUploadPreset } from "@/lib/cloudinary-upload";

export function getCloudinaryServerClient() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return {
    client: cloudinary,
    cloudName,
    apiKey,
    apiSecret,
    uploadPreset:
      process.env.CLOUDINARY_UPLOAD_PRESET?.trim() || cloudinaryUploadPreset,
  };
}
