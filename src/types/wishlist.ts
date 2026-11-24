export interface WishlistItem {
  productId: string;
  productSlug: string;
  productName: string;
  categoryName: string;
  imageUrl: string;
  imageAlt: string;
  basePrice: number;
  inStock: boolean;
  addedAt: string;
}
