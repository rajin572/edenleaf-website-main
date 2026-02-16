/** Mirrors guestOrderAccess.service.ts's issue()/track() return shapes exactly. */
export interface IGuestAccessToken {
  token: string;
  expiresAt: string;
  orderNumber: string;
}

export interface ITrackedOrderItem {
  /** Real ObjectIds — needed to submit a guest review against this item. */
  product: string;
  variant: string;
  productName: string;
  variantName: string;
  unit: string;
  quantity: number;
  unitPriceInPoisha: number;
  lineTotalInPoisha: number;
}

export interface ITrackedOrder {
  orderNumber: string;
  status: string;
  paymentMethod: "COD" | "BKASH_MANUAL" | "NAGAD_MANUAL";
  paymentStatus: string;
  customer: { name: string; phone: string; email?: string };
  destination: { district: string; thana: string };
  items: ITrackedOrderItem[];
  subtotalInPoisha: number;
  discountInPoisha: number;
  deliveryFeeInPoisha: number;
  grandTotalInPoisha: number;
  statusHistory: { status: string; note: string; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
}
