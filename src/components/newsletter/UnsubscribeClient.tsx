"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { MailX, CheckCircle2, TriangleAlert } from "lucide-react";
import LocaleLink from "@/components/i18n/LocaleLink";
import { unsubscribeFromNewsletter, getStoredUnsubscribeToken } from "@/service/NewsletterService/newsletterApi";
import tryCatchWrapper from "@/utils/tryCatchWrapper";

export default function UnsubscribeClient() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  // The backend never emails the unsubscribe link (no mailer wired for this
  // module) — it's only ever returned in the subscribe response, so this
  // falls back to whatever this browser stored at subscribe time. A real fix
  // (emailing the link) needs backend work, not solvable from here alone.
  const token = searchParams.get("token") ?? getStoredUnsubscribeToken();
  const [unsubscribed, setUnsubscribed] = useState(false);

  const handleConfirm = async () => {
    const res = await tryCatchWrapper(
      unsubscribeFromNewsletter,
      { body: { token } },
      { toastLoadingMessage: "Unsubscribing..." }
    );
    if (res?.success) setUnsubscribed(true);
  };

  if (unsubscribed) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <CheckCircle2 size={48} className="text-success mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">You&apos;ve been unsubscribed</h1>
        <p className="text-text-secondary max-w-md mb-6">
          {email ? `${email} will no longer receive` : "You will no longer receive"} promotional emails from us.
        </p>
        <LocaleLink href="/" className="text-primary font-semibold hover:underline">
          Back to homepage
        </LocaleLink>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-6">
          <TriangleAlert size={28} />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">This unsubscribe link is invalid</h1>
        <p className="text-text-secondary max-w-md mb-6">
          We couldn&apos;t find an unsubscribe link for this browser. Try opening the link from your subscription
          confirmation, or contact us if you keep receiving emails you didn&apos;t sign up for.
        </p>
        <LocaleLink href="/" className="text-primary font-semibold hover:underline">
          Back to homepage
        </LocaleLink>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
        <MailX size={28} />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Unsubscribe from our newsletter?</h1>
      <p className="text-text-secondary max-w-md mb-6">
        {email ? `${email} will` : "You will"} stop receiving discount and offer emails from us. You can always
        resubscribe later from the homepage.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-md font-semibold transition-colors"
        >
          Confirm Unsubscribe
        </button>
        <LocaleLink
          href="/"
          className="px-6 py-2.5 border border-border rounded-md font-semibold hover:bg-muted transition-colors"
        >
          Cancel
        </LocaleLink>
      </div>
    </div>
  );
}
