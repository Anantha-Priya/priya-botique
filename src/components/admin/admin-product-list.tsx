"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, Clock, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import type { DeletePermissionState } from "@/lib/admin/delete-permission";
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

function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function AdminProductList({
  initialProducts,
  migrationPending = false,
  initialDeletePermission = { enabled: false, expiresAt: null, status: "disabled" },
}: {
  initialProducts: AdminProductListItem[];
  migrationPending?: boolean;
  initialDeletePermission?: DeletePermissionState;
}) {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProductListItem[]>(initialProducts);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [deletePermission, setDeletePermission] = useState<DeletePermissionState>(
    initialDeletePermission,
  );
  const [now, setNow] = useState<number>(() => Date.now());
  const [deleteTarget, setDeleteTarget] = useState<AdminProductListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!deletePermission.enabled || !deletePermission.expiresAt) return;
    const interval = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (deletePermission.expiresAt && current >= deletePermission.expiresAt) {
        setDeletePermission({
          enabled: false,
          expiresAt: deletePermission.expiresAt,
          status: "expired",
        });
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [deletePermission.enabled, deletePermission.expiresAt]);

  const remainingMs =
    deletePermission.enabled && deletePermission.expiresAt
      ? Math.max(0, deletePermission.expiresAt - now)
      : 0;
  const canDelete = deletePermission.enabled && remainingMs > 0;
  const isPermissionExpired =
    deletePermission.status === "expired" ||
    (deletePermission.enabled && remainingMs <= 0);

  const visibleProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.categorySlug.toLowerCase() === activeCategory);

  const pinnedCount = products.filter((p) => p.is_pinned).length;

  async function togglePin(product: AdminProductListItem) {
    if (migrationPending || pendingId || deleting) return;
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

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setStatusMessage(null);

    try {
      const response = await fetch(`/api/admin/products/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const body = (await response.json().catch(() => null)) as
        | { deleted?: boolean; error?: string; code?: string }
        | null;

      if (!response.ok || !body?.deleted) {
        if (
          body?.code === "DELETE_PERMISSION_EXPIRED" ||
          body?.code === "DELETE_PERMISSION_DISABLED"
        ) {
          setDeletePermission({
            enabled: false,
            expiresAt: null,
            status:
              body.code === "DELETE_PERMISSION_EXPIRED" ? "expired" : "disabled",
          });
        }
        throw new Error(body?.error ?? "Unable to delete product.");
      }

      setProducts((current) =>
        current.filter((item) => item.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
      setStatusMessage({
        type: "success",
        text: "Product deleted successfully.",
      });
      router.refresh();
    } catch (caught) {
      setDeleteTarget(null);
      setStatusMessage({
        type: "error",
        text:
          caught instanceof Error
            ? caught.message
            : "Unable to delete product.",
      });
    } finally {
      setDeleting(false);
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

      {/* Temporary Product Deletion Permission Banner */}
      <div
        className={`mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-xs font-medium ${
          canDelete
            ? "border-brand-champagne bg-brand-beige/60 text-brand-burgundy"
            : isPermissionExpired
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-border bg-card text-muted-foreground"
        }`}
      >
        <div className="flex items-center gap-2">
          <Clock className="size-4 shrink-0" aria-hidden="true" />
          <span>
            {canDelete
              ? `Product deletion enabled. Permission expires in ${formatCountdown(remainingMs)}.`
              : isPermissionExpired
                ? "Your deletion permission has expired. Enable it again in Admin Profile."
                : "Product deletion is currently disabled."}
          </span>
        </div>
        <Link
          href="/admin/profile"
          className="font-semibold text-brand-burgundy underline underline-offset-4 hover:text-brand-burgundy/80"
        >
          {canDelete ? "Manage in Admin Profile" : "Enable in Admin Profile"}
        </Link>
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
                      disabled={isPending || migrationPending || deleting}
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

                    <button
                      type="button"
                      disabled={!canDelete || deleting}
                      title={
                        canDelete
                          ? `Delete ${product.name}`
                          : "Enable Product Deletion in Admin Profile first"
                      }
                      onClick={() => {
                        setStatusMessage(null);
                        setDeleteTarget(product);
                      }}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-destructive/30 bg-background px-3.5 py-1.5 text-sm font-medium text-destructive transition-colors hover:border-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      Delete
                    </button>
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

      {/* Delete Confirmation Dialog */}
      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-product-dialog-title"
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-(--shadow-floating)"
          >
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h3
                  id="delete-product-dialog-title"
                  className="font-heading text-xl font-medium text-foreground"
                >
                  Are you sure you want to delete this product permanently?
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  This action cannot be undone. All variants and image records for this product will be permanently removed.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-background p-3">
              <div className="size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-brand-beige/60">
                {deleteTarget.primaryImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={optimizeCloudinaryImageUrl(deleteTarget.primaryImageUrl)}
                    alt={deleteTarget.primaryImageAlt || deleteTarget.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {deleteTarget.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {deleteTarget.categoryName} · {formatINR(Number(deleteTarget.base_price))}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="min-h-10 rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="min-h-10 rounded-lg bg-destructive px-5 text-sm font-semibold text-white transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
