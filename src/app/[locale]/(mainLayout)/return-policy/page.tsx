import React from 'react';
import LocaleLink from '@/components/i18n/LocaleLink';

export default function ReturnPolicyPage() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Return & Refund Policy</h1>

            <div className="prose prose-orange max-w-none text-text-secondary space-y-6">
                <p>Last updated: August 19, 2026</p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">1. Eligibility for Returns</h2>
                <p>
                    Since Ednleaf deals primarily with food and natural products, we have strict quality and hygiene protocols.
                    Returns are only accepted under the following conditions:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>The product received is expired or damaged during transit.</li>
                    <li>The product delivered does not match your order.</li>
                    <li>The package seal is broken upon arrival.</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">2. Return Window</h2>
                <p>
                    You must initiate a return request within <strong>3 days</strong> of receiving your delivery.
                    Requests made after this timeframe will not be eligible for a return or refund.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">3. How to Initiate a Return</h2>
                <p>
                    To request a return:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>Take a clear photo or video of the damaged or incorrect product.</li>
                    <li>Contact our support team via WhatsApp or the <LocaleLink href="/contact" className="underline">contact page</LocaleLink>.</li>
                    <li>Provide your Order ID and the proof of damage/incorrect item.</li>
                </ol>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">4. Refund Process</h2>
                <p>
                    Once your return request is approved, we will either send a replacement product at no additional
                    delivery cost or initiate a full refund. Refunds to bKash/Nagad or bank accounts are processed
                    within 7-10 business days.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">5. Non-returnable Items</h2>
                <p>
                    Products that have been opened, used, or tampered with by the customer are not eligible for return.
                    Products purchased during a clearance sale are final and cannot be returned unless damaged upon delivery.
                </p>
            </div>
        </div>
    );
}
