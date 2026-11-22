export const cloudinaryImageMimeTypes = [
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const cloudinaryImageFormats = ["avif", "jpg", "png", "webp"] as const;
export const cloudinaryMaxImageBytes = 10 * 1024 * 1024;
export const cloudinaryUploadPreset = "priya-product-images";

export function isAllowedCloudinaryImage(file: {
  type: string;
  size: number;
}): boolean {
  return (
    cloudinaryImageMimeTypes.some((mimeType) => mimeType === file.type) &&
    file.size > 0 &&
    file.size <= cloudinaryMaxImageBytes
  );
}

export function isValidCloudinaryProductImageId(
  publicId: string,
  productId: string,
): boolean {
  const safeProductId = productId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^priya-products/${safeProductId}/[a-f0-9]{32}$`).test(
    publicId,
  );
}
