export interface CartItem {
  id: string; // Composite unique key: `${productId}:${variantId}`
  productId: string;
  productSlug: string;
  productName: string;
  categoryName: string;
  imageUrl: string;
  imageAlt: string;
  variantId: string;
  selectedSize?: string | null;
  selectedColor?: string | null;
  selectedAttributes?: Record<string, string>;
  unitPrice: number;
  quantity: number;
  stockLimit: number;
}
