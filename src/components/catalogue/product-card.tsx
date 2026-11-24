import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { WishlistButton } from "@/components/catalogue/wishlist-button";
import { formatINR } from "@/lib/format-currency";
import { optimizeCloudinaryImageUrl } from "@/lib/cloudinary-image";
import type { CatalogueProduct } from "@/lib/catalogue";

export function ProductCard({ product }: { product: CatalogueProduct }) {
  const image = [...product.product_images].sort(
    (first, second) =>
      Number(second.is_primary) - Number(first.is_primary) ||
      first.sort_order - second.sort_order,
  )[0];
  const price = Number(product.base_price);
  const inStock = product.product_variants.some(
    (variant) => variant.stock_quantity > 0,
  );

  if (!Number.isFinite(price)) {
    throw new RangeError(`Product ${product.slug} has an invalid price.`);
  }

  return (
    <article className="min-w-0">
      <div className="group relative">
        <Link
          href={`/products/${product.slug}`}
          className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-brand-beige">
            {image ? (
              <Image
                src={optimizeCloudinaryImageUrl(image.image_url)}
                alt={image.alt_text}
                fill
                unoptimized
                sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-3 text-brand-burgundy/70">
                <ImageOff aria-hidden="true" className="size-8" />
                <span className="text-xs font-medium uppercase tracking-[0.16em]">
                  Image coming soon
                </span>
              </div>
            )}
            {!inStock ? (
              <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-foreground">
                Out of stock
              </span>
            ) : null}
          </div>
          <div className="pt-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {product.categories.name}
            </p>
            <h2 className="mt-1 text-base font-medium leading-6 group-hover:underline sm:text-lg">
              {product.name}
            </h2>
            <p className="mt-2 font-semibold text-brand-burgundy">
              {formatINR(price)}
            </p>
          </div>
        </Link>
        <div className="absolute top-3 right-3 z-10">
          <WishlistButton
            item={{
              productId: product.id,
              productSlug: product.slug,
              productName: product.name,
              categoryName: product.categories.name,
              imageUrl: image?.image_url ?? "",
              imageAlt: image?.alt_text ?? product.name,
              basePrice: price,
              inStock,
            }}
            size="sm"
          />
        </div>
      </div>
    </article>
  );
}
