export interface ICartItem {
  _id: string;
  productId: string | null;
  variantId: string;
  quantity: number;
  name: string;
  image: string;
  product: { _id: string; name: string; slug: string; status: string } | null;
  variant: { _id: string; name: string; sku: string; unit: string; attributes: Record<string, string>; status: string } | null;
  unitPriceInPoisha: number;
  lineTotalInPoisha: number;
  stock: number;
  available: boolean;
  issue: "PRODUCT_UNAVAILABLE" | "VARIANT_UNAVAILABLE" | "INSUFFICIENT_STOCK" | null;
  createdAt: string;
  updatedAt: string;
}

export interface IServerCart {
  _id: string | null;
  userId: string;
  items: ICartItem[];
  itemCount: number;
  availableItemCount: number;
  subtotalInPoisha: number;
  availableSubtotalInPoisha: number;
  hasUnavailableItems: boolean;
  updatedAt: string | null;
}
