"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  CheckCircle2,
  ImagePlus,
  RotateCcw,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";
import {
  CATEGORY_LABELS,
  CLOTHING_SIZES,
  PRODUCT_CATEGORY_SLUGS,
  type ClothingSize,
  type ProductCategorySlug,
} from "@/lib/admin/product-validation";
import { optimizeCloudinaryImageUrl } from "@/lib/cloudinary-image";
import {
  cloudinaryImageMimeTypes,
  cloudinaryMaxImageBytes,
} from "@/lib/cloudinary-upload";
import { formatINR } from "@/lib/format-currency";

export interface ExistingProductImage {
  id: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
}

export interface EditableProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  material: string;
  color: string;
  categorySlug: ProductCategorySlug;
  isActive: boolean;
  stockQuantity: number;
  sizeStocks: Record<ClothingSize, { enabled: boolean; stock: string }>;
  images: ExistingProductImage[];
}

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
  isPrimary: boolean,
): Promise<ExistingProductImage> {
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
      isPrimary,
    }),
  });
  const saveBody = (await saveResponse.json().catch(() => null)) as
    | { image?: ExistingProductImage; error?: string }
    | null;
  if (!saveResponse.ok || !saveBody?.image) {
    throw new Error(saveBody?.error ?? "Unable to save uploaded image.");
  }
  return saveBody.image;
}

