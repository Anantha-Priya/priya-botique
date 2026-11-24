"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlist-store";
import { formatINR } from "@/lib/format-currency";
import { optimizeCloudinaryImageUrl } from "@/lib/cloudinary-image";
import { useIsClient } from "@/hooks/use-is-client";

export function WishlistView() {
  const isClient = useIsClient();
  const items = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  if (!isClient) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-muted-foreground">Loading your wishlist...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center sm:py-24">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand-beige text-brand-burgundy">
          <Heart className="size-10" aria-hidden="true" />
        </div>
        <h1 className="mt-6 font-heading text-3xl font-medium sm:text-4xl">
          Your wishlist is empty
        </h1>
        <p className="mt-3 text-muted-foreground">
          Save items you love as you browse to keep them in one place.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-brand-burgundy px-8 text-sm font-semibold text-white transition-colors hover:bg-brand-burgundy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Explore collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "saved item" : "saved items"}
        </p>
        <button
          type="button"
          onClick={clearWishlist}
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-red-700 underline"
        >
          Clear all
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <article key={item.productId} className="group relative flex flex-col justify-between">
            <div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-brand-beige">
                <Link href={`/products/${item.productSlug}`}>
                  {item.imageUrl ? (
                    <Image
                      src={optimizeCloudinaryImageUrl(item.imageUrl)}
                      alt={item.imageAlt || item.productName}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="grid size-full place-items-center text-xs text-muted-foreground">
                      PRIYA
                    </div>
                  )}
                </Link>

                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  aria-label={`Remove ${item.productName} from wishlist`}
                  className="absolute top-2.5 right-2.5 flex size-9 items-center justify-center rounded-full bg-white/90 text-muted-foreground shadow-sm transition-colors hover:bg-white hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>

                {!item.inStock ? (
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-foreground">
                    Out of stock
                  </span>
                ) : null}
              </div>

              <div className="pt-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {item.categoryName}
                </p>
                <h2 className="mt-1 font-heading text-base font-medium">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="hover:text-brand-burgundy transition-colors"
                  >
                    {item.productName}
                  </Link>
                </h2>
                <p className="mt-1 font-semibold text-brand-burgundy text-sm sm:text-base">
                  {formatINR(item.basePrice)}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <Link
                href={`/products/${item.productSlug}`}
                className="flex min-h-10 w-full items-center justify-center rounded-md border border-brand-burgundy bg-transparent px-4 text-xs font-semibold text-brand-burgundy transition-colors hover:bg-brand-burgundy hover:text-white"
              >
                View details
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
