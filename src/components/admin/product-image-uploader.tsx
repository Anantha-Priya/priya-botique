"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  cloudinaryImageMimeTypes,
  cloudinaryMaxImageBytes,
  isAllowedCloudinaryImage,
} from "@/lib/cloudinary-upload";

interface ProductOption {
  id: string;
  name: string;
  slug: string;
}

interface SignatureResponse {
  cloudName: string;
  apiKey: string;
  params: {
    overwrite: boolean;
    public_id: string;
    timestamp: number;
    upload_preset: string;
  };
  signature: string;
}

interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
}

async function getResponseError(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as
    | { error?: string; publicId?: string }
    | null;
  if (body?.publicId) {
    return `${body.error ?? "The image could not be saved."} Cloudinary public ID: ${body.publicId}`;
  }
  return body?.error ?? `Request failed with status ${response.status}.`;
}

export function ProductImageUploader({ products }: { products: ProductOption[] }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [altText, setAltText] = useState("");
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function uploadImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const file = fileInput.current?.files?.[0];
    if (!file || !isAllowedCloudinaryImage(file)) {
      setMessage("Choose a JPEG, PNG, WebP, or AVIF image up to 10 MB.");
      return;
    }

    if (!altText.trim()) {
      setMessage("Enter descriptive alt text for this image.");
      return;
    }

    setIsUploading(true);

    try {
      const signatureResponse = await fetch("/api/admin/cloudinary-signature", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!signatureResponse.ok) {
        throw new Error(await getResponseError(signatureResponse));
      }

      const signature = (await signatureResponse.json()) as SignatureResponse;
      const uploadData = new FormData();
      uploadData.set("file", file);
      uploadData.set("api_key", signature.apiKey);
      uploadData.set("signature", signature.signature);
      for (const [key, value] of Object.entries(signature.params)) {
        uploadData.set(key, String(value));
      }

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/image/upload`,
        { method: "POST", body: uploadData },
      );
      if (!cloudinaryResponse.ok) {
        const cloudinaryError = (await cloudinaryResponse.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(
          cloudinaryError?.error?.message ??
            `Cloudinary upload failed with status ${cloudinaryResponse.status}.`,
        );
      }

      const uploaded = (await cloudinaryResponse.json()) as CloudinaryUploadResponse;
      const saveResponse = await fetch("/api/admin/product-images", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId,
          publicId: uploaded.public_id,
          secureUrl: uploaded.secure_url,
          altText: altText.trim(),
        }),
      });
      if (!saveResponse.ok) {
        throw new Error(await getResponseError(saveResponse));
      }

      setMessage("Image uploaded and attached to the product.");
      setAltText("");
      if (fileInput.current) {
        fileInput.current.value = "";
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "The image upload failed.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={uploadImage} className="max-w-2xl space-y-5">
      <label className="grid gap-2 text-sm font-medium">
        Product
        <select
          value={productId}
          onChange={(event) => setProductId(event.target.value)}
          required
          className="min-h-11 rounded-md border border-border bg-white px-3"
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.slug})
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Image file
        <input
          ref={fileInput}
          type="file"
          accept={cloudinaryImageMimeTypes.join(",")}
          required
          className="min-h-11 rounded-md border border-border bg-white p-2 text-sm"
        />
        <span className="text-xs font-normal text-muted-foreground">
          JPEG, PNG, WebP, or AVIF; maximum {cloudinaryMaxImageBytes / 1024 / 1024} MB.
        </span>
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Image alt text
        <input
          value={altText}
          onChange={(event) => setAltText(event.target.value)}
          maxLength={300}
          required
          className="min-h-11 rounded-md border border-border bg-white px-3"
          placeholder="Describe the product and view shown"
        />
      </label>

      <button
        type="submit"
        disabled={isUploading || !productId}
        className="min-h-11 rounded-md bg-brand-burgundy px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isUploading ? "Uploading..." : "Upload product image"}
      </button>

      {message ? (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
    </form>
  );
}
