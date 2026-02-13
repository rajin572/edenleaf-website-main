import { redirect } from "next/navigation";
import LocaleLink from '@/components/i18n/LocaleLink';
import OrderStatusBadge from '@/components/dashboard/OrderStatusBadge';
import { getCurrentUser } from "@/service/AuthService/AuthServiceAPi";
import { getMyOrders } from "@/service/OrderService/orderApi";
import { getDictionary } from "@/i18n/dictionaries";
import { INTL_LOCALES, isLocale } from "@/i18n/config";
import { formatPriceFromPoisha } from "@/utils/money";

type OrdersPageParams = { params: Promise<{ locale: string }> };

export default async function OrdersPage({ params }: OrdersPageParams) {
    const { locale } = await params;
    if (!isLocale(locale)) redirect("/");

    const me = await getCurrentUser();
    if (!me?.success) redirect(`/${locale}/sign-in`);

    const t = await getDictionary();
    const orders = (await getMyOrders({ limit: 20 })) ?? { data: [], meta: { page: 1, limit: 20, total: 0, totalPage: 0 } };
    const price = (poisha: number) => formatPriceFromPoisha(poisha, locale, t.common.currency);
    const dateFmt = new Intl.DateTimeFormat(INTL_LOCALES[locale], { year: "numeric", month: "short", day: "numeric" });

    return (
        <div>
            <h1 className="text-2xl font-bold mb-1">My Orders</h1>
            <p className="text-sm text-text-secondary mb-6">Track and review everything you&apos;ve ordered.</p>

            {orders.data.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-10 text-center text-text-secondary">
                    You haven&apos;t placed any orders yet.
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50/50 text-text-secondary">
                                <tr>
                                    <th className="p-4 font-medium">Order ID</th>
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium">Items</th>
                                    <th className="p-4 font-medium">Total</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.data.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 font-semibold text-foreground">#{order.orderNumber}</td>
                                        <td className="p-4 text-text-secondary">{dateFmt.format(new Date(order.createdAt))}</td>
                                        <td className="p-4 text-text-secondary">{order.items.length} Items</td>
                                        <td className="p-4 font-semibold text-foreground">{price(order.grandTotalInPoisha)}</td>
                                        <td className="p-4"><OrderStatusBadge status={order.status} /></td>
                                        <td className="p-4 text-right">
                                            <LocaleLink href={`/dashboard/orders/${order._id}`} className="text-primary hover:underline font-medium px-3 py-1.5 border border-primary/20 rounded-md hover:bg-primary/5 transition-colors">
                                                View Details
                                            </LocaleLink>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
