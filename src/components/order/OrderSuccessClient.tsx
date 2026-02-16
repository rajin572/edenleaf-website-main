"use client";

import { CheckCircle, Truck, ArrowRight, UserPlus, Package } from 'lucide-react';
import LocaleLink from '@/components/i18n/LocaleLink';
import { useCurrentLocale } from '@/components/i18n/LocaleLink';
import { useDictionary } from '@/components/i18n/DictionaryProvider';
import { useLastOrderStore } from '@/store/lastOrderStore';
import { formatPriceFromPoisha } from '@/utils/money';

interface OrderSuccessClientProps {
    orderNumber: string;
}

/** The full placed-order response is stashed in sessionStorage right before
 *  this page is reached (see CheckoutClient) — GET /orders/:id requires auth,
 *  which a guest checkout doesn't have, so there's no way to re-fetch it here.
 *  A direct link, a refresh after the session expires, or a different tab
 *  simply falls back to the generic static copy below — never a hard error
 *  for what was, from the customer's side, a successful order. */
const OrderSuccessClient = ({ orderNumber }: OrderSuccessClientProps) => {
    const { dict: t } = useDictionary();
    const locale = useCurrentLocale();
    const order = useLastOrderStore((s) => s.order);
    const match = order?.orderNumber === orderNumber ? order : null;

    const price = (poisha: number) => formatPriceFromPoisha(poisha, locale, t.common.currency);

    return (
        <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col items-center">

            <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mb-6 border-4 border-success/20">
                <CheckCircle size={40} />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
                {t.checkoutSuccess.title}
            </h1>

            <p className="text-text-secondary text-center max-w-md mb-8">
                {t.checkoutSuccess.description}
            </p>

            <div className="bg-surface border border-border rounded-xl p-6 md:p-8 w-full max-w-lg mb-8 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
                    <div className="text-center sm:text-left">
                        <p className="text-sm text-text-secondary mb-1">{t.checkoutSuccess.orderNumber}</p>
                        <p className="text-lg font-bold text-foreground">{orderNumber}</p>
                    </div>
                    <div className="text-center sm:text-right">
                        <p className="text-sm text-text-secondary mb-1">{t.checkoutSuccess.expectedDelivery}</p>
                        <p className="text-lg font-bold text-primary flex items-center justify-center sm:justify-end gap-2">
                            <Truck size={18} />
                            {t.checkoutSuccess.expectedDeliveryTime}
                        </p>
                    </div>
                </div>

                {match ? (
                    <div className="bg-muted/30 rounded-lg p-5 border border-border space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Package size={16} className="text-primary" /> {match.items.length} item{match.items.length === 1 ? '' : 's'}
                        </div>
                        <div className="flex justify-between text-sm text-text-secondary">
                            <span>{match.paymentMethod === 'COD' ? 'Cash on Delivery' : match.paymentMethod === 'BKASH_MANUAL' ? 'bKash' : 'Nagad'}</span>
                            <span className="font-bold text-foreground">{price(match.grandTotalInPoisha)}</span>
                        </div>
                        {match.paymentFlags.duplicateTrxId && (
                            <p className="text-xs text-text-secondary">Our team will confirm your payment shortly.</p>
                        )}
                    </div>
                ) : (
                    <div className="bg-primary/5 rounded-lg p-5 border border-primary/20 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
                            <UserPlus size={24} />
                        </div>
                        <p className="text-sm text-foreground font-medium mb-4">
                            {t.checkoutSuccess.guestPrompt}
                        </p>
                        <LocaleLink href="/sign-up" className="px-6 py-2.5 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors w-full sm:w-auto">
                            {t.checkoutSuccess.createAccount}
                        </LocaleLink>
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
                <LocaleLink href="/track-order" className="flex-1 h-12 flex items-center justify-center gap-2 bg-foreground text-background font-bold rounded-lg hover:bg-foreground/90 transition-colors">
                    {t.checkoutSuccess.trackOrder} <ArrowRight size={18} />
                </LocaleLink>
                <LocaleLink href="/collections/best-sales" className="flex-1 h-12 flex items-center justify-center bg-surface border border-border text-foreground font-bold rounded-lg hover:border-primary/50 transition-colors">
                    {t.checkoutSuccess.continueShopping}
                </LocaleLink>
            </div>

        </div>
    );
};

export default OrderSuccessClient;
