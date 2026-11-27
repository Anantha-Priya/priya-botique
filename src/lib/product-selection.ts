export interface SelectionVariant {
  id: string;
  size: string | null;
  color: string | null;
  attributes: Record<string, unknown>;
  additional_price: string | number;
  stock_quantity: number;
  is_active: boolean;
  is_default: boolean;
}

export function getVariantOptions(
  variants: SelectionVariant[],
  key: "size" | "color",
): string[] {
  const active = variants.filter((variant) => variant.is_active);
  if (key === "size") {
    const sizes = [...new Set(active.map((variant) => variant.size).filter((value): value is string => Boolean(value)))];
    if (sizes.includes("Free Size")) return ["Free Size"];
    return sizes;
  }
  return [...new Set(active.map((variant) => variant.color).filter((value): value is string => Boolean(value)))];
}

export function getAttributeOptions(
  variants: SelectionVariant[],
): Record<string, string[]> {
  const options: Record<string, Set<string>> = {};

  for (const variant of variants) {
    if (!variant.is_active) continue;
    for (const [key, value] of Object.entries(variant.attributes)) {
      if (key === "demo" || key === "style" || key === "occasion" || key === "finish" || typeof value !== "string" || !value) continue;
      options[key] ??= new Set<string>();
      options[key].add(value);
    }
  }

  return Object.fromEntries(
    Object.entries(options).map(([key, values]) => [key, [...values]]),
  );
}

export function findMatchingVariant(
  variants: SelectionVariant[],
  selection: {
    size: string;
    color: string;
    attributes: Record<string, string>;
  },
): SelectionVariant | null {
  return (
    variants.find(
      (variant) =>
        variant.is_active &&
        (!selection.size || variant.size === selection.size) &&
        (!selection.color || variant.color === selection.color) &&
        Object.entries(selection.attributes).every(
          ([key, value]) => String(variant.attributes[key] ?? "") === value,
        ),
    ) ?? null
  );
}

export function getEffectivePrice(
  basePrice: string | number,
  variant: SelectionVariant | null,
): number {
  const base = Number(basePrice);
  const additional = variant ? Number(variant.additional_price) : 0;
  return base + (Number.isFinite(additional) ? additional : 0);
}
