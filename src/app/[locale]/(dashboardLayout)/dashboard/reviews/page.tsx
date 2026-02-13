import { redirect } from "next/navigation";
import { Package, MessageSquarePlus, Star } from 'lucide-react';
import { ReviewModal } from '@/components/product/ReviewModal';
import { getCurrentUser } from "@/service/AuthService/AuthServiceAPi";
import { getMyReviews, getReviewableItems } from "@/service/ReviewService/reviewApi";
import { isLocale } from "@/i18n/config";
import { formatDateForLocale } from "@/utils/dateFormet";
import type { IMyReview, TReviewStatus } from "@/types";

const STATUS_STYLES: Record<TReviewStatus, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
    HIDDEN: "bg-gray-200 text-gray-600",
};

type ReviewsPageParams = { params: Promise<{ locale: string }> };

export default async function ReviewsPage({ params }: ReviewsPageParams) {
    const { locale } = await params;
    if (!isLocale(locale)) redirect("/");

    const me = await getCurrentUser();
    if (!me?.success) redirect(`/${locale}/sign-in`);

    const [reviewableRes, myReviewsRes] = await Promise.all([
        getReviewableItems(),
        getMyReviews(),
    ]);
    const reviewable = reviewableRes.data ?? [];
    const myReviews: IMyReview[] = myReviewsRes?.data?.data ?? [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-1">My Reviews</h1>
                <p className="text-sm text-text-secondary">Share your experience with products you have received.</p>
            </div>

            <section>
                <h2 className="text-lg font-bold mb-4">Pending Reviews</h2>
                {reviewable.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-text-secondary">
                        No delivered items are waiting for a review right now.
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] divide-y divide-gray-100 overflow-hidden">
                        {reviewable.map((item) => (
                            <div key={`${item.orderId}-${item.variantId}`} className="p-4 flex items-center gap-4">
                                <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center shrink-0 text-text-muted">
                                    <Package size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm line-clamp-2">{item.productName} — {item.variantName}</p>
                                    <p className="text-xs text-text-secondary mt-1">Delivered on {formatDateForLocale(item.deliveredAt, locale)}</p>
                                </div>
                                <ReviewModal productId={item.productId}>
                                    <button
                                        type="button"
                                        className="shrink-0 flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md font-semibold text-sm transition-colors"
                                    >
                                        <MessageSquarePlus size={16} /> Write Review
                                    </button>
                                </ReviewModal>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 className="text-lg font-bold mb-4">My Reviews</h2>
                {myReviews.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-text-secondary">
                        You haven&apos;t submitted any reviews yet.
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] divide-y divide-gray-100 overflow-hidden">
                        {myReviews.map((review) => (
                            <div key={review._id} className="p-4">
                                <div className="flex items-center justify-between mb-2 gap-2">
                                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[review.status]}`}>
                                        {review.status}
                                    </span>
                                    <span className="text-xs text-text-secondary">{formatDateForLocale(review.createdAt, locale)}</span>
                                </div>
                                <div className="flex text-warning mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                                    ))}
                                </div>
                                <p className="text-sm text-text-secondary">{review.text}</p>
                                {review.moderationNote && (
                                    <p className="text-xs text-text-secondary italic mt-2">Note from our team: {review.moderationNote}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
