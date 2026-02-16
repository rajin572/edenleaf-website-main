import React from 'react';
import LocaleLink from '@/components/i18n/LocaleLink';

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>

            <div className="prose prose-orange max-w-none text-text-secondary space-y-6">
                <p>Last updated: August 19, 2026</p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">1. Information We Collect</h2>
                <p>
                    At Ednleaf, we collect personal information that you provide to us when creating an account,
                    placing an order, or contacting our customer service. This includes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Name and Contact Information (Email, Phone Number)</li>
                    <li>Delivery and Billing Address</li>
                    <li>Payment details (processed securely via our payment gateways)</li>
                    <li>Order history and preferences</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">2. How We Use Your Information</h2>
                <p>
                    The information we collect is strictly used to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Process and fulfill your orders efficiently.</li>
                    <li>Communicate with you regarding delivery status, offers, and support.</li>
                    <li>Improve our website, product offerings, and customer experience.</li>
                    <li>Prevent fraudulent activities and ensure platform security.</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">3. Data Sharing and Protection</h2>
                <p>
                    We do not sell, rent, or trade your personal information to third parties. We only share necessary
                    information with trusted third-party service providers (like courier companies and payment processors)
                    solely for the purpose of completing your transaction.
                </p>
                <p>
                    We implement industry-standard security measures to protect your data against unauthorized access,
                    alteration, or disclosure.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">4. Cookies</h2>
                <p>
                    Our website uses cookies to enhance your browsing experience, remember your cart items, and analyze
                    site traffic. You can choose to disable cookies through your browser settings, though this may affect
                    some functionalities of the site.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">5. Contact Us</h2>
                <p>
                    If you have any questions or concerns regarding this Privacy Policy, please use our <LocaleLink href="/contact" className="underline">contact page</LocaleLink> or call us at:
                    <br />
                    <strong>Phone:</strong> +880 1712345678
                </p>
            </div>
        </div>
    );
}
