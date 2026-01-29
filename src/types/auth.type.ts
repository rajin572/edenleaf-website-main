export interface IWebsiteUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: "active" | "blocked" | "archived";
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface IOtpTiming {
  email: string;
  type: "signup" | "reset";
  expiresAt: string;
  resendAt: string;
}

/** GET /auth/me — resolvedPermissions is always empty for a customer account,
 *  kept here only for envelope-shape parity with the dashboard's identical type. */
export interface IMeResponse extends IWebsiteUser {
  resolvedPermissions: string[];
}
