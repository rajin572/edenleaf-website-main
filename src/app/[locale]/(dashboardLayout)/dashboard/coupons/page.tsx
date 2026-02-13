import { redirect } from "next/navigation";
import { Ticket } from "lucide-react";
import CopyCodeButton from "@/components/dashboard/CopyCodeButton";
import { getCurrentUser } from "@/service/AuthService/AuthServiceAPi";
import { getMyCoupons } from "@/service/CouponService/couponApi";
import { getDictionary } from "@/i18n/dictionaries";
import { format, INTL_LOCALES, isLocale } from "@/i18n/config";
import { formatPriceFromPoisha } from "@/utils/money";
import type { ICouponAvailability, IMyCoupon } from "@/types";

type CouponsPageParams = { params: Promise<{ locale: string }> };

const AVAILABLE: ICouponAvailability[] = ["available", "upcoming"];

export default async function CouponsPage({ params }: CouponsPageParams) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect("/");

  // (dashboardLayout)/layout.tsx already redirects signed-out visitors, but
  // this page needs the real user data anyway (nothing to render without a
  // fetched coupon list) — Next's fetch memoization means calling
  // getCurrentUser() again here costs nothing extra.
  const me = await getCurrentUser();
  if (!me?.success) redirect(`/${locale}/sign-in`);

  const t = await getDictionary();
  const coupons = await getMyCoupons();
  const available = coupons.filter((c) => AVAILABLE.includes(c.availability));
  const unavailable = coupons.filter((c) => !AVAILABLE.includes(c.availability));

  const price = (poisha: number) => formatPriceFromPoisha(poisha, locale, t.common.currency);
  const dateFmt = new Intl.DateTimeFormat(INTL_LOCALES[locale], { year: "numeric", month: "short", day: "numeric" });

  const discountLabel = (coupon: IMyCoupon) =>
    coupon.type === "percentage" ? `${coupon.value}% ${t.myCoupons.off}` : price(coupon.value);

  const statusLabel = (availability: ICouponAvailability) => {
    switch (availability) {
      case "expired": return t.myCoupons.statusExpired;
      case "inactive": return t.myCoupons.statusInactive;
      case "exhausted": return t.myCoupons.statusExhausted;
      case "used": return t.myCoupons.statusUsed;
      case "first_order_only": return t.myCoupons.statusFirstOrderOnly;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">{t.myCoupons.title}</h1>
        <p className="text-sm text-text-secondary">{t.myCoupons.subtitle}</p>
      </div>

      <section>
        <h2 className="text-lg font-bold mb-4">{t.myCoupons.available}</h2>
        {available.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-text-secondary">
            {t.myCoupons.noneAvailable}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {available.map((coupon) => (
              <div key={coupon._id} className="bg-white border-2 border-dashed border-primary/30 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 relative overflow-hidden">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Ticket size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{discountLabel(coupon)}</p>
                    <p className="text-xs text-text-secondary">
                      {coupon.minOrderInPoisha > 0
                        ? format(t.myCoupons.minOrder, { amount: price(coupon.minOrderInPoisha) })
                        : coupon.name}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-text-secondary mb-4">
                  {coupon.availability === "upcoming"
                    ? format(t.myCoupons.upcomingFrom, { date: dateFmt.format(new Date(coupon.startsAt)) })
                    : format(t.myCoupons.validTill, { date: dateFmt.format(new Date(coupon.expiresAt)) })}
                </p>
                <div className="flex items-center justify-between border border-border rounded-md px-3 py-2 bg-muted/30">
                  <span className="font-mono font-bold tracking-wider text-sm">{coupon.code}</span>
                  <CopyCodeButton code={coupon.code} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">{t.myCoupons.unavailable}</h2>
        {unavailable.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-text-secondary">
            {t.myCoupons.noneUnavailable}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unavailable.map((coupon) => (
              <div key={coupon._id} className="bg-muted/30 border border-border rounded-xl p-5 opacity-60">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-muted text-text-muted flex items-center justify-center shrink-0">
                    <Ticket size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-foreground">{discountLabel(coupon)}</p>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary shrink-0">
                        {statusLabel(coupon.availability)}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      {coupon.minOrderInPoisha > 0
                        ? format(t.myCoupons.minOrder, { amount: price(coupon.minOrderInPoisha) })
                        : coupon.name}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-text-secondary mb-4">
                  {coupon.availability === "expired"
                    ? format(t.myCoupons.expiredOn, { date: dateFmt.format(new Date(coupon.expiresAt)) })
                    : format(t.myCoupons.validTill, { date: dateFmt.format(new Date(coupon.expiresAt)) })}
                </p>
                <div className="border border-border rounded-md px-3 py-2 bg-muted/40">
                  <span className="font-mono font-bold tracking-wider text-sm line-through">{coupon.code}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
