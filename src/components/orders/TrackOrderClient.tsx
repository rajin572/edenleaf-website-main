"use client";

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Search, Package, Truck, CheckCircle2, RefreshCw, Clock } from 'lucide-react';
import { useT } from '@/components/i18n/DictionaryProvider';
import { useCurrentLocale } from '@/components/i18n/LocaleLink';
import OrderStatusBadge from '@/components/dashboard/OrderStatusBadge';
import { issueGuestOrderAccess, trackGuestOrder } from '@/service/TrackingService/trackingApi';
import tryCatchWrapper from '@/utils/tryCatchWrapper';
import { formatPriceFromPoisha } from '@/utils/money';
import { formatDateForLocale } from '@/utils/dateFormet';
import { BD_PHONE_REGEX } from '@/utils/phoneValidation';
import type { ITrackedOrder } from '@/types';

const STORAGE_KEY = 'ednleaf_guest_tracking';
const LEGACY_STORAGE_KEY = 'eCommerce_guest_tracking';

type ContactMethod = 'phone' | 'email';
type LinkState = 'form' | 'checking' | 'result' | 'stale';
type StaleReason = 'expired' | 'rateLimited';

const TrackOrderClient = () => {
    const t = useT();
    const locale = useCurrentLocale();

    const [orderNumber, setOrderNumber] = useState('');
    const [contactMethod, setContactMethod] = useState<ContactMethod>('phone');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [linkState, setLinkState] = useState<LinkState>('checking');
    const [staleReason, setStaleReason] = useState<StaleReason>('expired');
    const [trackedOrder, setTrackedOrder] = useState<ITrackedOrder | null>(null);

    const price = (poisha: number) => formatPriceFromPoisha(poisha, locale, t.common.currency);

    // A returning visitor's tracking link is stashed in localStorage so they
    // don't have to re-type their order number and phone/email every visit —
    // this is also the only realistic way the "link expired/revoked" state
    // (as opposed to "wrong details") is ever reached, since a fresh submit
    // always mints a brand-new, immediately-valid token.
    useEffect(() => {
        let cancelled = false;
        const restoreTracking = async () => {
            let stored: { token: string; orderNumber: string } | null = null;
            try {
                const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
                stored = raw ? JSON.parse(raw) : null;
            } catch {
                stored = null;
            }
            await Promise.resolve();
            if (cancelled) return;
            if (!stored?.token) {
                setLinkState('form');
                return;
            }
            const res = await trackGuestOrder({ body: { token: stored.token } });
            if (cancelled) return;
            if (res.success && res.data) {
                setTrackedOrder(res.data);
                setLinkState('result');
            } else if (res.statusCode === undefined) {
                // A transport failure (offline, DNS, ...), not a backend answer —
                // the stored token might still be perfectly valid, so don't
                // discard it or claim it's expired; just let them try again.
                setLinkState('form');
            } else {
                setOrderNumber(stored.orderNumber);
                setStaleReason(res.statusCode === 429 ? 'rateLimited' : 'expired');
                setLinkState('stale');
            }
        };
        void restoreTracking();
        return () => { cancelled = true; };
    }, []);

    const persistToken = (token: string, orderNum: string) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, orderNumber: orderNum }));
            localStorage.removeItem(LEGACY_STORAGE_KEY);
        } catch {
            // Private mode / blocked storage — the flow still works this visit.
        }
    };

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderNumber.trim()) return;
        if (contactMethod === 'phone' && !BD_PHONE_REGEX.test(phone)) {
            toast.error(t.trackOrder.invalidPhone);
            return;
        }
        if (contactMethod === 'email' && !email.trim()) return;

        setSubmitting(true);
        const issueRes = await tryCatchWrapper(
            issueGuestOrderAccess,
            { body: { orderNumber: orderNumber.trim(), ...(contactMethod === 'phone' ? { phone } : { email }) } },
            { toastLoadingMessage: t.trackOrder.button, showToast: true },
        );
        if (!issueRes.success || !issueRes.data) {
            setSubmitting(false);
            return;
        }

        const trackRes = await trackGuestOrder({ body: { token: issueRes.data.token } });
        setSubmitting(false);
        if (trackRes.success && trackRes.data) {
            persistToken(issueRes.data.token, issueRes.data.orderNumber);
            setTrackedOrder(trackRes.data);
            setLinkState('result');
        } else if (trackRes.statusCode === undefined) {
            toast.error(trackRes.message);
        } else {
            setStaleReason(trackRes.statusCode === 429 ? 'rateLimited' : 'expired');
            setLinkState('stale');
        }
    };

    const handleGetNewLink = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(LEGACY_STORAGE_KEY);
        } catch { /* ignore */ }
        setTrackedOrder(null);
        setLinkState('form');
    };

    if (linkState === 'checking') return null;

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t.trackOrder.title}</h1>
                    <p className="text-text-secondary">{t.trackOrder.description}</p>
                </div>

                {linkState === 'stale' && staleReason === 'rateLimited' && (
                    <div className="bg-surface border border-border rounded-xl p-8 mb-10 text-center">
                        <Clock className="mx-auto mb-4 text-primary" size={32} />
                        <h2 className="text-lg font-bold text-foreground mb-2">{t.trackOrder.rateLimitedTitle}</h2>
                        <p className="text-sm text-text-secondary">{t.trackOrder.rateLimitedDescription}</p>
                    </div>
                )}

                {linkState === 'stale' && staleReason === 'expired' && (
                    <div className="bg-surface border border-border rounded-xl p-8 mb-10 text-center">
                        <RefreshCw className="mx-auto mb-4 text-primary" size={32} />
                        <h2 className="text-lg font-bold text-foreground mb-2">{t.trackOrder.linkExpiredTitle}</h2>
                        <p className="text-sm text-text-secondary mb-6">{t.trackOrder.linkExpiredDescription}</p>
                        <button
                            onClick={handleGetNewLink}
                            className="h-12 px-8 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold transition-colors"
                        >
                            {t.trackOrder.getNewLink}
                        </button>
                    </div>
                )}

                {linkState === 'form' && (
                    <form onSubmit={handleTrack} className="bg-surface border border-border rounded-xl p-6 md:p-8 mb-10 space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-1.5">{t.trackOrder.orderId}</label>
                            <input
                                type="text"
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                placeholder={t.trackOrder.placeholder}
                                className="w-full h-14 px-6 border border-border rounded-lg outline-none focus:border-primary text-lg uppercase"
                                required
                            />
                        </div>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="radio" checked={contactMethod === 'phone'} onChange={() => setContactMethod('phone')} />
                                {t.trackOrder.contactPhone}
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="radio" checked={contactMethod === 'email'} onChange={() => setContactMethod('email')} />
                                {t.trackOrder.contactEmail}
                            </label>
                        </div>

                        {contactMethod === 'phone' ? (
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="01XXXXXXXXX"
                                pattern="^(?:\+?88)?01[3-9]\d{8}$"
                                title={t.trackOrder.invalidPhone}
                                className="w-full h-12 px-4 border border-border rounded-lg outline-none focus:border-primary"
                                required
                            />
                        ) : (
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full h-12 px-4 border border-border rounded-lg outline-none focus:border-primary"
                                required
                            />
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full h-14 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <Search size={20} /> {t.trackOrder.button}
                        </button>
                    </form>
                )}

                {linkState === 'result' && trackedOrder && (
                    <div className="bg-surface border border-border rounded-xl p-6 md:p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-8 border-b border-border gap-4">
                            <div>
                                <p className="text-sm text-text-secondary mb-1">{t.trackOrder.orderId} <span className="font-semibold text-foreground uppercase">{trackedOrder.orderNumber}</span></p>
                                <p className="text-sm text-text-secondary">{trackedOrder.destination.thana}, {trackedOrder.destination.district}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-text-secondary mb-1">{t.trackOrder.status}</p>
                                <OrderStatusBadge status={trackedOrder.status} />
                            </div>
                        </div>

                        <div className="mb-8 space-y-2">
                            {trackedOrder.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="text-foreground">{item.productName} — {item.variantName} × {item.quantity}</span>
                                    <span className="font-semibold text-foreground">{price(item.lineTotalInPoisha)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between text-base font-bold pt-3 border-t border-border">
                                <span>{t.checkout.total}</span>
                                <span className="text-primary">{price(trackedOrder.grandTotalInPoisha)}</span>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute top-5 left-8 bottom-5 w-0.5 bg-muted"></div>
                            <div className="space-y-8">
                                {trackedOrder.statusHistory.map((event, i) => {
                                    const isLast = i === trackedOrder.statusHistory.length - 1;
                                    const Icon = event.status === 'DELIVERED' ? CheckCircle2 : event.status.includes('SHIPPED') || event.status.includes('DELIVERY') ? Truck : Package;
                                    return (
                                        <div key={i} className="flex gap-6 items-start relative">
                                            <div className={`w-16 h-10 rounded-full flex items-center justify-center z-10 shrink-0 border-4 border-surface ${isLast ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-primary/10 text-primary'}`}>
                                                <Icon size={20} />
                                            </div>
                                            <div>
                                                <h4 className={`font-bold ${isLast ? 'text-primary' : 'text-foreground'}`}>{event.status.replace(/_/g, ' ')}</h4>
                                                <p className="text-sm text-text-secondary">{formatDateForLocale(event.createdAt, locale)}</p>
                                                {event.note && <p className="text-sm text-text-secondary">{event.note}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            onClick={handleGetNewLink}
                            className="mt-8 text-sm font-semibold text-primary hover:underline"
                        >
                            {t.trackOrder.trackAnother}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrderClient;
