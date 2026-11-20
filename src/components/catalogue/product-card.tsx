import Image from "next/image";
import { ImageOff } from "lucide-react";
import { formatINR } from "@/lib/format-currency";
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
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-brand-beige">
        {image ? (
          <Image
            src={image.image_url}
            alt={image.alt_text}
            fill
            unoptimized
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover"
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
        <h2 className="mt-1 text-base font-medium leading-6 sm:text-lg">
          {product.name}
        </h2>
        <p className="mt-2 font-semibold text-brand-burgundy">
          {formatINR(price)}
        </p>
      </div>
    </article>
  );
}
