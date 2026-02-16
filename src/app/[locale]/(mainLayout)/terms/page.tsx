import React from 'react';

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Terms & Conditions</h1>

            <div className="prose prose-orange max-w-none text-text-secondary space-y-6">
                <p>Last updated: August 19, 2026</p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">1. Introduction</h2>
                <p>
                    Welcome to Ednleaf. These Terms & Conditions govern your use of the Ednleaf website
                    and form a binding contractual agreement between you, the user of the website, and us, Ednleaf.
                </p>
                <p>
                    By using our website, you acknowledge that you have read, understood, and agreed to be bound by these terms.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">2. Products and Pricing</h2>
                <p>
                    All products listed on Ednleaf are subject to availability. We strive to display product colors, weights,
                    and qualities as accurately as possible, but cannot guarantee exact matches due to the natural origin of our items.
                </p>
                <p>
                    Prices are subject to change without prior notice. However, once an order is placed and confirmed, the price
                    remains locked for that specific transaction.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">3. Delivery Policy</h2>
                <p>
                    We deliver across Bangladesh. Delivery times mentioned are approximate and may vary due to external factors
                    such as weather, strikes, or courier delays. Ednleaf is not liable for delayed deliveries caused by third-party logistics.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">4. Return and Refund</h2>
                <p>
                    Customers can return products within 3 days of delivery if the items are damaged, expired, or incorrect.
                    The products must be unused and in their original packaging. Refunds are processed within 7-10 business days
                    after the returned product is verified.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">5. User Accounts</h2>
                <p>
                    When creating an account, you must provide accurate and complete information. You are solely responsible for
                    maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                </p>
            </div>
        </div>
    );
}
