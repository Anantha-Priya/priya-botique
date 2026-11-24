"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatINR } from "@/lib/format-currency";
import { optimizeCloudinaryImageUrl } from "@/lib/cloudinary-image";
import { useIsClient } from "@/hooks/use-is-client";

export function CartView() {
  const isClient = useIsClient();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  if (!isClient) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-muted-foreground">Loading your shopping bag...</p>
      </div>
    );
  }

  const subtotal = items.reduce(
    (total, item) => total + Math.max(0, item.unitPrice) * Math.max(0, item.quantity),
    0,
  );
  const totalCount = items.reduce((total, item) => total + item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center sm:py-24">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand-beige text-brand-burgundy">
          <ShoppingBag className="size-10" aria-hidden="true" />
        </div>
        <h1 className="mt-6 font-heading text-3xl font-medium sm:text-4xl">
          Your shopping bag is empty
        </h1>
        <p className="mt-3 text-muted-foreground">
          Discover our curated collection of artisanal clothing, jewellery, and accessories.
        </p>
        <div className="mt-8">
          <Link
            href="/shop"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-brand-burgundy px-8 text-sm font-semibold text-white transition-colors hover:bg-brand-burgundy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Explore collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.85fr)] lg:gap-14">
      {/* Items Section */}
      <section aria-labelledby="cart-items-heading">
        <h2 id="cart-items-heading" className="sr-only">
          Shopping bag items
        </h2>

        <div className="flex items-center justify-between border-b border-border pb-4">
          <p className="text-sm text-muted-foreground">
            {totalCount} {totalCount === 1 ? "item" : "items"} in your bag
          </p>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-red-700 underline"
          >
            Clear all
          </button>
        </div>

        <ul className="divide-y divide-border">
          {items.map((item) => {
            const hasMaxStock = item.quantity >= item.stockLimit;

            return (
              <li key={item.id} className="py-6 sm:py-8">
                <div className="flex gap-4 sm:gap-6">
                  {/* Thumbnail */}
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="relative aspect-[4/5] size-24 shrink-0 overflow-hidden rounded-lg bg-brand-beige sm:size-32"
                  >
                    {item.imageUrl ? (
                      <Image
                        src={optimizeCloudinaryImageUrl(item.imageUrl)}
                        alt={item.imageAlt || item.productName}
                        fill
                        unoptimized
                        sizes="128px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-xs text-muted-foreground">
                        PRIYA
                      </div>
                    )}
                  </Link>

                  {/* Item Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            {item.categoryName}
                          </p>
                          <h3 className="mt-1 font-heading text-lg font-medium">
                            <Link
                              href={`/products/${item.productSlug}`}
                              className="hover:text-brand-burgundy transition-colors"
                            >
                              {item.productName}
                            </Link>
                          </h3>
                        </div>
                        <p className="font-semibold text-brand-burgundy sm:text-lg">
                          {formatINR(item.unitPrice * item.quantity)}
                        </p>
                      </div>

                      {/* Variant Specs */}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {item.selectedSize ? (
                          <span>Size: <strong className="text-foreground">{item.selectedSize}</strong></span>
                        ) : null}
                        {item.selectedColor ? (
                          <span>Colour: <strong className="text-foreground">{item.selectedColor}</strong></span>
                        ) : null}
                        {item.selectedAttributes
                          ? Object.entries(item.selectedAttributes).map(([k, v]) => (
                              <span key={k}>
                                {k}: <strong className="text-foreground">{v}</strong>
                              </span>
                            ))
                          : null}
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Unit price: {formatINR(item.unitPrice)}
                      </p>
                    </div>

                    {/* Quantity controls & Remove */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center rounded-md border border-border bg-white">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${item.productName}`}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="grid size-9 place-items-center text-foreground hover:bg-secondary transition-colors"
                          >
                            <Minus className="size-3.5" aria-hidden="true" />
                          </button>
                          <output
                            aria-live="polite"
                            className="min-w-9 text-center text-xs font-semibold"
                          >
                            {item.quantity}
                          </output>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${item.productName}`}
                            disabled={hasMaxStock}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="grid size-9 place-items-center text-foreground hover:bg-secondary transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Plus className="size-3.5" aria-hidden="true" />
                          </button>
                        </div>
                        {hasMaxStock ? (
                          <span className="text-[0.7rem] text-muted-foreground">
                            Max ({item.stockLimit})
                          </span>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-red-700"
                        aria-label={`Remove ${item.productName} from shopping bag`}
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 border-t border-border pt-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-burgundy hover:underline"
          >
            <span>&larr; Continue shopping</span>
          </Link>
        </div>
      </section>

      {/* Summary Section */}
      <section
        aria-labelledby="order-summary-heading"
        className="h-fit rounded-xl border border-border bg-brand-beige/40 p-6 sm:p-8"
      >
        <h2 id="order-summary-heading" className="font-heading text-xl font-medium sm:text-2xl">
          Order summary
        </h2>

        <dl className="mt-6 space-y-4 text-sm border-b border-border pb-6">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium text-foreground">{formatINR(subtotal)}</dd>
          </div>

          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd className="font-medium text-green-700">Free across India</dd>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <dt>Estimated delivery</dt>
            <dd>3–7 business days</dd>
          </div>
        </dl>

        <div className="mt-6 flex items-baseline justify-between">
          <dt className="font-medium text-base">Estimated Total</dt>
          <dd className="font-heading text-2xl font-semibold text-brand-burgundy">
            {formatINR(subtotal)}
          </dd>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Taxes and final payment verified securely at checkout.
        </p>

        <div className="mt-8">
          <Link
            href="/checkout"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-brand-burgundy px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-burgundy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span>Proceed to checkout</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6 space-y-2 text-xs text-muted-foreground">
          <p className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-green-600" aria-hidden="true" />
            Standard courier delivery across India
          </p>
          <p className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-green-600" aria-hidden="true" />
            7-day return and exchange policy
          </p>
        </div>
      </section>
    </div>
  );
}
