"use client";

import Link from "next/link";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { CheckCircle2, ImagePlus, Trash2, UploadCloud } from "lucide-react";
import {
  CATEGORY_LABELS,
  CLOTHING_SIZES,
  PRODUCT_CATEGORY_SLUGS,
  type ClothingSize,
  type ProductCategorySlug,
} from "@/lib/admin/product-validation";
import {
  cloudinaryImageMimeTypes,
  cloudinaryMaxImageBytes,
} from "@/lib/cloudinary-upload";
import { formatINR } from "@/lib/format-currency";

interface SelectedImageFile {
  id: string;
  file: File;
  previewUrl: string;
  altText: string;
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

type SizeStockState = Record<ClothingSize, { enabled: boolean; stock: string }>;

function createInitialSizeStocks(): SizeStockState {
  return {
    XS: { enabled: false, stock: "0" },
    S: { enabled: true, stock: "5" },
    M: { enabled: true, stock: "5" },
    L: { enabled: true, stock: "5" },
    XL: { enabled: true, stock: "5" },
    XXL: { enabled: false, stock: "0" },
  };
}

async function uploadSingleProductImage(
  productId: string,
  item: SelectedImageFile,
  fallbackAlt: string,
): Promise<void> {
  const signatureResponse = await fetch("/api/admin/cloudinary-signature", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ productId }),
  });
  if (!signatureResponse.ok) {
    const err = (await signatureResponse.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error ?? "Unable to get image upload signature.");
  }

  const signature = (await signatureResponse.json()) as SignatureResponse;
  const uploadData = new FormData();
  uploadData.set("file", item.file);
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
    const err = (await cloudinaryResponse.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(err?.error?.message ?? "Cloudinary image upload failed.");
  }

  const uploaded = (await cloudinaryResponse.json()) as CloudinaryUploadResponse;
  const saveResponse = await fetch("/api/admin/product-images", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      productId,
      publicId: uploaded.public_id,
      secureUrl: uploaded.secure_url,
      altText: item.altText.trim() || fallbackAlt,
    }),
  });
  if (!saveResponse.ok) {
    const err = (await saveResponse.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error ?? "Unable to save uploaded image.");
  }
}

