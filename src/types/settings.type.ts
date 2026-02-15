/** GET /settings/public — no auth required, Cache-Control: public, max-age=60. */
export interface IShippingZone {
  code: string;
  name: string;
  districts: string[];
  feeInPoisha: number;
}

export interface ISettingsPublic {
  storeName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  currency: "BDT";
  timezone: string;
  shipping: {
    zones: IShippingZone[];
    defaultFeeInPoisha: number;
    freeShippingThresholdInPoisha: number | null;
  };
  codEnabled: boolean;
  bkashEnabled: boolean;
  nagadEnabled: boolean;
  bkashNumber: string;
  nagadNumber: string;
  seo: { metaTitle: string; metaDescription: string };
}
