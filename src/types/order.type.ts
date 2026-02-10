/**
 * Order contracts — mirrors `/api/v1/orders` (Part 08/09). A separate,
 * independently-maintained copy from the dashboard's own order.type.ts —
 * this is not a monorepo, no shared package, matching the existing pattern
 * of near-identical redeclared shapes across the two frontends.
 */

export type TOrderStatus =
  | "PENDING" | "CONFIRMED" | "PROCESSING" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY"
  | "DELIVERED" | "DELIVERY_FAILED" | "RETURNED_TO_ORIGIN" | "CANCELLED"
  | "RETURN_REQUESTED" | "RETURNED" | "REFUND_PENDING" | "REFUNDED";

export type TPaymentStatus =
  | "PENDING" | "PENDING_VERIFICATION" | "VERIFIED" | "COLLECTED" | "REMITTED"
  | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";

export type TPaymentMethod = "COD" | "BKASH_MANUAL" | "NAGAD_MANUAL";
export type TOrderSource = "WEBSITE" | "FACEBOOK" | "WHATSAPP" | "PHONE" | "OFFLINE" | "MANUAL" | "OTHER";

export interface ICustomerSnapshot { name: string; phone: string; email?: string }
export interface IShippingAddressSnapshot {
  name: string; phone: string; district: string; thana: string;
  area?: string; street: string; postcode?: string;
}

/** Cost fields never appear here — the backend strips unitCostInPoisha unconditionally. */
export interface IOrderItemSnapshot {
  product: string; variant: string;
  productName: string; variantName: string; sku: string; unit: string;
  quantity: number; unitPriceInPoisha: number; lineTotalInPoisha: number;
}

export interface IOrderStatusHistoryEntry {
  _id: string; order: string; status: TOrderStatus; note: string;
  changedBy?: string; createdAt: string; updatedAt: string;
}

/** Base shape returned on every list row AND every single-order response. */
export interface IOrder {
  _id: string;
  orderNumber: string;
  customer?: string;
  customerSnapshot: ICustomerSnapshot;
  shippingAddress: IShippingAddressSnapshot;
  items: IOrderItemSnapshot[];
  subtotalInPoisha: number;
  discountInPoisha: number;
  deliveryFeeInPoisha: number;
  grandTotalInPoisha: number;
  shippingZoneCode?: string;
  coupon?: string;
  couponCode?: string;
  paymentMethod: TPaymentMethod;
  paymentStatus: TPaymentStatus;
  codAmountInPoisha: number;
  manualPaymentClaimedAmountInPoisha: number;
  manualPaymentSenderNumber?: string;
  manualPaymentTrxId?: string;
  paymentFlags: { duplicateTrxId: boolean };
  paymentVerifiedAt?: string;
  status: TOrderStatus;
  source: TOrderSource;
  legalNextStatuses: TOrderStatus[];
  createdAt: string;
  updatedAt: string;
}

/** GET /orders/:id, and the response of every mutating order endpoint. */
export interface IOrderDetail extends IOrder {
  statusHistory: IOrderStatusHistoryEntry[];
}

export interface ICheckoutItemInput { variantId: string; quantity: number }

export interface IOrderCreatePayload {
  customer: ICustomerSnapshot;
  shippingAddress: IShippingAddressSnapshot;
  items: ICheckoutItemInput[];
  paymentMethod: TPaymentMethod;
  manualPaymentSenderNumber?: string;
  manualPaymentTrxId?: string;
  couponCode?: string;
}

export interface IPlaceOrderResponse extends IOrderDetail { idempotencyReplayed: boolean }

/** POST /checkout/validate response — a pricing preview, no order created. */
export interface ICheckoutPreview {
  currency: "BDT";
  items: Omit<IOrderItemSnapshot, "variant">[];
  subtotalInPoisha: number; discountInPoisha: number; discountedSubtotalInPoisha: number;
  deliveryFeeInPoisha: number; shippingZoneCode?: string;
  grandTotalInPoisha: number;
  coupon: { _id: string; code: string } | null;
}
