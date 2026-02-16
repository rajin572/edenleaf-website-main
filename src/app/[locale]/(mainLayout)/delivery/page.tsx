import React from 'react';

export default function DeliveryInformationPage() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Delivery Information</h1>

            <div className="prose prose-orange max-w-none text-text-secondary space-y-6">
                <p>
                    We currently deliver across Bangladesh with Cash on Delivery as our default payment method,
                    so you only pay once your order arrives at your doorstep.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">1. Delivery Zones & Charges</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border border-border rounded-lg overflow-hidden">
                        <thead className="bg-muted text-foreground text-sm">
                            <tr>
                                <th className="p-3 font-semibold">Zone</th>
                                <th className="p-3 font-semibold">Delivery Time</th>
                                <th className="p-3 font-semibold">Charge</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-border">
                            <tr>
                                <td className="p-3">Inside Dhaka</td>
                                <td className="p-3">24–48 hours</td>
                                <td className="p-3">৳60</td>
                            </tr>
                            <tr>
                                <td className="p-3">Outside Dhaka</td>
                                <td className="p-3">3–5 business days</td>
                                <td className="p-3">৳120</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">2. Order Processing</h2>
                <p>
                    Orders are confirmed by phone before they are packed and handed over to our courier partner.
                    You will receive a call to verify your order details, especially for larger orders.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">3. Cash on Delivery</h2>
                <p>
                    Pay the courier in cash when your package arrives. If you prefer, you may also send payment
                    manually via bKash or Nagad before delivery and share the Transaction ID at checkout.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">4. Tracking Your Order</h2>
                <p>
                    Once your order is shipped, you can track its status any time from the &quot;My Orders&quot; section
                    of your account, or via the guest order tracking page using your Order ID.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">5. Failed Deliveries</h2>
                <p>
                    If a delivery attempt fails because you were unavailable or unreachable, our courier partner
                    will attempt to contact you to reschedule. Repeated failed deliveries may result in the order
                    being returned and cancelled.
                </p>
            </div>
        </div>
    );
}
