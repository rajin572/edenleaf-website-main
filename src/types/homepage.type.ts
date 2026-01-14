import type { IProduct } from "./catalog.type";

export interface IHomepageFeaturedCategory {
  _id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  order: number;
}

/**
 * Same shape `presentProducts()` returns everywhere else on the real backend
 * plus a bolted-on `unitsSold`.
 */
export interface IHomepageBestSeller extends IProduct {
  unitsSold: number;
}

export interface IHomepageData {
  showFeaturedCategories: boolean;
  activeCategoryCount: number;
  featuredCategories: IHomepageFeaturedCategory[];
  bestSellers: IHomepageBestSeller[];
}
