import { brand } from "./brand.ts";

const inrFormatter = new Intl.NumberFormat(brand.locale, {
  style: "currency",
  currency: brand.currency,
});

export function formatINR(amount: number): string {
  if (!Number.isFinite(amount)) {
    throw new RangeError("Amount must be a finite number.");
  }

  return inrFormatter.format(amount);
}
