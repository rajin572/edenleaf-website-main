export interface IComboComponent {
  variantId: string;
  quantity: number;
  variant: { _id: string; name: string; sku: string; priceInPoisha: number; stock: number; unit: string; status: string };
  product: { _id: string; name: string; slug: string; image: string; status: string };
}

export interface ICombo {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  components: IComboComponent[];
  comboPriceInPoisha: number;
  regularPriceInPoisha: number;
  savingsInPoisha: number;
  order: number;
  available: boolean;
  status: "active" | "inactive" | "archived";
  createdAt: string;
  updatedAt: string;
}