export function ProductCreateForm({
  initialCategory = "clothing",
  cloudinaryConfigured,
}: {
  initialCategory?: ProductCategorySlug;
  cloudinaryConfigured: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categorySlug, setCategorySlug] = useState<ProductCategorySlug>(initialCategory);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [material, setMaterial] = useState("");
  const [color, setColor] = useState("");
  const [stockQuantity, setStockQuantity] = useState("10");
  const [sizeStocks, setSizeStocks] = useState<SizeStockState>(createInitialSizeStocks);
  const [isActive, setIsActive] = useState(true);
  const [selectedImages, setSelectedImages] = useState<SelectedImageFile[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<{
    id: string;
    name: string;
    slug: string;
    warning?: string;
  } | null>(null);

  const isClothing = categorySlug === "clothing";

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const validFiles: SelectedImageFile[] = [];
    for (const file of files) {
      if (!cloudinaryImageMimeTypes.some((type) => type === file.type)) {
        setError(`"${file.name}" is not a supported format. Choose JPEG, PNG, WebP, or AVIF.`);
        continue;
      }
      if (file.size <= 0 || file.size > cloudinaryMaxImageBytes) {
        setError(`"${file.name}" must be under ${cloudinaryMaxImageBytes / 1024 / 1024} MB.`);
        continue;
      }
      validFiles.push({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        altText: "",
      });
    }

    if (validFiles.length > 0) {
      setSelectedImages((current) => [...current, ...validFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeSelectedImage(id: string) {
    setSelectedImages((current) => {
      const target = current.find((img) => img.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return current.filter((img) => img.id !== id);
    });
  }

  function updateImageAlt(id: string, altText: string) {
    setSelectedImages((current) =>
      current.map((img) => (img.id === id ? { ...img, altText } : img)),
    );
  }

  function toggleSize(size: ClothingSize) {
    setSizeStocks((current) => ({
      ...current,
      [size]: {
        ...current[size],
        enabled: !current[size].enabled,
      },
    }));
  }

  function updateSizeStock(size: ClothingSize, value: string) {
    setSizeStocks((current) => ({
      ...current,
      [size]: {
        ...current[size],
        stock: value,
      },
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCreatedProduct(null);

    if (selectedImages.length > 0 && !cloudinaryConfigured) {
      setError(
        "Cloudinary environment variables are not configured. Remove selected images or configure Cloudinary to upload images.",
      );
      return;
    }

    if (isClothing) {
      const hasEnabled = CLOTHING_SIZES.some((size) => sizeStocks[size].enabled);
      if (!hasEnabled) {
        setError("Select at least one available size for clothing products.");
        return;
      }
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setError("Enter a valid price in INR.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        categorySlug,
        name: name.trim(),
        description: description.trim(),
        price: numericPrice,
        material: material.trim(),
        color: color.trim(),
        isActive,
        ...(isClothing
          ? {
              sizeStocks: CLOTHING_SIZES.map((size) => ({
                size,
                enabled: sizeStocks[size].enabled,
                stock: Math.max(0, Number.parseInt(sizeStocks[size].stock || "0", 10) || 0),
              })),
            }
          : {
              stockQuantity: Math.max(0, Number.parseInt(stockQuantity || "0", 10) || 0),
            }),
      };

      const createResponse = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const createBody = (await createResponse.json().catch(() => null)) as
        | { product?: { id: string; name: string; slug: string }; error?: string }
        | null;

      if (!createResponse.ok || !createBody?.product) {
        throw new Error(createBody?.error ?? "Unable to create product.");
      }

      const product = createBody.product;
      let warning: string | undefined;

      if (selectedImages.length > 0) {
        try {
          for (const image of selectedImages) {
            await uploadSingleProductImage(product.id, image, product.name);
          }
        } catch (uploadError) {
          warning =
            uploadError instanceof Error
              ? `Product created, but one or more images failed to upload: ${uploadError.message}`
              : "Product created, but image upload failed.";
        }
      }

      for (const item of selectedImages) {
        URL.revokeObjectURL(item.previewUrl);
      }

      setCreatedProduct({
        id: product.id,
        name: product.name,
        slug: product.slug,
        warning,
      });
      setName("");
      setDescription("");
      setPrice("");
      setMaterial("");
      setColor("");
      setStockQuantity("10");
      setSizeStocks(createInitialSizeStocks());
      setSelectedImages([]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create product.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {createdProduct ? (
        <div
          role="status"
          className="rounded-2xl border border-brand-champagne bg-brand-beige/60 p-5 text-sm"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-burgundy" aria-hidden="true" />
            <div className="space-y-2">
              <p className="font-semibold text-foreground">
                “{createdProduct.name}” has been created in {CATEGORY_LABELS[categorySlug]}.
              </p>
              {createdProduct.warning ? (
                <p className="text-destructive">{createdProduct.warning}</p>
              ) : null}
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href={`/products/${createdProduct.slug}`}
                  className="inline-flex items-center rounded-lg bg-brand-burgundy px-4 py-2 text-xs font-semibold text-white hover:bg-brand-burgundy/90"
                >
                  View Product
                </Link>
                <Link
                  href="/admin/products"
                  className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
                >
                  Back to Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <section className="rounded-2xl border border-border bg-card p-6 shadow-(--shadow-card) sm:p-8">
        <h2 className="font-heading text-xl font-medium text-foreground">Category</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Fields below adapt automatically based on the selected category.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {PRODUCT_CATEGORY_SLUGS.map((slug) => {
            const active = categorySlug === slug;
            return (
              <button
                key={slug}
                type="button"
                onClick={() => {
                  setCategorySlug(slug);
                  setError("");
                }}
                aria-pressed={active}
                className={`min-h-11 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "border-brand-burgundy bg-brand-burgundy text-white"
                    : "border-border bg-background text-foreground hover:bg-secondary"
                }`}
              >
                {CATEGORY_LABELS[slug]}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-(--shadow-card) sm:p-8">
        <h2 className="font-heading text-xl font-medium text-foreground">Product Images</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload one or multiple product photos (JPEG, PNG, WebP, or AVIF, up to{" "}
          {cloudinaryMaxImageBytes / 1024 / 1024} MB each).
        </p>

        <div className="mt-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-brand-champagne bg-background/60 px-4 py-8 text-center transition-colors hover:bg-brand-beige/40">
            <UploadCloud className="size-8 text-brand-burgundy" aria-hidden="true" />
            <span className="mt-2 text-sm font-semibold text-foreground">
              Click to select product images
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              First image will be set as the primary product image
            </span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={cloudinaryImageMimeTypes.join(",")}
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
        </div>

        {selectedImages.length > 0 ? (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {selectedImages.map((image, index) => (
              <li
                key={image.id}
                className="flex items-start gap-3 rounded-xl border border-border bg-background p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.previewUrl}
                  alt={image.altText || `Preview ${index + 1}`}
                  className="size-20 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium text-foreground">
                      {index === 0 ? "Primary · " : ""}
                      {image.file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSelectedImage(image.id)}
                      aria-label={`Remove ${image.file.name}`}
                      className="rounded p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={image.altText}
                    onChange={(event) => updateImageAlt(image.id, event.target.value)}
                    placeholder="Alt text (optional, defaults to product name)"
                    maxLength={300}
                    className="min-h-9 w-full rounded-md border border-border bg-card px-2.5 text-xs text-foreground"
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <ImagePlus className="size-4 text-brand-burgundy" aria-hidden="true" />
            You can also upload or add more images later from Product Images.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-(--shadow-card) sm:p-8">
        <h2 className="font-heading text-xl font-medium text-foreground">
          {CATEGORY_LABELS[categorySlug]} Details
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-foreground sm:col-span-2">
            Product Name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={160}
              placeholder={
                isClothing
                  ? "e.g. Banarasi Silk Anarkali"
                  : categorySlug === "jewellery"
                    ? "e.g. Kundan Pearl Jhumka"
                    : "e.g. Embroidered Potli Clutch"
              }
              className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-foreground sm:col-span-2">
            Product Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              maxLength={4000}
              placeholder="Describe the craftsmanship, styling, and care details..."
              className="rounded-lg border border-border bg-background p-3 text-sm text-foreground"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            <span>
              Product Price (INR)
              {price && Number.isFinite(Number(price)) ? (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({formatINR(Number(price))})
                </span>
              ) : null}
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
              placeholder="e.g. 4990"
              className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Material
            <input
              type="text"
              value={material}
              onChange={(event) => setMaterial(event.target.value)}
              required
              maxLength={120}
              placeholder={
                isClothing
                  ? "e.g. Pure Mulberry Silk"
                  : categorySlug === "jewellery"
                    ? "e.g. 22k Gold-Plated Brass & Kundan"
                    : "e.g. Handwoven Raw Silk"
              }
              className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Colour
            <input
              type="text"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              required
              maxLength={80}
              placeholder="e.g. Burgundy"
              className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
            />
          </label>

          {!isClothing ? (
            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              Available Quantity / Stock
              <input
                type="number"
                min="0"
                step="1"
                value={stockQuantity}
                onChange={(event) => setStockQuantity(event.target.value)}
                required
                className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              />
            </label>
          ) : null}
        </div>

        {isClothing ? (
          <div className="mt-6 border-t border-border pt-6">
            <h3 className="text-sm font-semibold text-foreground">
              Available Sizes & Per-Size Stock
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Toggle the sizes offered for this garment and set the stock quantity for each.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CLOTHING_SIZES.map((size) => {
                const entry = sizeStocks[size];
                return (
                  <div
                    key={size}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${
                      entry.enabled
                        ? "border-brand-burgundy bg-brand-beige/40"
                        : "border-border bg-background/60 opacity-75"
                    }`}
                  >
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-foreground">
                      <input
                        type="checkbox"
                        checked={entry.enabled}
                        onChange={() => toggleSize(size)}
                        className="size-4 accent-brand-burgundy"
                      />
                      {size}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Qty</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        disabled={!entry.enabled}
                        value={entry.stock}
                        onChange={(event) => updateSizeStock(size, event.target.value)}
                        aria-label={`Stock quantity for size ${size}`}
                        className="min-h-9 w-20 rounded-md border border-border bg-card px-2.5 text-sm text-foreground disabled:opacity-40"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <label className="mt-6 flex items-center gap-2.5 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="size-4 accent-brand-burgundy"
          />
          Publish product immediately (visible to customers)
        </label>
      </section>

      {error ? (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="min-h-12 rounded-lg bg-brand-burgundy px-8 text-sm font-semibold text-white transition-colors hover:bg-brand-burgundy/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? "Creating product..."
            : `Create ${CATEGORY_LABELS[categorySlug]} Product`}
        </button>
        <Link
          href="/admin/products"
          className="inline-flex min-h-12 items-center rounded-lg border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
