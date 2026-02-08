"use client";

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import LocaleLink, { useCurrentLocale } from '@/components/i18n/LocaleLink';
import { ArrowLeft, CheckCircle2, Loader2, ShoppingCart } from 'lucide-react';
import { useDictionary } from '@/components/i18n/DictionaryProvider';
import { AllImages } from '../../../public/images/AllImages';
import { useCartStore } from '@/store/cartStore';
import { useLastOrderStore } from '@/store/lastOrderStore';
import { EmptyState } from '@/components/ui/CustomUi/EmptyState';
import Container from '@/components/ui/CustomUi/Container';
import { validateCheckout, placeOrder, newIdempotencyKey } from '@/service/OrderService/orderApi';
import tryCatchWrapper from '@/utils/tryCatchWrapper';
import { formatPrice, formatPriceFromPoisha } from '@/utils/money';
import { localizePath } from '@/i18n/config';
import { BD_PHONE_REGEX } from '@/utils/phoneValidation';
import type { ICheckoutPreview, ISettingsPublic, TPaymentMethod } from '@/types';

interface CheckoutClientProps {
    settings: ISettingsPublic | null;
}

const CheckoutClient = ({ settings }: CheckoutClientProps) => {
    const { dict: t } = useDictionary();
    const locale = useCurrentLocale();
    const router = useRouter();

    const items = useCartStore((state) => state.items);
    const hasHydrated = useCartStore((state) => state.hasHydrated);
    const clearCart = useCartStore((state) => state.clearCart);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [street, setStreet] = useState('');
    const [district, setDistrict] = useState('');
    const [thana, setThana] = useState('');
    const [area, setArea] = useState('');
    const [postcode, setPostcode] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<TPaymentMethod>('COD');
    const [senderNumber, setSenderNumber] = useState('');
    const [trxId, setTrxId] = useState('');
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const [preview, setPreview] = useState<ICheckoutPreview | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const idempotencyKeyRef = useRef<string>('');
    useEffect(() => {
        newIdempotencyKey().then((k) => { idempotencyKeyRef.current = k; });
    }, []);

    const price = (poisha: number) => formatPriceFromPoisha(poisha, locale, t.common.currency);

    const checkoutItems = items
        .filter((i) => !!i.variantId)
        .map((i) => ({ variantId: i.variantId as string, quantity: i.quantity }));
    const checkoutItemsKey = JSON.stringify(checkoutItems);

    // Server-authoritative pricing preview — recomputed whenever anything that
    // affects price changes. Debounced and never toast-driven (it can fire on
    // every keystroke), so a failure here just clears the preview silently;
    // only the explicit "Apply Coupon" click surfaces a toast.
    useEffect(() => {
        if (!hasHydrated || checkoutItems.length === 0 || !district.trim()) { setPreview(null); return; }
        let cancelled = false;
        const timer = setTimeout(async () => {
            setPreviewLoading(true);
            const res = await validateCheckout({
                body: {
                    items: checkoutItems,
                    shippingDistrict: district.trim(),
                    paymentMethod,
                    ...(appliedCoupon ? { couponCode: appliedCoupon } : {}),
                },
            });
            if (cancelled) return;
            setPreviewLoading(false);
            if (res.success && res.data) {
                setPreview(res.data);
            } else {
                setPreview(null);
                // An already-applied coupon that stopped validating (e.g. the
                // subtotal dropped below its minimum after a quantity change)
                // shouldn't silently block checkout — drop it and let the
                // effect re-run without it.
                if (appliedCoupon) setAppliedCoupon(null);
            }
        }, 400);
        return () => { cancelled = true; clearTimeout(timer); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasHydrated, checkoutItemsKey, district, paymentMethod, appliedCoupon]);

    if (hasHydrated && items.length === 0) {
        return (
            <Container className="py-8">
                <EmptyState
                    icon={ShoppingCart}
                    title={t.cart.empty}
                    description={t.cart.emptyHint}
                    children={
                        <LocaleLink
                            href="/"
                            className="inline-flex mt-2 py-2.5 px-6 rounded-md bg-primary hover:bg-primary-dark text-white font-semibold transition-colors"
                        >
                            {t.cart.continueShopping}
                        </LocaleLink>
                    }
                />
            </Container>
        );
    }

    const codEnabled = settings?.codEnabled ?? true;
    const bkashEnabled = settings?.bkashEnabled ?? true;
    const nagadEnabled = settings?.nagadEnabled ?? true;
    const walletNumber = paymentMethod === 'BKASH_MANUAL' ? settings?.bkashNumber : settings?.nagadNumber;
    const districtOptions = settings?.shipping.zones.flatMap((z) => z.districts) ?? [];

    const handleApplyCoupon = async () => {
        const code = couponInput.trim().toUpperCase();
        if (!code) return;
        if (!district.trim()) { toast.error(t.checkout.errorEnterDistrict); return; }
        const res = await tryCatchWrapper(
            validateCheckout,
            { body: { items: checkoutItems, shippingDistrict: district.trim(), paymentMethod, couponCode: code } },
            { toastLoadingMessage: t.checkout.apply, toastSuccessMessage: t.checkout.couponApplied },
        );
        if (res.success && res.data) {
            setPreview(res.data);
            setAppliedCoupon(code);
        }
    };

    const handlePlaceOrder = async () => {
        if (!name.trim() || !BD_PHONE_REGEX.test(phone)) { toast.error(t.checkout.errorNamePhone); return; }
        if (!street.trim() || !district.trim() || !thana.trim()) { toast.error(t.checkout.errorAddress); return; }
        if (checkoutItems.length === 0) { toast.error(t.checkout.errorEmptyCart); return; }
        if (paymentMethod !== 'COD' && (!BD_PHONE_REGEX.test(senderNumber) || trxId.trim().length < 6)) {
            toast.error(t.checkout.errorWalletInfo);
            return;
        }
        if (!agreedToTerms) { toast.error(t.checkout.errorTerms); return; }
        if (!preview) { toast.error(t.checkout.errorCalculating); return; }

        setSubmitting(true);
        const res = await tryCatchWrapper(
            placeOrder,
            {
                body: {
                    customer: { name: name.trim(), phone, ...(email.trim() ? { email: email.trim() } : {}) },
                    shippingAddress: {
                        name: name.trim(), phone, district: district.trim(), thana: thana.trim(),
                        ...(area.trim() ? { area: area.trim() } : {}), street: street.trim(),
                        ...(postcode.trim() ? { postcode: postcode.trim() } : {}),
                    },
                    items: checkoutItems,
                    paymentMethod,
                    ...(paymentMethod !== 'COD' ? { manualPaymentSenderNumber: senderNumber, manualPaymentTrxId: trxId } : {}),
                    ...(appliedCoupon ? { couponCode: appliedCoupon } : {}),
                    idempotencyKey: idempotencyKeyRef.current,
                },
            },
            { toastLoadingMessage: t.checkout.placing },
        );
        setSubmitting(false);
        if (res.success && res.data) {
            useLastOrderStore.getState().setLastOrder(res.data);
            clearCart();
            router.push(localizePath(`/order-success/${res.data.orderNumber}`, locale));
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <LocaleLink href="/cart" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={16} /> {t.checkout.backToCart}
            </LocaleLink>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">{t.checkout.title}</h1>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Left Column: Form */}
                <div className="lg:w-3/5 space-y-8">

                    {/* Customer Info */}
                    <div className="bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-2xl p-6 md:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                </div>
                                <h2 className="text-xl font-bold text-foreground">{t.checkout.customerInfo}</h2>
                            </div>
                            <LocaleLink href="/sign-in" className="text-sm text-primary hover:text-primary-dark hover:underline font-semibold transition-colors">{t.checkout.haveAccount}</LocaleLink>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">{t.checkout.fullName}</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-12 px-4 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" placeholder={t.checkout.fullNamePlaceholder} />
                            </div>
                            <div>
                                <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">{t.checkout.phone}</label>
                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-12 px-4 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" placeholder={t.checkout.phonePlaceholder} />
                            </div>
                            <div>
                                <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">{t.checkout.email}</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-12 px-4 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" placeholder={t.checkout.emailPlaceholder} />
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-2xl p-6 md:p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            </div>
                            <h2 className="text-xl font-bold text-foreground">{t.checkout.deliveryAddress}</h2>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">{t.checkout.fullAddress}</label>
                                <textarea rows={3} value={street} onChange={(e) => setStreet(e.target.value)} className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none" placeholder={t.checkout.fullAddressPlaceholder}></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">{t.checkout.city}</label>
                                    <input
                                        list="checkout-district-list"
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        className="w-full h-12 px-4 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                        placeholder={t.checkout.cityPlaceholder}
                                    />
                                    <datalist id="checkout-district-list">
                                        {districtOptions.map((d) => <option key={d} value={d} />)}
                                    </datalist>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">{t.checkout.zone}</label>
                                    <input type="text" value={thana} onChange={(e) => setThana(e.target.value)} className="w-full h-12 px-4 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" placeholder={t.checkout.zonePlaceholder} />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">Area (optional)</label>
                                    <input type="text" value={area} onChange={(e) => setArea(e.target.value)} className="w-full h-12 px-4 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">Postcode (optional)</label>
                                    <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} className="w-full h-12 px-4 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Fee (server-computed from district, not a user choice) */}
                    <div className="bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-2xl p-6 md:p-8 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                            </div>
                            <h2 className="text-xl font-bold text-foreground">{t.checkout.deliveryMethod}</h2>
                        </div>
                        <span className="font-bold text-lg text-primary">
                            {!district.trim() ? '—' : previewLoading ? <Loader2 size={18} className="animate-spin" /> : preview ? price(preview.deliveryFeeInPoisha) : '—'}
                        </span>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-2xl p-6 md:p-8">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                            </div>
                            <h2 className="text-xl font-bold text-foreground">{t.checkout.paymentMethod}</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                            {codEnabled && (
                                <label className={`relative overflow-hidden flex flex-col items-center justify-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === 'COD' ? 'border-[#10B981] bg-[#10B981]/5 shadow-sm scale-[1.02] z-10' : 'border-gray-200 hover:border-[#10B981]/40 hover:bg-gray-50'}`}>
                                    {paymentMethod === 'COD' && (
                                        <div className="absolute top-2.5 right-2.5 text-[#10B981] animate-in zoom-in duration-200">
                                            <CheckCircle2 size={18} className="fill-[#10B981]/20" />
                                        </div>
                                    )}
                                    <div className={`w-12 h-12 mb-3 rounded-full flex items-center justify-center transition-colors ${paymentMethod === 'COD' ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/20' : 'bg-gray-100 text-gray-500'}`}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                                    </div>
                                    <p className="font-bold text-foreground text-center text-[15px]">{t.checkout.codTitle || 'Cash on Delivery (COD)'}</p>
                                    <p className="text-[12px] text-text-secondary text-center mt-1 leading-tight">{t.checkout.codSub || 'Pay when you receive your order'}</p>
                                    <input type="radio" name="payment" value="COD" className="hidden" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                                </label>
                            )}

                            {bkashEnabled && (
                                <label className={`relative overflow-hidden flex flex-col items-center justify-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === 'BKASH_MANUAL' ? 'border-[#E11471] bg-[#E11471]/5 shadow-sm scale-[1.02] z-10' : 'border-gray-200 hover:border-[#E11471]/40 hover:bg-gray-50'}`}>
                                    {paymentMethod === 'BKASH_MANUAL' && (
                                        <div className="absolute top-2.5 right-2.5 text-[#E11471] animate-in zoom-in duration-200">
                                            <CheckCircle2 size={18} className="fill-[#E11471]/20" />
                                        </div>
                                    )}
                                    <div className={`w-14 h-14 mb-3 rounded-xl flex items-center justify-center transition-colors overflow-hidden ${paymentMethod === 'BKASH_MANUAL' ? 'border-2 border-[#E11471] bg-white shadow-md shadow-[#E11471]/20' : 'bg-white border border-gray-200'}`}>
                                        <Image src={AllImages.bkashLogo} alt="bKash" className="w-full h-full object-contain p-2" />
                                    </div>
                                    <p className="font-bold text-foreground text-center text-[15px]">{t.checkout.bkashTitle || 'bKash'}</p>
                                    <p className="text-[12px] text-text-secondary text-center mt-1 leading-tight">{t.checkout.bkashSub || 'Pay securely with bKash'}</p>
                                    <input type="radio" name="payment" value="BKASH_MANUAL" className="hidden" checked={paymentMethod === 'BKASH_MANUAL'} onChange={() => setPaymentMethod('BKASH_MANUAL')} />
                                </label>
                            )}

                            {nagadEnabled && (
                                <label className={`relative overflow-hidden flex flex-col items-center justify-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === 'NAGAD_MANUAL' ? 'border-[#F37021] bg-[#F37021]/5 shadow-sm scale-[1.02] z-10' : 'border-gray-200 hover:border-[#F37021]/40 hover:bg-gray-50'}`}>
                                    {paymentMethod === 'NAGAD_MANUAL' && (
                                        <div className="absolute top-2.5 right-2.5 text-[#F37021] animate-in zoom-in duration-200">
                                            <CheckCircle2 size={18} className="fill-[#F37021]/20" />
                                        </div>
                                    )}
                                    <div className={`w-14 h-14 mb-3 rounded-xl flex items-center justify-center transition-colors overflow-hidden ${paymentMethod === 'NAGAD_MANUAL' ? 'border-2 border-[#F37021] bg-white shadow-md shadow-[#F37021]/20' : 'bg-white border border-gray-200'}`}>
                                        <Image src={AllImages.nagadLogo} alt="Nagad" className="w-full h-full object-contain p-2" />
                                    </div>
                                    <p className="font-bold text-foreground text-center text-[15px]">{t.checkout.nagadTitle || 'Nagad'}</p>
                                    <p className="text-[12px] text-text-secondary text-center mt-1 leading-tight">{t.checkout.nagadSub || 'Pay securely with Nagad'}</p>
                                    <input type="radio" name="payment" value="NAGAD_MANUAL" className="hidden" checked={paymentMethod === 'NAGAD_MANUAL'} onChange={() => setPaymentMethod('NAGAD_MANUAL')} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Dynamic Payment Instructions */}
                    {(paymentMethod === 'BKASH_MANUAL' || paymentMethod === 'NAGAD_MANUAL') && (
                        <div className="bg-white border border-[#10B981] rounded-lg p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                    </div>
                                    <h3 className="font-bold text-foreground">
                                        {(t.checkout.paymentInstructions || '{method} Payment Instructions').replace('{method}', paymentMethod === 'BKASH_MANUAL' ? 'bKash' : 'Nagad')}
                                    </h3>
                                </div>
                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${paymentMethod === 'BKASH_MANUAL' ? 'bg-[#E11471]/10 text-[#E11471]' : 'bg-[#F37021]/10 text-[#F37021]'}`}>
                                    {t.checkout.personalSendMoney || 'Personal (Send Money)'}
                                </span>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#10B981]/5 border border-[#10B981]/30 rounded-lg mb-6 gap-4">
                                <div>
                                    <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                                        {(t.checkout.sendMoneyTo || 'SEND MONEY TO THIS {method} NUMBER').replace('{method}', paymentMethod === 'BKASH_MANUAL' ? 'BKASH' : 'NAGAD')}
                                    </p>
                                    <p className="text-2xl font-bold text-[#10B981]">{walletNumber || '—'}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-center gap-1.5 mb-3 text-text-secondary font-semibold text-sm">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                                    {t.checkout.howToPay || 'How to pay:'}
                                </div>
                                <ul className="space-y-2 text-[13px] text-text-secondary">
                                    <li>{(t.checkout.step1 || '1. Open the {method} app or dial {dial}.').replace('{method}', paymentMethod === 'BKASH_MANUAL' ? 'bKash' : 'Nagad').replace('{dial}', paymentMethod === 'BKASH_MANUAL' ? '*247#' : '*167#')}</li>
                                    <li>{t.checkout.step2 || "2. Select 'Send Money'."}</li>
                                    <li>{t.checkout.step3 || "3. Send the exact amount to the number above."}</li>
                                    <li>{t.checkout.step4 || "4. Copy the Transaction ID (TrxID) from the confirmation."}</li>
                                    <li>{t.checkout.step5 || "5. Enter your number and the TrxID in the form below."}</li>
                                </ul>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6 border-t border-gray-100">
                                <div>
                                    <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-2">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                                        {(t.checkout.yourNumber || 'Your {method} Number').replace('{method}', paymentMethod === 'BKASH_MANUAL' ? 'bKash' : 'Nagad')}
                                    </label>
                                    <input type="text" value={senderNumber} onChange={(e) => setSenderNumber(e.target.value)} className="w-full h-11 px-3 border border-border rounded-md outline-none focus:border-primary transition-colors text-sm" placeholder={t.checkout.yourNumberPlaceholder || '017XXXXXXXX'} />
                                </div>
                                <div>
                                    <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-2">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                        {t.checkout.trxIdLabel || 'Transaction ID (TrxID)'}
                                    </label>
                                    <input type="text" value={trxId} onChange={(e) => setTrxId(e.target.value)} className="w-full h-11 px-3 border border-border rounded-md outline-none focus:border-primary transition-colors text-sm" placeholder={t.checkout.trxIdPlaceholder || 'E.G. 9J7A6X8Y2Z'} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:w-2/5">
                    <div className="bg-white border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl p-6 md:p-8 sticky top-32">
                        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                            {t.checkout.orderReview}
                        </h2>

                        {/* Items */}
                        <div className="space-y-4 mb-6 pb-6 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
                            {items.map((item) => (
                                <div key={`${item.productId}-${item.variantId ?? ""}`} className="flex gap-4 items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                    <div className="w-16 h-16 bg-white rounded-lg border border-gray-100 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-grow flex flex-col justify-center">
                                        <h4 className="text-[13px] font-bold line-clamp-2 leading-snug text-foreground">{item.name}</h4>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-[11px] font-semibold text-text-secondary bg-gray-200/50 px-2 py-0.5 rounded">
                                                {item.variantName ? `${item.variantName} x ${item.quantity}` : `x ${item.quantity}`}
                                            </p>
                                            <span className="text-primary font-bold text-[14px]">{formatPrice(item.price * item.quantity, locale, t.common.currency)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Coupon */}
                        <div className="mb-6">
                            <label className="block text-[13px] font-semibold text-text-secondary mb-2">{t.checkout.coupon}</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponInput}
                                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                    className="flex-grow h-12 px-4 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all uppercase text-sm font-medium tracking-wide"
                                    placeholder="ENTER CODE"
                                />
                                <button type="button" onClick={handleApplyCoupon} className="px-6 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm transition-colors shadow-md">{t.checkout.apply}</button>
                            </div>
                            {appliedCoupon && preview?.coupon && (
                                <p className="text-xs text-success font-semibold mt-2">{preview.coupon.code} applied</p>
                            )}
                        </div>

                        {/* Calculation */}
                        <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-5 space-y-3.5 mb-6 text-[14px]">
                            <div className="flex justify-between font-medium text-text-secondary">
                                <span>{t.checkout.subtotal}</span>
                                <span className="text-foreground">{preview ? price(preview.subtotalInPoisha) : '—'}</span>
                            </div>
                            <div className="flex justify-between font-medium text-text-secondary">
                                <span>{t.checkout.shipping}</span>
                                <span className="text-foreground">{preview ? price(preview.deliveryFeeInPoisha) : '—'}</span>
                            </div>
                            <div className="flex justify-between font-medium text-primary">
                                <span>{t.checkout.discount}</span>
                                <span>{preview ? price(preview.discountInPoisha) : '—'}</span>
                            </div>

                            <div className="flex justify-between items-center text-lg font-bold text-foreground pt-3.5 border-t border-gray-200 mt-2">
                                <span>{t.checkout.total}</span>
                                <span className="text-primary text-2xl drop-shadow-sm">{preview ? price(preview.grandTotalInPoisha) : '—'}</span>
                            </div>
                        </div>

                        <label className="flex items-start gap-3 mb-6 cursor-pointer p-4 bg-primary/5 rounded-xl border border-primary/20">
                            <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                            <span className="text-[12px] text-text-secondary leading-snug">
                                {t.checkout.termsStart} <LocaleLink href="/terms" className="text-primary hover:underline font-semibold">{t.checkout.terms}</LocaleLink> {t.checkout.and} <LocaleLink href="/privacy" className="text-primary hover:underline font-semibold">{t.checkout.privacy}</LocaleLink>.
                            </span>
                        </label>

                        <button
                            type="button"
                            onClick={handlePlaceOrder}
                            disabled={submitting || previewLoading || !preview}
                            className="w-full h-14 bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {submitting ? <Loader2 size={20} className="animate-spin" /> : (
                                <>
                                    {t.checkout.placeOrder}
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutClient;
