"use server";

import { fetchWithAuth } from "@/lib/fetchWraper";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import type { IOtpTiming } from "@/types";
import { brandCookieName, legacyCookieName } from "@/lib/brandCookieNames";

const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

// Secure cookies only in production — dev runs over http, where a Secure cookie
// would be rejected by the browser.
const isProduction = process.env.NODE_ENV === "production";

// Session cookies. Not httpOnly because client code reads the access token
// (TopBar, SocketProvider).
const sessionCookieOptions = (expires: Date) => ({
  path: "/",
  expires,
  secure: isProduction,
  sameSite: "lax" as const,
});

// The refresh token is only ever read by server actions, so it is httpOnly.
const REFRESH_TTL_MS = 1000 * 60 * 60 * 24 * 30; // matches the backend's JWT_REFRESH_EXPIRES_IN (30d)
const refreshCookieOptions = () => ({
  path: "/",
  expires: new Date(Date.now() + REFRESH_TTL_MS),
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
});

// Short-lived cookies that gate each step of the signup / reset chains. Nothing
// on the client reads these, so they are httpOnly.
const chainCookieOptions = (maxAge: number) => ({
  path: "/",
  maxAge,
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
});

const CHAIN_TTL = 60 * 15; // 15 minutes
const OTP_TIMING_COOKIE = brandCookieName("otp_timing");
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30 * 3; // 3 months

const readBrandCookie = async (suffix: string) => {
  const cookieStore = await cookies();
  return cookieStore.get(brandCookieName(suffix))?.value
    ?? cookieStore.get(legacyCookieName(suffix))?.value;
};

const clearBrandCookie = async (suffix: string) => {
  const cookieStore = await cookies();
  cookieStore.delete(brandCookieName(suffix));
  cookieStore.delete(legacyCookieName(suffix));
};

type OtpTimingData = Pick<IOtpTiming, "expiresAt" | "resendAt">;

const storeOtpTiming = async (email: string, type: IOtpTiming["type"], data?: OtpTimingData) => {
  if (!data || !Number.isFinite(Date.parse(data.expiresAt)) || !Number.isFinite(Date.parse(data.resendAt))) return;
  const timing: IOtpTiming = { email: email.trim().toLowerCase(), type, expiresAt: data.expiresAt, resendAt: data.resendAt };
  (await cookies()).set(OTP_TIMING_COOKIE, JSON.stringify(timing), chainCookieOptions(CHAIN_TTL));
};

export const getOtpTiming = async (): Promise<{ timing: IOtpTiming | null; now: number }> => {
  const raw = await readBrandCookie("otp_timing");
  if (!raw) return { timing: null, now: Date.now() };
  try {
    const timing = JSON.parse(raw) as IOtpTiming;
    if (typeof timing.email !== "string" || !["signup", "reset"].includes(timing.type)
      || !Number.isFinite(Date.parse(timing.expiresAt)) || !Number.isFinite(Date.parse(timing.resendAt))) {
      return { timing: null, now: Date.now() };
    }
    return { timing, now: Date.now() };
  } catch {
    return { timing: null, now: Date.now() };
  }
};

type Req<T = Record<string, unknown>> = { body?: T; params?: Record<string, string> };

type ApiResult<T = unknown> =
  | { success: true; message: string; data?: T }
  | { success: false; message: string; data?: undefined };

/** POST JSON to the API and normalise transport failures into the envelope.
 *  `bearerToken`, when given, is sent as `Authorization: Bearer <token>` —
 *  the backend reads reset/refresh tokens from that header, never the body. */
