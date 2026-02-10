export type ICouponAvailability =
  | "available" | "upcoming" | "expired" | "inactive" | "exhausted" | "used" | "first_order_only";

export interface IMyCoupon {
  _id: string;
  code: string;
  name: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderInPoisha: number;
  maxDiscountInPoisha: number | null;
  startsAt: string;
  expiresAt: string;
  usageLimit: number | null;
  usedCount: number;
  remainingUses: number | null;
  perUserLimit: number | null;
  firstOrderOnly: boolean;
  isPublic: boolean;
  status: "active" | "inactive" | "archived";
  userUses: number;
  availability: ICouponAvailability;
}
