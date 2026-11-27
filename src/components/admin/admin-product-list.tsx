"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Pin, PinOff } from "lucide-react";
import { optimizeCloudinaryImageUrl } from "@/lib/cloudinary-image";
import { formatINR } from "@/lib/format-currency";

export interface AdminProductListItem {
  id: string;
  name: string;
  slug: string;
  base_price: string | number;
  is_active: boolean;
  is_pinned: boolean;
  fabric: string | null;
  categoryName: string;
  categorySlug: string;
  primaryImageUrl: string | null;
  primaryImageAlt: string;
  imageCount: number;
  totalStock: number;
}

const CATEGORY_FILTERS = [
  { slug: "all", label: "All Categories" },
  { slug: "clothing", label: "Clothing" },
  { slug: "jewellery", label: "Jewellery" },
  { slug: "accessories", label: "Accessories" },
] as const;

export function AdminProductList({
  initialProducts,
  migrationPending = false,
}: {
  initialProducts: AdminProductListItem[];
  migrationPending?: boolean;
}) {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProductListItem[]>(initialProducts);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const visibleProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.categorySlug.toLowerCase() === activeCategory);

  const pinnedCount = products.filter((p) => p.is_pinned).length;

  async function togglePin(product: AdminProductListItem) {
    if (migrationPending || pendingId) return;
    const nextPinned = !product.is_pinned;
    setPendingId(product.id);
    setStatusMessage(null);

    try {
      const response = await fetch(`/api/admin/products/${product.id}/pin`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isPinned: nextPinned }),
      });

      const body = (await response.json().catch(() => null)) as
        | { product?: { id: string; name: string; is_pinned: boolean }; error?: string }
        | null;

      if (!response.ok || !body?.product) {
        throw new Error(body?.error ?? "Unable to update pin status.");
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? { ...item, is_pinned: body.product!.is_pinned }
            : item,
        ),
      );

      setStatusMessage({
        type: "success",
        text: body.product.is_pinned
          ? `“${product.name}” pinned to New Arrivals.`
          : `“${product.name}” unpinned from New Arrivals.`,
      });

      router.refresh();
    } catch (caught) {
      setStatusMessage({
        type: "error",
        text:
          caught instanceof Error
            ? caught.message
            : "Unable to update pin status.",
      });
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filter products by category"
        >
          {CATEGORY_FILTERS.map((cat) => {
            const active = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveCategory(cat.slug)}
                className={`min-h-9 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "border-brand-burgundy bg-brand-burgundy text-white"
                    : "border-border bg-card text-foreground hover:border-brand-burgundy/60 hover:bg-brand-beige/50"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-champagne/60 bg-brand-beige/60 px-3 py-1 text-xs font-semibold text-brand-burgundy">
          <Pin className="size-3.5" aria-hidden="true" />
          {pinnedCount} pinned to New Arrivals
        </span>
      </div>

      {migrationPending ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-brand-champagne bg-brand-beige/70 px-4 py-3 text-sm text-foreground"
        >
          Database column <code>is_pinned</code> is pending migration. Apply{" "}
          <code>supabase/migrations/20261127000000_products_is_pinned.sql</code>{" "}
          to enable Pin / Unpin for New Arrivals.
        </p>
      ) : null}

      {statusMessage ? (
        <p
          role={statusMessage.type === "error" ? "alert" : "status"}
          className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
            statusMessage.type === "error"
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-brand-champagne bg-brand-beige/60 text-brand-burgundy"
          }`}
        >
          {statusMessage.text}
        </p>
      ) : null}

      {visibleProducts.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-(--shadow-card)">
          <ul className="divide-y divide-border">
            {visibleProducts.map((product) => {
              const isPending = pendingId === product.id;

              return (
                <li
                  key={product.id}
                  className={`flex flex-col justify-between gap-4 p-4 transition-colors sm:flex-row sm:items-center sm:px-6 ${
                    product.is_pinned ? "bg-brand-beige/25" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-brand-beige/60">
                      {product.primaryImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={optimizeCloudinaryImageUrl(product.primaryImageUrl)}
                          alt={product.primaryImageAlt || product.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-[11px] text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">{product.name}</p>
                        <span className="rounded-full bg-brand-beige px-2.5 py-0.5 text-xs font-medium text-foreground">
                          {product.categoryName}
                        </span>
                        {product.is_pinned ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-burgundy/10 px-2.5 py-0.5 text-xs font-semibold text-brand-burgundy">
                            <Pin className="size-3 fill-current" aria-hidden="true" />
                            Pinned
                          </span>
                        ) : null}
                        {!product.is_active ? (
                          <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                            Draft
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatINR(Number(product.base_price))} · {product.totalStock} in stock ·{" "}
                        {product.imageCount} {product.imageCount === 1 ? "image" : "images"}
                        {product.fabric ? ` · ${product.fabric}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2.5 self-end sm:self-center">
                    <button
                      type="button"
                      disabled={isPending || migrationPending}
                      aria-pressed={product.is_pinned}
                      onClick={() => togglePin(product)}
                      className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        product.is_pinned
                          ? "border-brand-burgundy bg-brand-burgundy text-white hover:bg-brand-burgundy/90"
                          : "border-border bg-background text-foreground hover:border-brand-burgundy hover:bg-brand-beige/50 hover:text-brand-burgundy"
                      }`}
                    >
                      {product.is_pinned ? (
                        <>
                          <PinOff className="size-3.5" aria-hidden="true" />
                          {isPending ? "Updating..." : "Unpin"}
                        </>
                      ) : (
                        <>
                          <Pin className="size-3.5" aria-hidden="true" />
                          {isPending ? "Updating..." : "Pin"}
                        </>
                      )}
                    </button>

                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-1.5 text-sm font-medium text-brand-burgundy transition-colors hover:border-brand-burgundy hover:bg-brand-beige/50"
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="mt-4 rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
          No products found in this category.
        </p>
      )}
    </div>
  );
}
