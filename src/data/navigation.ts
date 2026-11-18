import type { NavigationItem } from "@/types/store";

export const primaryNavigation = [
  { label: "Shop", href: "/shop" },
  { label: "Clothing", href: "/category/clothing" },
  { label: "Jewellery", href: "/category/jewellery" },
  { label: "Accessories", href: "/category/accessories" },
  { label: "Collections", href: "/collections" },
  { label: "New arrivals", href: "/new-arrivals" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] satisfies NavigationItem[];

export const utilityNavigation = [
  { label: "Search", href: "/search" },
  { label: "My account", href: "/login" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Shopping bag", href: "/cart" },
] satisfies NavigationItem[];

export const categoryNavigation = [
  { label: "Clothing", href: "/category/clothing" },
  { label: "Jewellery", href: "/category/jewellery" },
  { label: "Accessories", href: "/category/accessories" },
] satisfies NavigationItem[];

export const policyNavigation = [
  { label: "Shipping & delivery", href: "/policies/shipping" },
  { label: "Returns & exchanges", href: "/policies/returns" },
  { label: "Privacy policy", href: "/policies/privacy" },
  { label: "Terms of service", href: "/policies/terms" },
] satisfies NavigationItem[];
