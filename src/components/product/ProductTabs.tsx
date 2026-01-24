"use client";

import { useMemo, useState } from "react";
import { MessageSquarePlus, Star } from "lucide-react";
import { EmptyState } from "@/components/ui/CustomUi/EmptyState";
import { useDictionary } from "@/components/i18n/DictionaryProvider";
import { format } from "@/i18n/config";
import { formatCount } from "@/utils/money";
import { formatDateForLocale } from "@/utils/dateFormet";
import type { IProduct, IProductReview } from "@/types";
import { ReviewModal } from "./ReviewModal";

interface ProductTabsProps {
  product: IProduct;
  reviews: IProductReview[];
}

type TabValue = "description" | "reviews";

const ProductTabs = ({ product, reviews }: ProductTabsProps) => {
  const { dict: t, locale } = useDictionary();
  const [activeTab, setActiveTab] = useState<TabValue>("description");

  const count = (value: number) => formatCount(value, locale);

  /** Star histogram, drawn from the reviews we actually have. */
  const distribution = useMemo(() => {
    const buckets = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      total: reviews.filter((review) => Math.round(review.rating) === stars).length,
    }));
    return buckets.map((bucket) => ({
      ...bucket,
      percent: reviews.length ? (bucket.total / reviews.length) * 100 : 0,
    }));
  }, [reviews]);

  const tabClasses = (tab: TabValue) =>
    `flex-1 md:flex-none px-6 py-4 font-semibold text-sm md:text-base border-b-2 transition-colors ${activeTab === tab
      ? "border-primary text-primary"
      : "border-transparent text-text-secondary hover:text-foreground"
    }`;

  return (
    <section className="border border-border rounded-lg bg-card overflow-hidden">
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("description")}
          aria-pressed={activeTab === "description"}
          className={tabClasses("description")}
        >
          {t.product.description}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          aria-pressed={activeTab === "reviews"}
          className={tabClasses("reviews")}
        >
          {format(t.product.reviewsWithCount, { count: count(reviews.length) })}
        </button>
      </div>

      <div className="p-6 md:p-8">
        {activeTab === "description" ? (
          <div className="max-w-3xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {t.product.productOverview || "Product Details"}
              </h2>
              <div className="h-0.5 w-24 bg-primary mt-2" />
            </div>
            
            {product.productDetails ? (
              <div className="text-text-secondary leading-relaxed space-y-8 text-sm md:text-base">
                <div>
                  {product.productDetails.title && (
                    <h3 className="text-foreground font-bold text-base md:text-lg mb-2">
                      {product.productDetails.title}
                    </h3>
                  )}
                  {product.productDetails.description && (
                    <p className="mb-4">{product.productDetails.description}</p>
                  )}
                </div>

                {product.productDetails.keyFeatures && product.productDetails.keyFeatures.length > 0 && (
                  <div>
                    <h3 className="text-foreground font-bold mb-3">{locale === "bn" ? "মূল বৈশিষ্ট্য:" : "Key Features:"}</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {product.productDetails.keyFeatures.map((feature, idx) => (
                        <li key={idx} className="pl-1">{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.productDetails.healthBenefits && product.productDetails.healthBenefits.length > 0 && (
                  <div>
                    <h3 className="text-foreground font-bold mb-3">{locale === "bn" ? "স্বাস্থ্য উপকারিতা:" : "Health Benefits:"}</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {product.productDetails.healthBenefits.map((benefit, idx) => (
                        <li key={idx} className="pl-1">{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.productDetails.usageStorage && product.productDetails.usageStorage.length > 0 && (
                  <div>
                    <h3 className="text-foreground font-bold mb-3">{locale === "bn" ? "ব্যবহার ও সংরক্ষণ:" : "Usage & Storage:"}</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {product.productDetails.usageStorage.map((usage, idx) => (
                        <li key={idx} className="pl-1">{usage}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-text-secondary leading-relaxed">
                {product.description}
              </p>
            )}
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState
            icon={MessageSquarePlus}
            title={t.product.reviews}
            description={t.product.writeReview}
          >
            <ReviewModal productId={product._id}>
              <button
                type="button"
                className="mt-6 cursor-pointer px-6 py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary-dark transition-colors"
              >
                {t.product.writeReview}
              </button>
            </ReviewModal>
          </EmptyState>
        ) : (
          <div>
            <div className="flex flex-col md:flex-row gap-8 mb-8 border-b border-border pb-8">
              <div className="md:w-1/3 flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-bold text-foreground mb-2">
                  {count(product.avgRating)}
                </span>
                <div className="flex text-warning mb-2">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      size={20}
                      fill={index < Math.floor(product.avgRating) ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <span className="text-text-secondary text-sm">
                  {format(t.product.basedOnReviews, { count: count(reviews.length) })}
                </span>
              </div>

              <div className="md:w-2/3 space-y-2 self-center">
                {distribution.map((bucket) => (
                  <div key={bucket.stars} className="flex items-center gap-3">
                    <span className="text-sm text-text-secondary w-20 shrink-0">
                      {count(bucket.stars)} {t.product.stars}
                    </span>
                    <div className="grow h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-warning"
                        style={{ width: `${bucket.percent}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {count(bucket.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <ul className="space-y-6">
              {reviews.map((review) => (
                <li key={review._id} className="border-b border-border pb-6 last:border-0">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {review.reviewer.name}
                      </span>
                      {review.verifiedPurchase && (
                        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {t.product.verifiedPurchase}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDateForLocale(review.createdAt, locale)}
                    </span>
                  </div>
                  <div className="flex text-warning mb-2">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        size={14}
                        fill={index < review.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {review.text}
                  </p>
                </li>
              ))}
            </ul>

            <ReviewModal productId={product._id}>
              <button
                type="button"
                className="mt-8 px-6 py-2 border border-primary text-primary rounded-md font-semibold hover:bg-primary/5 transition-colors"
              >
                {t.product.writeReview}
              </button>
            </ReviewModal>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductTabs;
