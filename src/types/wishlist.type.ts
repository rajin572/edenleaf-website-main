export interface IWishlistProductCard {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  image: string;
  status: string;
  priceInPoisha: number;
  comparePriceInPoisha?: number;
  minPriceInPoisha: number;
  maxPriceInPoisha: number;
  totalStock: number;
  avgRating: number;
  reviewCount: number;
  variants: {
    _id: string; name: string; priceInPoisha: number; comparePriceInPoisha?: number;
    stock: number; unit: string; attributes: Record<string, string>; isDefault: boolean;
  }[];
}

export interface IWishlistItem {
  _id: string;
  product: IWishlistProductCard | null;
  available: boolean;
  createdAt: string;
}