export function ProductForm({
  mode = "create",
  initialCategory = "clothing",
  initialProduct,
  cloudinaryConfigured,
}: {
  mode?: "create" | "edit";
  initialCategory?: ProductCategorySlug;
  initialProduct?: EditableProductData;
  cloudinaryConfigured: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = mode === "edit" && Boolean(initialProduct);

  const [categorySlug, setCategorySlug] = useState<ProductCategorySlug>(
    initialProduct?.categorySlug ?? initialCategory,
  );
  const [name, setName] = useState(initialProduct?.name ?? "");
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [price, setPrice] = useState(
    initialProduct ? String(initialProduct.price) : "",
  );
  const [material, setMaterial] = useState(initialProduct?.material ?? "");
  const [color, setColor] = useState(initialProduct?.color ?? "");
  const [stockQuantity, setStockQuantity] = useState(
    initialProduct ? String(initialProduct.stockQuantity) : "10",
  );
  const [sizeStocks, setSizeStocks] = useState<SizeStockState>(
    initialProduct?.sizeStocks ?? createInitialSizeStocks,
  );
  const [isActive, setIsActive] = useState(initialProduct?.isActive ?? true);

  const [existingImages, setExistingImages] = useState<ExistingProductImage[]>(
    () =>
      [...(initialProduct?.images ?? [])].sort(
        (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order,
      ),
  );
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<SelectedImageFile[]>([]);
  const [primaryTarget, setPrimaryTarget] = useState<string>(() => {
    const primaryExisting =
      initialProduct?.images.find((img) => img.is_primary) ?? initialProduct?.images[0];
    return primaryExisting ? `existing:${primaryExisting.id}` : "";
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [savedProduct, setSavedProduct] = useState<{
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
      setSelectedImages((current) => {
        const next = [...current, ...validFiles];
        const hasActivePrimary =
          (primaryTarget.startsWith("existing:") &&
            !removedImageIds.includes(primaryTarget.slice(9))) ||
          primaryTarget.startsWith("new:");
        if (!hasActivePrimary && validFiles[0]) {
          setPrimaryTarget(`new:${validFiles[0].id}`);
        }
        return next;
      });
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
      const remainingNew = current.filter((img) => img.id !== id);

      if (primaryTarget === `new:${id}`) {
        const firstRemainingExisting = existingImages.find(
          (img) => !removedImageIds.includes(img.id),
        );
        if (firstRemainingExisting) {
          setPrimaryTarget(`existing:${firstRemainingExisting.id}`);
        } else if (remainingNew[0]) {
          setPrimaryTarget(`new:${remainingNew[0].id}`);
        } else {
          setPrimaryTarget("");
        }
      }
      return remainingNew;
    });
  }

  function toggleRemoveExistingImage(id: string) {
    setRemovedImageIds((current) => {
      const isCurrentlyRemoved = current.includes(id);
      const next = isCurrentlyRemoved
        ? current.filter((item) => item !== id)
        : [...current, id];

      if (!isCurrentlyRemoved && primaryTarget === `existing:${id}`) {
        const fallbackExisting = existingImages.find(
          (img) => img.id !== id && !next.includes(img.id),
        );
        if (fallbackExisting) {
          setPrimaryTarget(`existing:${fallbackExisting.id}`);
        } else if (selectedImages[0]) {
          setPrimaryTarget(`new:${selectedImages[0].id}`);
        } else {
          setPrimaryTarget("");
        }
      } else if (isCurrentlyRemoved && !primaryTarget) {
        setPrimaryTarget(`existing:${id}`);
      }

      return next;
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
    setSavedProduct(null);

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
      const basePayload = {
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

      const endpoint =
        isEdit && initialProduct
          ? `/api/admin/products/${initialProduct.id}`
          : "/api/admin/products";
      const method = isEdit ? "PATCH" : "POST";
      const payload = isEdit
        ? {
            ...basePayload,
            removeImageIds: removedImageIds,
            primaryImageId: primaryTarget.startsWith("existing:")
              ? primaryTarget.slice(9)
              : null,
            willUploadPrimaryImage: primaryTarget.startsWith("new:"),
          }
        : basePayload;

      const saveResponse = await fetch(endpoint, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const saveBody = (await saveResponse.json().catch(() => null)) as
        | { product?: { id: string; name: string; slug: string }; error?: string }
        | null;

      if (!saveResponse.ok || !saveBody?.product) {
        throw new Error(
          saveBody?.error ?? `Unable to ${isEdit ? "update" : "create"} product.`,
        );
      }

      const product = saveBody.product;
      let warning: string | undefined;
      const newlySavedImages: ExistingProductImage[] = [];

      if (selectedImages.length > 0) {
        try {
          for (let index = 0; index < selectedImages.length; index++) {
            const image = selectedImages[index];
            const isPrimaryNew =
              primaryTarget === `new:${image.id}` ||
              (!primaryTarget &&
                index === 0 &&
                existingImages.length === removedImageIds.length);
            const savedImg = await uploadSingleProductImage(
              product.id,
              image,
              product.name,
              isPrimaryNew,
            );
            newlySavedImages.push(savedImg);
          }
        } catch (uploadError) {
          warning =
            uploadError instanceof Error
              ? `Product ${isEdit ? "updated" : "created"}, but one or more images failed to upload: ${uploadError.message}`
              : `Product ${isEdit ? "updated" : "created"}, but image upload failed.`;
        }
      }

      for (const item of selectedImages) {
        URL.revokeObjectURL(item.previewUrl);
      }

      if (isEdit) {
        const remainingExisting = existingImages
          .filter((img) => !removedImageIds.includes(img.id))
          .map((img) => ({
            ...img,
            is_primary: primaryTarget === `existing:${img.id}`,
          }));
        const merged = [...remainingExisting, ...newlySavedImages];
        setExistingImages(merged);
        setRemovedImageIds([]);
        setSelectedImages([]);
        const nextPrimary = merged.find((img) => img.is_primary) ?? merged[0];
        setPrimaryTarget(nextPrimary ? `existing:${nextPrimary.id}` : "");
        router.refresh();
      } else {
        setName("");
        setDescription("");
        setPrice("");
        setMaterial("");
        setColor("");
        setStockQuantity("10");
        setSizeStocks(createInitialSizeStocks());
        setSelectedImages([]);
        setPrimaryTarget("");
      }

      setSavedProduct({
        id: product.id,
        name: product.name,
        slug: product.slug,
        warning,
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : `Unable to ${isEdit ? "update" : "create"} product.`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {savedProduct ? (
        <div
          role="status"
          className="rounded-2xl border border-brand-champagne bg-brand-beige/60 p-5 text-sm"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-burgundy" aria-hidden="true" />
            <div className="space-y-2">
              <p className="font-semibold text-foreground">
                “{savedProduct.name}” has been {isEdit ? "updated" : "created"} in{" "}
                {CATEGORY_LABELS[categorySlug]}.
              </p>
              {savedProduct.warning ? (
                <p className="text-destructive">{savedProduct.warning}</p>
              ) : null}
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href={`/products/${savedProduct.slug}`}
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-medium text-foreground">
              Product Images
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEdit
                ? "Manage existing photos, choose a primary image, or add more images."
                : "Upload one or multiple product photos and choose the primary image."}
            </p>
          </div>
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg bg-brand-burgundy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-burgundy/90">
            <ImagePlus className="size-4" aria-hidden="true" />
            {isEdit ? "Add More Images" : "Select Images"}
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

        {existingImages.length > 0 ? (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Existing Gallery ({existingImages.length - removedImageIds.length} active)
            </p>
            <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {existingImages.map((img) => {
                const isRemoved = removedImageIds.includes(img.id);
                const isPrimary = primaryTarget === `existing:${img.id}` && !isRemoved;
                return (
                  <li
                    key={img.id}
                    className={`flex flex-col justify-between rounded-xl border p-3 transition-opacity ${
                      isRemoved
                        ? "border-destructive/40 bg-destructive/5 opacity-60"
                        : isPrimary
                          ? "border-brand-burgundy bg-brand-beige/30"
                          : "border-border bg-background"
                    }`}
                  >
                    <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-brand-beige">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={optimizeCloudinaryImageUrl(img.image_url)}
                        alt={img.alt_text}
                        className="size-full object-cover"
                      />
                      {isPrimary ? (
                        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand-burgundy px-2.5 py-0.5 text-[11px] font-semibold text-white">
                          <Star className="size-3 fill-current" aria-hidden="true" />
                          Primary
                        </span>
                      ) : null}
                      {isRemoved ? (
                        <span className="absolute inset-x-2 bottom-2 rounded-md bg-destructive px-2 py-1 text-center text-[11px] font-semibold text-white">
                          Will be removed on save
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      {!isRemoved ? (
                        <button
                          type="button"
                          disabled={isPrimary}
                          onClick={() => setPrimaryTarget(`existing:${img.id}`)}
                          className="text-xs font-semibold text-brand-burgundy hover:underline disabled:opacity-50"
                        >
                          {isPrimary ? "Primary image" : "Set as primary"}
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Marked for removal</span>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleRemoveExistingImage(img.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:text-destructive"
                      >
                        {isRemoved ? (
                          <>
                            <RotateCcw className="size-3.5" aria-hidden="true" />
                            Undo
                          </>
                        ) : (
                          <>
                            <Trash2 className="size-3.5" aria-hidden="true" />
                            Remove
                          </>
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {selectedImages.length > 0 ? (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              New Images to Upload ({selectedImages.length})
            </p>
            <ul className="mt-3 grid gap-4 sm:grid-cols-2">
              {selectedImages.map((image, index) => {
                const isPrimary = primaryTarget === `new:${image.id}`;
                return (
                  <li
                    key={image.id}
                    className={`flex items-start gap-3 rounded-xl border p-3 ${
                      isPrimary
                        ? "border-brand-burgundy bg-brand-beige/30"
                        : "border-border bg-background"
                    }`}
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
                      <button
                        type="button"
                        disabled={isPrimary}
                        onClick={() => setPrimaryTarget(`new:${image.id}`)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-burgundy hover:underline disabled:opacity-60"
                      >
                        <Star className="size-3" aria-hidden="true" />
                        {isPrimary ? "Selected as primary" : "Set as primary"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : existingImages.length === 0 ? (
          <div className="mt-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-brand-champagne bg-background/60 px-4 py-8 text-center transition-colors hover:bg-brand-beige/40">
              <UploadCloud className="size-8 text-brand-burgundy" aria-hidden="true" />
              <span className="mt-2 text-sm font-semibold text-foreground">
                Click to select product images
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                JPEG, PNG, WebP, or AVIF up to {cloudinaryMaxImageBytes / 1024 / 1024} MB each
              </span>
              <input
                type="file"
                multiple
                accept={cloudinaryImageMimeTypes.join(",")}
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>
        ) : null}
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
            ? isEdit
              ? "Saving changes..."
              : "Creating product..."
            : isEdit
              ? "Save Changes"
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

export function ProductCreateForm(props: {
  initialCategory?: ProductCategorySlug;
  cloudinaryConfigured: boolean;
}) {
  return <ProductForm mode="create" {...props} />;
}
