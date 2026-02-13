import React from 'react';
import { notFound, redirect } from 'next/navigation';
import LocaleLink from '@/components/i18n/LocaleLink';
import { ArrowLeft, Package, Truck, CheckCircle2, MapPin, CreditCard, XCircle, Undo2, Download } from 'lucide-react';
import OrderStatusBadge from '@/components/dashboard/OrderStatusBadge';
import { getCurrentUser } from '@/service/AuthService/AuthServiceAPi';
import { getOrderById } from '@/service/OrderService/orderApi';
import { getDictionary } from '@/i18n/dictionaries';
import { INTL_LOCALES, isLocale } from '@/i18n/config';
import { formatPriceFromPoisha } from '@/utils/money';
import type { TOrderStatus } from '@/types';

const HAPPY_STEPS: { key: TOrderStatus; label: string; icon: typeof Package }[] = [
    { key: 'CONFIRMED', label: 'Confirmed', icon: Package },
    { key: 'PROCESSING', label: 'Processing', icon: Package },
    { key: 'PACKED', label: 'Packed', icon: Package },
    { key: 'SHIPPED', label: 'Shipped', icon: Truck },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
];

type OrderDetailPageParams = { params: Promise<{ locale: string; id: string }> };

export default async function OrderDetailPage({ params }: OrderDetailPageParams) {
    const { locale, id } = await params;
    if (!isLocale(locale)) redirect('/');

    const me = await getCurrentUser();
    if (!me?.success) redirect(`/${locale}/sign-in`);

    const order = await getOrderById(id);
    if (!order) notFound();

    const t = await getDictionary();
    const price = (poisha: number) => formatPriceFromPoisha(poisha, locale, t.common.currency);
    const dateFmt = new Intl.DateTimeFormat(INTL_LOCALES[locale], { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

    const currentStepIndex = HAPPY_STEPS.findIndex((s) => s.key === order.status);
    const isDiverted = order.status === 'CANCELLED' || order.status === 'DELIVERY_FAILED' || order.status === 'RETURNED_TO_ORIGIN';
    const divertedEvent = isDiverted ? [...order.statusHistory].reverse().find((e) => e.status === order.status) : undefined;

    const address = order.shippingAddress;

    return (
        <div>
            <LocaleLink href="/dashboard/orders" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={16} /> Back to Orders
            </LocaleLink>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
                    <p className="text-sm text-text-secondary mt-1">Placed on {dateFmt.format(new Date(order.createdAt))}</p>
                </div>
                <OrderStatusBadge status={order.status} />
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 mb-6">
                {isDiverted ? (
                    <div className="flex items-center gap-3 text-sm">
                        {order.status === 'CANCELLED' ? <XCircle className="text-destructive" size={20} /> : <Undo2 className="text-orange-500" size={20} />}
                        <div>
                            <p className="font-semibold text-foreground">
                                {order.status === 'CANCELLED' ? 'Order Cancelled' : order.status === 'DELIVERY_FAILED' ? 'Delivery Failed' : 'Returned to Origin'}
                            </p>
                            {divertedEvent?.note && <p className="text-text-secondary text-xs mt-0.5">{divertedEvent.note}</p>}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center">
                        {HAPPY_STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isDone = index <= currentStepIndex;
                            return (
                                <React.Fragment key={step.key}>
                                    <div className="flex flex-col items-center gap-2 shrink-0">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDone ? 'bg-primary text-white' : 'bg-muted text-text-muted'}`}>
                                            <Icon size={18} />
                                        </div>
                                        <span className={`text-[11px] font-medium text-center ${isDone ? 'text-foreground' : 'text-text-muted'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                    {index < HAPPY_STEPS.length - 1 && (
                                        <div className={`flex-1 h-0.5 mb-5 ${index < currentStepIndex ? 'bg-primary' : 'bg-muted'}`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Items */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                    <div className="p-4 border-b border-gray-100 font-bold bg-gray-50/50">Items</div>
                    <div className="divide-y divide-gray-100">
                        {order.items.map((item) => (
                            <div key={item.variant} className="p-4 flex gap-4 items-center">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm line-clamp-2">{item.productName} — {item.variantName}</p>
                                    <p className="text-xs text-text-secondary mt-1">{item.unit} × {item.quantity}</p>
                                </div>
                                <span className="font-bold text-primary shrink-0">{price(item.lineTotalInPoisha)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary + details */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 space-y-3 text-sm">
                        <div className="flex justify-between text-text-secondary">
                            <span>Subtotal</span>
                            <span className="text-foreground">{price(order.subtotalInPoisha)}</span>
                        </div>
                        <div className="flex justify-between text-text-secondary">
                            <span>Discount</span>
                            <span className="text-foreground">{price(order.discountInPoisha)}</span>
                        </div>
                        <div className="flex justify-between text-text-secondary">
                            <span>Delivery Fee</span>
                            <span className="text-foreground">{price(order.deliveryFeeInPoisha)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base pt-3 border-t border-gray-100">
                            <span>Total</span>
                            <span className="text-primary">{price(order.grandTotalInPoisha)}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 space-y-4 text-sm">
                        <div className="flex gap-3">
                            <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold">{order.customerSnapshot.name}, {order.customerSnapshot.phone}</p>
                                <p className="text-text-secondary">{[address.street, address.area, address.thana, address.district, address.postcode].filter(Boolean).join(', ')}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <CreditCard size={18} className="text-primary shrink-0 mt-0.5" />
                            <p className="font-semibold">
                                {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : order.paymentMethod === 'BKASH_MANUAL' ? 'bKash (Manual)' : 'Nagad (Manual)'}
                            </p>
                        </div>
                    </div>

                    <a
                        href={`/api/orders/${order._id}/invoice`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 h-11 bg-white border border-border rounded-xl font-semibold text-sm text-foreground hover:border-primary/50 transition-colors"
                    >
                        <Download size={16} /> Download Invoice
                    </a>
                </div>
            </div>
        </div>
    );
}
