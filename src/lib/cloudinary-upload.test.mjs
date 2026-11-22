import assert from "node:assert/strict";
import test from "node:test";
import { optimizeCloudinaryImageUrl } from "./cloudinary-image.ts";
import {
  cloudinaryMaxImageBytes,
  isAllowedCloudinaryImage,
  isValidCloudinaryProductImageId,
} from "./cloudinary-upload.ts";

test("Cloudinary delivery uses automatic format and quality transformations", () => {
  assert.equal(
    optimizeCloudinaryImageUrl(
      "https://res.cloudinary.com/demo/image/upload/v123/products/dress.jpg",
    ),
    "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_1600/v123/products/dress.jpg",
  );
});

test("Cloudinary delivery preserves existing transforms and other image hosts", () => {
  const transformed =
    "https://res.cloudinary.com/demo/image/upload/w_800/v123/dress.jpg";
  const external = "https://images.example.com/dress.jpg";

  assert.equal(optimizeCloudinaryImageUrl(transformed), transformed);
  assert.equal(optimizeCloudinaryImageUrl(external), external);
});

test("upload validation accepts only supported image formats within the size cap", () => {
  assert.equal(isAllowedCloudinaryImage({ type: "image/webp", size: 100 }), true);
  assert.equal(
    isAllowedCloudinaryImage({
      type: "image/jpeg",
      size: cloudinaryMaxImageBytes,
    }),
    true,
  );
  assert.equal(
    isAllowedCloudinaryImage({
      type: "image/svg+xml",
      size: 100,
    }),
    false,
  );
  assert.equal(
    isAllowedCloudinaryImage({
      type: "image/png",
      size: cloudinaryMaxImageBytes + 1,
    }),
    false,
  );
});

test("upload public IDs are scoped to a product and use generated identifiers", () => {
  const productId = "6a8d1c4e-7b21-4f90-bd4e-4e370d2a6123";

  assert.equal(
    isValidCloudinaryProductImageId(
      `priya-products/${productId}/0123456789abcdef0123456789abcdef`,
      productId,
    ),
    true,
  );
  assert.equal(
    isValidCloudinaryProductImageId(
      "priya-products/another-product/0123456789abcdef0123456789abcdef",
      productId,
    ),
    false,
  );
});
