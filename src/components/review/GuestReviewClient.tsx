"use client";

import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { useT } from "@/components/i18n/DictionaryProvider";
import { cn } from "@/lib/utils";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import { submitGuestReview } from "@/service/ReviewService/reviewApi";
import type { ITrackedOrderItem } from "@/types";

interface GuestReviewClientProps {
  token: string;
  items: ITrackedOrderItem[];
}

function GuestReviewItemForm({ token, item, onDone }: { token: string; item: ITrackedOrderItem; onDone: () => void }) {
  const t = useT();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !text.trim()) return;
    setSubmitting(true);
    const res = await tryCatchWrapper(
      submitGuestReview,
      { body: { token, productId: item.product, variantId: item.variant, rating, text: text.trim() } },
      { toastLoadingMessage: t.guestReview.submit },
    );
    setSubmitting(false);
    if (res.success) onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-surface border border-border rounded-xl p-6 md:p-8 shadow-sm">
      <div>
        <p className="font-bold text-foreground">{item.productName} — {item.variantName}</p>
        <p className="text-xs text-text-secondary">{item.unit} × {item.quantity}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">{t.guestReview.ratingLabel}</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1 -ml-1 transition-transform hover:scale-110 focus:outline-none"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                size={28}
                className={cn(
                  "transition-colors",
                  (hoverRating || rating) >= star ? "fill-warning text-warning" : "fill-none text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">{t.guestReview.opinionLabel}</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.guestReview.opinionPlaceholder}
          rows={4}
          className="w-full p-4 border border-border rounded-lg outline-none focus:border-primary resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !rating || !text.trim()}
        className="w-full h-12 font-bold text-sm uppercase tracking-wider bg-foreground text-background rounded-md disabled:opacity-60 transition-colors"
      >
        {t.guestReview.submit}
      </button>
    </form>
  );
}

export default function GuestReviewClient({ token, items }: GuestReviewClientProps) {
  const t = useT();
  const [doneKeys, setDoneKeys] = useState<Set<string>>(new Set());

  const remaining = items.filter((item) => !doneKeys.has(item.variant));

  if (items.length === 0 || remaining.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <CheckCircle2 size={48} className="text-success mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">{t.guestReview.thankYouTitle}</h1>
        <p className="text-text-secondary">{t.guestReview.thankYouDescription}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t.guestReview.title}</h1>
        <p className="text-text-secondary">{t.guestReview.subtitle}</p>
      </div>

      <div className="space-y-6">
        {remaining.map((item) => (
          <GuestReviewItemForm
            key={item.variant}
            token={token}
            item={item}
            onDone={() => setDoneKeys((prev) => new Set(prev).add(item.variant))}
          />
        ))}
      </div>
    </div>
  );
}