const postJsonRaw = async <T>(
  path: string,
  body: unknown,
  bearerToken?: string
): Promise<{ result: ApiResult<T>; refreshToken?: string }> => {
  try {
    const res = await fetch(`${BASE_API}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
      },
      body: JSON.stringify(body ?? {}),
      cache: "no-store",
    });
    // The API hands the rotated refresh token back only as an httpOnly Set-Cookie. This call is
    // server-to-server, so the browser never sees it — read it here and store it ourselves.
    const refreshToken = res.headers
      .getSetCookie()
      .find((cookie) => cookie.startsWith("refreshToken="))
      ?.split(";")[0]
      .slice("refreshToken=".length);
    return { result: await res.json(), refreshToken: refreshToken || undefined };
  } catch {
    return { result: { success: false, message: "Could not reach the server. Please try again." } };
  }
};

const postJson = async <T>(path: string, body: unknown, bearerToken?: string): Promise<ApiResult<T>> =>
  (await postJsonRaw<T>(path, body, bearerToken)).result;

/* ------------------------------------------------------------------ signup */

/**
 * Step 1 — POST /auth/register hashes the password server-side and stores the
 * pending account next to the OTP record. The backend hands back a signed,
 * short-lived `signupToken` (not the password) that we hold in an httpOnly
 * cookie until step 2 — the raw password never round-trips back to us.
 */
export const registerUser = async (req: Req = {}) => {
  const { name, email, phone, password } = (req.body ?? {}) as Record<string, string>;

  const result = await postJson<{ signupToken: string } & OtpTimingData>("/auth/register", {
    name,
    emailOrPhone: email,
    phone,
    password,
  });

  if (result?.success && result.data?.signupToken) {
    (await cookies()).set(
      brandCookieName("signup_token"),
      result.data.signupToken,
      chainCookieOptions(CHAIN_TTL)
    );
    await storeOtpTiming(email, "signup", result.data);
  }

  return result;
};

/** Step 2 — POST /auth/verify-otp creates the account. */
export const verifySignupOtp = async (req: Req = {}) => {
  const { code } = (req.body ?? {}) as Record<string, string>;

  const signupToken = await readBrandCookie("signup_token");
  if (!signupToken) {
    return { success: false, message: "Your signup session expired. Please sign up again." };
  }

  const result = await postJson("/auth/verify-otp", { signupToken, code });

  if (result?.success) {
    await clearBrandCookie("signup_token");
    await clearBrandCookie("otp_timing");
  }

  return result;
};

/** POST /auth/resend-otp — `type` is "signup" or "forgot". Signup also threads
 *  the signupToken through so the resent OTP stays tied to the same pending
 *  account, and stores the fresh token the backend issues back. */
export const resendOtp = async (req: Req = {}) => {
  const { email, type } = (req.body ?? {}) as Record<string, string>;
  const otpType = type ?? "signup";

  if (otpType === "signup") {
    const signupToken = await readBrandCookie("signup_token");
    if (!signupToken) {
      return { success: false, message: "Your signup session expired. Please sign up again." };
    }

    const result = await postJson<{ signupToken: string } & OtpTimingData>("/auth/resend-otp", {
      emailOrPhone: email,
      type: otpType,
      signupToken,
    });

    if (result?.success && result.data?.signupToken) {
      (await cookies()).set(
        brandCookieName("signup_token"),
        result.data.signupToken,
        chainCookieOptions(CHAIN_TTL)
      );
      await storeOtpTiming(email, "signup", result.data);
    }

    return result;
  }

  const result = await postJson<OtpTimingData>("/auth/resend-otp", { emailOrPhone: email, type: otpType });
  if (result.success) await storeOtpTiming(email, "reset", result.data);
  return result;
};

/* ------------------------------------------------------------------- login */

export const loginUser = async (req: Req = {}) => {
  const { result, refreshToken } = await postJsonRaw<{ accessToken: string }>("/auth/login", req.body);

  if (result?.success && result.data?.accessToken) {
    // Only customers (role === "user") may sign in on this app. Any other role
    // is rejected before any token is stored.
    let role: string | undefined;
    try {
      role = (jwtDecode(result.data.accessToken) as { role?: string })?.role;
    } catch {
      role = undefined;
    }

    if (role !== "user") {
      return { success: false, message: "Permission denied" };
    }

    const expires = new Date(Date.now() + SESSION_TTL_MS);
    const cookieStore = await cookies();

    cookieStore.set(brandCookieName("access_token"), result.data.accessToken, sessionCookieOptions(expires));

    if (refreshToken) {
      cookieStore.set(brandCookieName("refresh_token"), refreshToken, refreshCookieOptions());
    }
  }

  return result;
};

export const logoutUser = async () => {
  // fetchWithAuth attaches the access token as the Authorization header; the
  // backend revokes that token's session directly, so no refresh token needs
  // to be sent at all.
  const result = await fetchWithAuth("/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .catch(() => ({ success: true, message: "Logged out" }));

  await clearBrandCookie("access_token");
  await clearBrandCookie("refresh_token");

  return result;
};

/* ---------------------------------------------------------- password reset */

/** Step 1 — POST /auth/forgot-password sends the reset OTP. */
export const forgetPassword = async (req: Req = {}) => {
  const result = await postJson<OtpTimingData>("/auth/forgot-password", req.body);
  if (result.success) {
    const { email } = (req.body ?? {}) as { email?: string };
    if (email) await storeOtpTiming(email, "reset", result.data);
  }
  return result;
};

/**
 * Step 2 — POST /auth/verify-forgot-otp exchanges the OTP for a reset token,
 * which is held in an httpOnly cookie so the reset step never handles it
 * client-side.
 */
export const verifyForgotOtp = async (req: Req = {}) => {
  const result = await postJson<{ resetToken: string }>("/auth/verify-forgot-otp", req.body);

  if (result?.success && result.data?.resetToken) {
    (await cookies()).set(
      brandCookieName("forgot_otp_match_token"),
      result.data.resetToken,
      chainCookieOptions(CHAIN_TTL)
    );
    await clearBrandCookie("otp_timing");
  }

  return result;
};

/** Step 3 — POST /auth/reset-password consumes the reset token, sent as an
 *  Authorization header (the backend no longer accepts it in the body). */
export const resetPassword = async (req: Req = {}) => {
  const { newPassword } = (req.body ?? {}) as Record<string, string>;

  const resetToken = await readBrandCookie("forgot_otp_match_token");
  if (!resetToken) {
    return { success: false, message: "Your reset session expired. Please start again." };
  }

  const result = await postJson("/auth/reset-password", { newPassword }, resetToken);

  if (result?.success) {
    await clearBrandCookie("forgot_otp_match_token");
  }

  return result;
};

/* ------------------------------------------------------------ authenticated */

/** PATCH /users/me — name/phone/avatar only; email is not editable here. */
export const updateProfile = async (req: Req = {}) => {
  try {
    const res = await fetchWithAuth("/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body ?? {}),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Could not reach the server. Please try again." };
  }
};

/** PATCH /auth/change-password */
export const changeUserPassword = async (req: Req = {}) => {
  try {
    const res = await fetchWithAuth("/auth/change-password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body ?? {}),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Could not reach the server. Please try again." };
  }
};

/** GET /auth/me — user, role and resolved permissions. */
export const getCurrentUser = async () => {
  try {
    const res = await fetchWithAuth("/auth/me", { method: "GET", cache: "no-store" });
    return await res.json();
  } catch {
    return { success: false, message: "Could not reach the server. Please try again." };
  }
};

/** POST /auth/refresh-token — trades the stored refresh token for a new access token and rotates
 *  the refresh token (each one is single-use). Sent as an Authorization header; the backend no
 *  longer accepts it in the body. On a rejected refresh both cookies are cleared. */
export const getNewToken = async (): Promise<{ success: boolean; message?: string }> => {
  const refreshToken = await readBrandCookie("refresh_token");
  if (!refreshToken) {
    // Signed in before refresh tokens were stored (or the cookie was lost): the access token just
    // 401'd and cannot be renewed, so end the session instead of leaving a dead "logged in" state.
    await clearBrandCookie("access_token");
    return { success: false, message: "No refresh token available." };
  }

  let rejected = false;
  try {
    const res = await fetch(`${BASE_API}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${refreshToken}` },
      body: "{}",
      cache: "no-store",
    });
    rejected = res.status === 401 || res.status === 403;
    const json = await res.json();
    const accessToken = json?.data?.accessToken as string | undefined;
    if (!res.ok || !accessToken) {
      if (rejected) {
        await clearBrandCookie("access_token");
        await clearBrandCookie("refresh_token");
      }
      return { success: false, message: json?.message ?? "Could not refresh the session." };
    }

    const nextRefresh = res.headers
      .getSetCookie()
      .find((cookie) => cookie.startsWith("refreshToken="))
      ?.split(";")[0]
      .slice("refreshToken=".length);
    const cookieStore = await cookies();
    cookieStore.set(brandCookieName("access_token"), accessToken, sessionCookieOptions(new Date(Date.now() + SESSION_TTL_MS)));
    if (nextRefresh) cookieStore.set(brandCookieName("refresh_token"), nextRefresh, refreshCookieOptions());
    return { success: true };
  } catch {
    // Network error: keep the session, the next request tries again.
    return { success: false, message: "Could not reach the server. Please try again." };
  }
};
