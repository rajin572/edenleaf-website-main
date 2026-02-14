export interface IReviewSubmission {
  orderId: string;
  productId: string;
  variantId: string;
  rating: number;
  text: string;
}

export interface IGuestReviewSubmission extends Omit<IReviewSubmission, "orderId"> {
  token: string;
}

export type TReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";

export interface IMyReview {
  _id: string;
  productId: string;
  variantId: string;
  orderId: string;
  reviewer: { name: string };
  rating: number;
  text: string;
  verifiedPurchase: boolean;
  status: TReviewStatus;
  moderationNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IReviewableItem {
  orderId: string;
  orderNumber: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  deliveredAt: string;
}
