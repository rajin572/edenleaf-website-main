"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import ReusableModal from "@/components/ui/CustomUi/ReuseableModal";
import { Button } from "@/components/ui/button";
import { useDictionary } from "@/components/i18n/DictionaryProvider";
import { cn } from "@/lib/utils";
import { useForm, Controller } from "react-hook-form";
import { FormTextarea, FormSelect } from "@/components/ui/CustomUi/ReuseForm/Form";
import { SelectItem } from "@/components/ui/select";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getReviewableItems, submitReview } from "@/service/ReviewService/reviewApi";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import type { IReviewableItem } from "@/types";

interface ReviewModalProps {
  productId: string;
  children: React.ReactNode;
}

interface ReviewFormValues {
  opinion: string;
  rating: number;
  selectedKey: string;
}

const itemKey = (item: IReviewableItem) => `${item.orderId}:${item.variantId}`;

export const ReviewModal = ({ productId, children }: ReviewModalProps) => {
  const { dict: t } = useDictionary();
  const rm = t.product.reviewModal;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<IReviewableItem[]>([]);
  const [hoverRating, setHoverRating] = useState(0);

  const { control, handleSubmit, reset, watch } = useForm<ReviewFormValues>({
    defaultValues: { opinion: "", rating: 0, selectedKey: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset({ opinion: "", rating: 0, selectedKey: "" });
    setLoading(true);
    getReviewableItems(productId).then((res) => {
      const eligible = res.data ?? [];
      setItems(eligible);
      if (eligible.length === 1) reset({ opinion: "", rating: 0, selectedKey: itemKey(eligible[0]) });
      setLoading(false);
    });
  }, [open, productId, reset]);

  const onSubmit = async (data: ReviewFormValues) => {
    const selected = items.find((item) => itemKey(item) === data.selectedKey);
    if (!selected) return;
    const res = await tryCatchWrapper(
      submitReview,
      { body: { orderId: selected.orderId, productId, variantId: selected.variantId, rating: data.rating, text: data.opinion } },
      { toastLoadingMessage: rm.submit },
    );
    if (res.success) setOpen(false);
  };

  return (
    <ReusableModal
      open={open}
      onOpenChange={setOpen}
      trigger={children as React.ReactElement}
      title=""
      maxWidth="sm:max-w-[800px]"
    >
      <div className="sr-only">
        <DialogTitle>{rm.title}</DialogTitle>
        <DialogDescription>{rm.subtitle}</DialogDescription>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">{rm.title}</h2>
        <div className="h-1 w-16 bg-primary mt-2 mb-4" />
        <p className="text-sm text-text-secondary">{rm.subtitle}</p>
      </div>

      {loading ? (
        <p className="text-sm text-text-secondary py-8 text-center">{rm.loading}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-text-secondary py-8 text-center">{rm.noEligibleItems}</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {items.length > 1 && (
            <FormSelect control={control} name="selectedKey" label={rm.selectItemLabel} placeholder={rm.selectItemPlaceholder}>
              {items.map((item) => (
                <SelectItem key={itemKey(item)} value={itemKey(item)}>
                  {item.orderNumber} — {item.variantName}
                </SelectItem>
              ))}
            </FormSelect>
          )}

          <FormTextarea
            name="opinion"
            control={control}
            label={rm.opinionLabel}
            placeholder={rm.opinionPlaceholder}
          />

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-4 border-t border-border mt-4">
            <div className="w-full sm:w-1/2">
              <label className="block text-sm font-medium text-foreground mb-2">
                {rm.ratingLabel}
              </label>
              <Controller
                name="rating"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="p-1 -ml-1 transition-transform hover:scale-110 focus:outline-none"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => field.onChange(star)}
                      >
                        <Star
                          size={24}
                          className={cn(
                            "transition-colors",
                            (hoverRating || field.value) >= star
                              ? "fill-warning text-warning"
                              : "fill-none text-muted-foreground"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={!watch("rating") || !watch("selectedKey")}
              className="w-full sm:w-auto h-12 px-8 font-bold text-sm bg-[#222731] hover:bg-[#222731]/90 text-white rounded-md transition-colors uppercase tracking-wider"
            >
              {rm.submit}
            </Button>
          </div>
        </form>
      )}
    </ReusableModal>
  );
};
