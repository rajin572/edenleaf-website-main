import LocaleLink from '@/components/i18n/LocaleLink';
import { Package, Heart, Ticket, ShieldCheck, ArrowRight } from 'lucide-react';
import OrderStatusBadge from '@/components/dashboard/OrderStatusBadge';

const STATS = [
    { label: 'Total Orders', value: '12', icon: Package },
    { label: 'Wishlist Items', value: '5', icon: Heart },
    { label: 'Available Coupons', value: '2', icon: Ticket },
    { label: 'Account Status', value: 'Active', icon: ShieldCheck },
];

const RECENT_ORDERS = [
    { id: 'AST-1024', date: 'Aug 18, 2026', total: '৳1,250', status: 'Processing' },
    { id: 'AST-0998', date: 'Aug 10, 2026', total: '৳3,400', status: 'Delivered' },
];

export default function DashboardOverviewPage() {
    return (
        <div className="space-y-6">
            <div className="bg-linear-to-r from-primary to-primary-dark rounded-2xl p-6 md:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Hello, Rahim Uddin 👋</h1>
                    <p className="text-white/80 text-sm">Here&apos;s what&apos;s happening with your account today.</p>
                </div>
                <LocaleLink
                    href="/"
                    className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary rounded-lg font-bold text-sm hover:bg-white/90 transition-colors"
                >
                    Continue Shopping <ArrowRight size={16} />
                </LocaleLink>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
                            <Icon size={22} />
                        </div>
                        <h3 className="text-2xl font-bold">{value}</h3>
                        <p className="text-sm text-text-secondary">{label}</p>
                    </div>
                ))}
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Recent Orders</h2>
                    <LocaleLink href="/dashboard/orders" className="text-sm font-semibold text-primary hover:underline">
                        View all
                    </LocaleLink>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50/50 text-text-secondary">
                                <tr>
                                    <th className="p-4 font-medium">Order ID</th>
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium">Total</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {RECENT_ORDERS.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 font-semibold">#{order.id}</td>
                                        <td className="p-4 text-text-secondary">{order.date}</td>
                                        <td className="p-4 font-semibold">{order.total}</td>
                                        <td className="p-4"><OrderStatusBadge status={order.status} /></td>
                                        <td className="p-4 text-right">
                                            <LocaleLink href={`/dashboard/orders/${order.id}`} className="text-primary hover:underline font-medium">
                                                View Details
                                            </LocaleLink>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
