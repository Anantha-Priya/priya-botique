"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { formatINR } from "@/lib/format-currency";
import { optimizeCloudinaryImageUrl } from "@/lib/cloudinary-image";
import { productShippingSummary } from "@/lib/policy-content";
import { useCartStore } from "@/stores/cart-store";
import { WishlistButton } from "@/components/catalogue/wishlist-button";
import {
  findMatchingVariant,
  getAttributeOptions,
  getEffectivePrice,
  getVariantOptions,
} from "@/lib/product-selection";
import type { ProductDetail } from "@/lib/catalogue";

const STANDARD_CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const FREE_SIZE_VALUE = "Free Size";

function attributeLabel(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export function ProductDetail({ product }: { product: ProductDetail }) {
  const categorySlug = product.categories.slug.toLowerCase();
  const isClothing = categorySlug === "clothing";

  const variants = product.product_variants.filter((variant) => variant.is_active);
  const inStockVariant = variants.find((variant) => variant.stock_quantity > 0);
  const defaultVariant =
    (isClothing && inStockVariant) ||
    variants.find((variant) => variant.is_default) ||
    variants[0] ||
    null;

  const sizeOptions = getVariantOptions(variants, "size");
  // Keep Free Size separate; order standard sizes in canonical order
  const CANONICAL_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];
  const isFreeSizeOnly =
    sizeOptions.length === 1 && sizeOptions[0] === FREE_SIZE_VALUE;
  const clothingSizeButtons = isClothing
    ? sizeOptions.includes(FREE_SIZE_VALUE)
      ? isFreeSizeOnly
        ? [FREE_SIZE_VALUE]
        : [
            FREE_SIZE_VALUE,
            ...sizeOptions
              .filter((o) => o !== FREE_SIZE_VALUE)
              .sort(
                (a, b) =>
                  (CANONICAL_ORDER.indexOf(a) === -1 ? 999 : CANONICAL_ORDER.indexOf(a)) -
                  (CANONICAL_ORDER.indexOf(b) === -1 ? 999 : CANONICAL_ORDER.indexOf(b)),
              ),
          ]
      : [
          ...CANONICAL_ORDER.filter((o) => sizeOptions.includes(o)),
          ...sizeOptions.filter((o) => !CANONICAL_ORDER.includes(o) && o !== FREE_SIZE_VALUE),
        ]
    : [];
  const colorOptions = getVariantOptions(variants, "color");
  const attributeOptions = getAttributeOptions(variants);
  const initialAttributes = Object.fromEntries(
    Object.keys(attributeOptions).map((key) => [
      key,
      defaultVariant
        ? String(defaultVariant.attributes[key] ?? attributeOptions[key][0])
        : attributeOptions[key][0],
    ]),
  );

  const [selectedImage, setSelectedImage] = useState(
    [...product.product_images].sort(
      (first, second) =>
        Number(second.is_primary) - Number(first.is_primary) ||
        first.sort_order - second.sort_order,
    )[0]?.image_url ?? null,
  );
  const [size, setSize] = useState(
    isClothing ? (isFreeSizeOnly ? FREE_SIZE_VALUE : (defaultVariant?.size ?? "")) : "",
  );
  const [color, setColor] = useState(defaultVariant?.color ?? "");
  const [attributes, setAttributes] =
    useState<Record<string, string>>(initialAttributes);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  const selectedVariant = findMatchingVariant(variants, {
    size: isClothing ? size : "",
    color,
    attributes,
  });
  const effectivePrice = getEffectivePrice(product.base_price, selectedVariant);
  const stock = selectedVariant?.stock_quantity ?? 0;
  const compareAt = product.compare_at_price
    ? Number(product.compare_at_price)
    : null;

  const displayMaterial =
    product.fabric ||
    (typeof product.attributes?.material === "string" ? product.attributes.material : "") ||
    (typeof selectedVariant?.attributes?.material === "string"
      ? selectedVariant.attributes.material
      : "");
  const displayColor =
    selectedVariant?.color ||
    color ||
    (typeof product.attributes?.color === "string" ? product.attributes.color : "");

  function getStockForSize(targetSize: string): number {
    const matching = variants.filter(
      (variant) =>
        variant.size === targetSize &&
        (!color || !variant.color || variant.color === color),
    );
    return matching.reduce((total, variant) => total + Math.max(0, variant.stock_quantity), 0);
  }
  const sortedImages = [...product.product_images].sort(
    (first, second) =>
      Number(second.is_primary) - Number(first.is_primary) ||
      first.sort_order - second.sort_order,
  );

  const addItem = useCartStore((state) => state.addItem);

  const currentImageIndex = Math.max(
    0,
    sortedImages.findIndex((image) => image.image_url === selectedImage),
  );

  function showPreviousImage() {
    const previousIndex =
      (currentImageIndex - 1 + sortedImages.length) % sortedImages.length;
    setSelectedImage(sortedImages[previousIndex]?.image_url ?? selectedImage);
  }

  function showNextImage() {
    const nextIndex = (currentImageIndex + 1) % sortedImages.length;
    setSelectedImage(sortedImages[nextIndex]?.image_url ?? selectedImage);
  }

  function handleAddToCart() {
    if (!selectedVariant) {
      setMessage("Please select an available variant.");
      return;
    }
    if (selectedVariant.stock_quantity <= 0) {
      setMessage("This variant is currently out of stock.");
      return;
    }
    if (quantity > selectedVariant.stock_quantity) {
      setMessage(
        `Only ${selectedVariant.stock_quantity} item${selectedVariant.stock_quantity === 1 ? "" : "s"} available.`,
      );
      return;
    }

    const primaryImage = sortedImages[0]?.image_url ?? selectedImage ?? "";
    const primaryAlt = sortedImages[0]?.alt_text ?? product.name;

    const feedback = addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      categoryName: product.categories.name,
      imageUrl: primaryImage,
      imageAlt: primaryAlt,
      variantId: selectedVariant.id,
      selectedSize: selectedVariant.size,
      selectedColor: selectedVariant.color,
      selectedAttributes: Object.fromEntries(
        Object.entries(selectedVariant.attributes).map(([k, v]) => [k, String(v)]),
      ),
      unitPrice: effectivePrice,
      quantity,
      stockLimit: selectedVariant.stock_quantity,
    });

    setMessage(feedback.message);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,.92fr)] lg:gap-14">
      <section aria-label="Product images">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-brand-beige">
          {selectedImage ? (
            <>
              <Image
                src={optimizeCloudinaryImageUrl(selectedImage)}
                alt={
                  sortedImages.find((image) => image.image_url === selectedImage)
                    ?.alt_text ?? product.name
                }
                fill
                loading="eager"
                unoptimized
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
              {sortedImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={showPreviousImage}
                    className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-foreground shadow-sm transition hover:bg-white"
                  >
                    <ChevronLeft aria-hidden="true" className="size-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={showNextImage}
                    className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-foreground shadow-sm transition hover:bg-white"
                  >
                    <ChevronRight aria-hidden="true" className="size-5" />
                  </button>
                </>
              ) : null}
            </>
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
              Image coming soon
            </div>
          )}
        </div>
        {sortedImages.length > 1 ? (
          <div className="mt-4 grid grid-cols-4 gap-3" aria-label="Choose a product image">
            {sortedImages.map((image, index) => (
              <button
                key={`${image.image_url}-${index}`}
                type="button"
                aria-label={`View image ${index + 1}`}
                aria-pressed={selectedImage === image.image_url}
                onClick={() => setSelectedImage(image.image_url)}
                className="relative aspect-[4/5] overflow-hidden rounded-lg border border-transparent bg-brand-beige focus-visible:outline-2 focus-visible:outline-offset-2 aria-pressed:border-brand-burgundy"
              >
                <Image
                  src={optimizeCloudinaryImageUrl(image.image_url)}
                  alt=""
                  fill
                  unoptimized
                  sizes="25vw"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-burgundy">
          {product.categories.name}
        </p>
        <h1 className="mt-3 font-heading text-4xl font-medium sm:text-5xl">
          {product.name}
        </h1>
        <div className="mt-5 flex flex-wrap items-baseline gap-3">
          <p className="text-2xl font-semibold text-brand-burgundy">
            {formatINR(effectivePrice)}
          </p>
          {compareAt !== null && compareAt > effectivePrice ? (
            <p className="text-sm text-muted-foreground line-through">
              {formatINR(compareAt)}
            </p>
          ) : null}
        </div>
        {product.description ? (
          <p className="mt-6 whitespace-pre-line text-base leading-7 text-muted-foreground">
            {product.description}
          </p>
        ) : null}

        {displayColor || displayMaterial ? (
          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-4 text-sm">
            {displayColor ? (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Colour
                </dt>
                <dd className="mt-1 font-semibold text-foreground">{displayColor}</dd>
              </div>
            ) : null}
            {displayMaterial ? (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Material
                </dt>
                <dd className="mt-1 font-semibold text-foreground">{displayMaterial}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        <aside
          aria-label="Shipping information"
          className="mt-6 rounded-lg border border-border p-4"
        >
          <p className="text-sm leading-6 text-muted-foreground">
            {productShippingSummary}
          </p>
          <Link
            href="/policies/shipping"
            className="mt-2 inline-block text-sm font-medium text-brand-burgundy underline underline-offset-4"
          >
            Shipping & delivery details
          </Link>
        </aside>

        <div className="mt-8 space-y-5">
          {isClothing && clothingSizeButtons.length > 0 ? (
            isFreeSizeOnly ? (
              /* Free Size product — no size selector needed */
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Size</p>
                <span className="inline-flex items-center rounded-lg border border-brand-burgundy bg-brand-beige/40 px-4 py-2 text-sm font-semibold text-foreground">
                  Free Size
                </span>
              </div>
            ) : (
              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Select Size</p>
                  {size ? (
                    <span className="text-xs text-muted-foreground">
                      Selected: <strong className="text-foreground">{size}</strong>
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2.5" role="group" aria-label="Available sizes">
                  {clothingSizeButtons
                    .filter((option) => sizeOptions.includes(option))
                    .map((option) => {
                      const optionStock = getStockForSize(option);
                      const isAvailable = optionStock > 0;
                      const isSelected = size === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          disabled={!isAvailable}
                          aria-pressed={isSelected}
                          onClick={() => {
                            if (!isAvailable) return;
                            setSize(option);
                            setQuantity(1);
                            setMessage("");
                          }}
                          className={`min-h-11 min-w-12 rounded-lg border px-3.5 text-sm font-semibold transition-colors ${
                            isSelected
                              ? "border-brand-burgundy bg-brand-burgundy text-white"
                              : isAvailable
                                ? "border-border bg-card text-foreground hover:border-brand-burgundy hover:bg-brand-beige/50"
                                : "cursor-not-allowed border-border bg-muted/50 text-muted-foreground/50 line-through opacity-60"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                </div>
              </div>
            )
          ) : null}

          {colorOptions.length > 1 ? (
            <label className="grid gap-2 text-sm font-medium">
              Colour
              <select
                value={color}
                onChange={(event) => {
                  setColor(event.target.value);
                  setQuantity(1);
                  setMessage("");
                }}
                className="min-h-11 rounded-md border border-border bg-white px-3"
              >
                <option value="">Select colour</option>
                {colorOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
          ) : null}

          {Object.entries(attributeOptions)
            .filter(([key]) => key.toLowerCase() !== "material")
            .map(([key, options]) => (
            <label key={key} className="grid gap-2 text-sm font-medium">
              {attributeLabel(key)}
              <select
                value={attributes[key] ?? ""}
                onChange={(event) =>
                  setAttributes((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
                className="min-h-11 rounded-md border border-border bg-white px-3"
              >
                <option value="">Select {attributeLabel(key).toLowerCase()}</option>
                {options.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
          ))}

          <div>
            <p className="mb-2 text-sm font-medium">Quantity</p>
            <div className="inline-flex items-center rounded-md border border-border bg-white">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => {
                  setQuantity((current) => Math.max(1, current - 1));
                  setMessage("");
                }}
                className="grid size-11 place-items-center"
              >
                <Minus aria-hidden="true" className="size-4" />
              </button>
              <output aria-live="polite" className="min-w-12 text-center text-sm font-semibold">
                {quantity}
              </output>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => {
                  setQuantity((current) =>
                    Math.min(stock > 0 ? stock : 1, current + 1),
                  );
                  setMessage("");
                }}
                className="grid size-11 place-items-center"
              >
                <Plus aria-hidden="true" className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {selectedVariant
                ? stock > 0
                  ? isClothing && size && !isFreeSizeOnly
                    ? `${stock} in stock for size ${size}`
                    : `${stock} in stock`
                  : isClothing && size && !isFreeSizeOnly
                    ? `Out of stock for size ${size}`
                    : "Currently out of stock"
                : isClothing && !isFreeSizeOnly
                  ? "Select an available size to check stock"
                  : "Select options to check availability"}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={stock <= 0}
              className="min-h-12 flex-1 rounded-md bg-brand-burgundy px-5 text-sm font-semibold text-white hover:bg-brand-burgundy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {stock <= 0 ? "Out of stock" : "Add to shopping bag"}
            </button>
            <WishlistButton
              item={{
                productId: product.id,
                productSlug: product.slug,
                productName: product.name,
                categoryName: product.categories.name,
                imageUrl: sortedImages[0]?.image_url ?? selectedImage ?? "",
                imageAlt: sortedImages[0]?.alt_text ?? product.name,
                basePrice: Number(product.base_price),
                inStock: stock > 0,
              }}
              showText
            />
          </div>
          {message ? (
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-brand-beige/50 p-3 text-sm">
              <p role="status" className="font-medium text-foreground">{message}</p>
              {message.includes("bag") ? (
                <Link
                  href="/cart"
                  className="font-semibold text-brand-burgundy underline hover:text-brand-burgundy/80"
                >
                  View bag
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
