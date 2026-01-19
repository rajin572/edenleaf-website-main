
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, Truck, RefreshCcw, User, CreditCard, XCircle, FileText } from "lucide-react";
import Container from "../ui/CustomUi/Container";
import Accordion from "../ui/CustomUi/Accordion";
import { Button } from "../ui/button";
import { useT } from "@/components/i18n/DictionaryProvider";
import { LucideIcon } from "lucide-react";

const categoryIcons: Record<string, LucideIcon> = {
    "top-queries": Star,
    "terms": FileText,
    "shipping": Truck,
    "cancellations": XCircle,
    "returns": RefreshCcw,
    "account": User,
    "payments": CreditCard,
};

const categoryKeys = [
    "top-queries",
    "terms",
    "shipping",
    "cancellations",
    "returns",
    "account",
    "payments",
];

const FAQSection = () => {
    const t = useT();
    const [activeCategory, setActiveCategory] = useState("top-queries");

    const isBn = t.faq?.title === "à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦œà¦¿à¦œà§à¦žà¦¾à¦¸à¦¾ (FAQ)";

    // Fallback data if translation is loading/missing (Bilingual)
    const defaultFaqData: Record<string, { q: string; a: string }[]> = isBn ? {
        "top-queries": [
            { q: "à¦Ÿà§à¦°à¦¾à¦‡ à¦à¦¨à§à¦¡ à¦¬à¦¾à¦‡ à¦¸à¦¾à¦°à§à¦­à¦¿à¦¸ à¦•à§€?", a: "à¦à¦‡ à¦¸à¦¾à¦°à§à¦­à¦¿à¦¸à§‡à¦° à¦®à¦¾à¦§à§à¦¯à¦®à§‡ à¦†à¦ªà¦¨à¦¿ à¦ªà§à¦°à§‹à¦¡à¦¾à¦•à§à¦Ÿà¦Ÿà¦¿ à¦¡à§‡à¦²à¦¿à¦­à¦¾à¦°à¦¿à¦° à¦¸à¦®à§Ÿ à¦¯à¦¾à¦šà¦¾à¦‡ à¦•à¦°à§‡ à¦¨à¦¿à¦¤à§‡ à¦ªà¦¾à¦°à¦¬à§‡à¦¨ à¦à¦¬à¦‚ à¦ªà¦›à¦¨à§à¦¦ à¦¹à¦²à§‡ à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦•à¦°à¦¤à§‡ à¦ªà¦¾à¦°à¦¬à§‡à¦¨à¥¤" },
            { q: "à¦à¦•à¦‡ à¦ªà¦£à§à¦¯à§‡à¦° à¦¦à¦¾à¦® à¦­à¦¿à¦¨à§à¦¨ à¦•à§‡à¦¨?", a: "à¦¬à¦¿à¦­à¦¿à¦¨à§à¦¨ à¦¸à§‡à¦²à¦¾à¦° à¦¤à¦¾à¦¦à§‡à¦° à¦ªà§à¦°à¦¾à¦‡à¦¸à¦¿à¦‚ à¦ªà¦²à¦¿à¦¸à¦¿à¦° à¦“à¦ªà¦° à¦­à¦¿à¦¤à§à¦¤à¦¿ à¦•à¦°à§‡ à¦¦à¦¾à¦® à¦ªà¦°à¦¿à¦¬à¦°à§à¦¤à¦¨ à¦•à¦°à¦¤à§‡ à¦ªà¦¾à¦°à§‡à¦¨à¥¤" },
            { q: "à¦†à¦®à¦¿ à¦•à§€à¦­à¦¾à¦¬à§‡ à¦†à¦®à¦¾à¦° à¦…à¦°à§à¦¡à¦¾à¦° à¦•à§à¦¯à¦¾à¦¨à§à¦¸à§‡à¦² à¦•à¦°à¦¬à§‹?", a: "à¦ªà§à¦°à§‹à¦¡à¦¾à¦•à§à¦Ÿ à¦¡à¦¿à¦¸à¦ªà§à¦¯à¦¾à¦š à¦¹à¦“à§Ÿà¦¾à¦° à¦†à¦—à§‡ 'à¦†à¦®à¦¾à¦° à¦…à¦°à§à¦¡à¦¾à¦°' à¦¸à§‡à¦•à¦¶à¦¨ à¦¥à§‡à¦•à§‡ à¦†à¦ªà¦¨à¦¿ à¦…à¦°à§à¦¡à¦¾à¦° à¦•à§à¦¯à¦¾à¦¨à§à¦¸à§‡à¦² à¦•à¦°à¦¤à§‡ à¦ªà¦¾à¦°à¦¬à§‡à¦¨à¥¤" }
        ],
        "shipping": [
            { q: "à¦¡à§‡à¦²à¦¿à¦­à¦¾à¦°à¦¿ à¦ªà§‡à¦¤à§‡ à¦•à¦¤à¦¦à¦¿à¦¨ à¦¸à¦®à§Ÿ à¦²à¦¾à¦—à§‡?", a: "à¦¸à¦¾à¦§à¦¾à¦°à¦£à¦¤ à¦¶à¦¹à¦°à§‡à¦° à¦­à§‡à¦¤à¦°à§‡ à§§-à§¨ à¦¦à¦¿à¦¨ à¦à¦¬à¦‚ à¦¬à¦¾à¦‡à¦°à§‡ à§©-à§« à¦¦à¦¿à¦¨ à¦¸à¦®à§Ÿ à¦²à¦¾à¦—à§‡à¥¤" },
            { q: "à¦†à¦®à¦¿ à¦•à§€à¦­à¦¾à¦¬à§‡ à¦†à¦®à¦¾à¦° à¦…à¦°à§à¦¡à¦¾à¦° à¦Ÿà§à¦°à§à¦¯à¦¾à¦• à¦•à¦°à¦¬à§‹?", a: "à¦†à¦ªà¦¨à¦¿ 'à¦†à¦®à¦¾à¦° à¦…à¦°à§à¦¡à¦¾à¦°' à¦¸à§‡à¦•à¦¶à¦¨ à¦¥à§‡à¦•à§‡ à¦†à¦ªà¦¨à¦¾à¦° à¦…à¦°à§à¦¡à¦¾à¦°à§‡à¦° à¦¬à¦°à§à¦¤à¦®à¦¾à¦¨ à¦¸à§à¦Ÿà§à¦¯à¦¾à¦Ÿà¦¾à¦¸ à¦œà¦¾à¦¨à¦¤à§‡ à¦ªà¦¾à¦°à¦¬à§‡à¦¨à¥¤" }
        ],
        "returns": [
            { q: "à¦ªà§à¦°à§‹à¦¡à¦¾à¦•à§à¦Ÿà§‡ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¥à¦¾à¦•à¦²à§‡ à¦•à¦¿ à¦°à¦¿à¦Ÿà¦¾à¦°à§à¦¨ à¦•à¦°à¦¾ à¦¯à¦¾à§Ÿ?", a: "à¦¹à§à¦¯à¦¾à¦, à¦¡à§‡à¦²à¦¿à¦­à¦¾à¦°à¦¿ à¦ªà¦¾à¦“à§Ÿà¦¾à¦° à§­ à¦¦à¦¿à¦¨à§‡à¦° à¦®à¦§à§à¦¯à§‡ à¦°à¦¿à¦Ÿà¦¾à¦°à§à¦¨ à¦°à¦¿à¦•à§‹à§Ÿà§‡à¦¸à§à¦Ÿ à¦•à¦°à¦¾ à¦¯à¦¾à¦¬à§‡à¥¤" },
            { q: "à¦†à¦®à¦¿ à¦•à§€à¦­à¦¾à¦¬à§‡ à¦°à¦¿à¦Ÿà¦¾à¦°à§à¦¨ à¦°à¦¿à¦•à§‹à§Ÿà§‡à¦¸à§à¦Ÿ à¦¤à§ˆà¦°à¦¿ à¦•à¦°à¦¬à§‹?", a: "'à¦†à¦®à¦¾à¦° à¦…à¦°à§à¦¡à¦¾à¦°' à¦ à¦—à¦¿à§Ÿà§‡ à¦†à¦‡à¦Ÿà§‡à¦® à¦¨à¦¿à¦°à§à¦¬à¦¾à¦šà¦¨ à¦•à¦°à§‡ 'à¦°à¦¿à¦Ÿà¦¾à¦°à§à¦¨/à¦à¦•à§à¦¸à¦šà§‡à¦žà§à¦œ' à¦ à¦•à§à¦²à¦¿à¦• à¦•à¦°à§à¦¨à¥¤" }
        ],
        "payments": [
            { q: "à¦•à§€ à¦•à§€ à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦®à§‡à¦¥à¦¡ à¦—à§à¦°à¦¹à¦£ à¦•à¦°à¦¾ à¦¹à§Ÿ?", a: "à¦†à¦®à¦°à¦¾ à¦•à§à¦¯à¦¾à¦¶ à¦…à¦¨ à¦¡à§‡à¦²à¦¿à¦­à¦¾à¦°à¦¿, à¦¬à¦¿à¦•à¦¾à¦¶, à¦¨à¦—à¦¦ à¦à¦¬à¦‚ à¦•à¦¾à¦°à§à¦¡ à¦—à§à¦°à¦¹à¦£ à¦•à¦°à§‡ à¦¥à¦¾à¦•à¦¿à¥¤" }
        ]
    } : {
        "top-queries": [
            { q: "What is Try and Buy Service?", a: "Try and Buy is a service that allows you to try on your purchases at home and pay for only what you like." },
            { q: "Why are there different prices for the same product? Is it legal?", a: "Different sellers may offer the same product at different prices based on their pricing strategy." },
            { q: "How do I cancel the order, I have placed?", a: "You can cancel your order from the 'My Orders' section before it gets dispatched." }
        ],
        "shipping": [
            { q: "How long does delivery take?", a: "Usually it takes 1-2 days inside the city and 3-5 working days outside." },
            { q: "How can I track my order?", a: "You can track your order status in the 'My Orders' section." }
        ],
        "returns": [
            { q: "Can I return a product if there is an issue?", a: "Yes, you can initiate a return within 7 days of delivery." },
            { q: "How do I create a Return Request?", a: "Go to 'My Orders', select the item, and click 'Return/Exchange'." }
        ],
        "payments": [
            { q: "What payment methods are accepted?", a: "We accept Cash on Delivery, bKash, Nagad, and all major cards." }
        ]
    };

    const activeFaqs = t.faq?.questions?.[activeCategory as keyof typeof t.faq.questions] || defaultFaqData[activeCategory] || [];
    
    // Default categories if missing (Bilingual)
    const categoriesMap = t.faq?.categories || (isBn ? {
        "top-queries": "à¦¸à¦¬à¦šà§‡à¦¯à¦¼à§‡ à¦¬à§‡à¦¶à¦¿ à¦œà¦¿à¦œà§à¦žà¦¾à¦¸à¦¿à¦¤",
        "terms": "à¦¶à¦°à§à¦¤à¦¾à¦¬à¦²à§€",
        "shipping": "à¦¶à¦¿à¦ªà¦¿à¦‚, à¦Ÿà§à¦°à§à¦¯à¦¾à¦•à¦¿à¦‚ à¦“ à¦¡à§‡à¦²à¦¿à¦­à¦¾à¦°à¦¿",
        "cancellations": "à¦•à§à¦¯à¦¾à¦¨à§à¦¸à§‡à¦²à§‡à¦¶à¦¨ à¦à¦¬à¦‚ à¦ªà¦°à¦¿à¦¬à¦°à§à¦¤à¦¨",
        "returns": "à¦°à¦¿à¦Ÿà¦¾à¦°à§à¦¨ à¦à¦¬à¦‚ à¦à¦•à§à¦¸à¦šà§‡à¦žà§à¦œ",
        "account": "à¦¸à¦¾à¦‡à¦¨ à¦†à¦ª à¦à¦¬à¦‚ à¦²à¦—à¦‡à¦¨",
        "payments": "à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ"
    } : {
        "top-queries": "Top Queries",
        "terms": "Terms and Conditions",
        "shipping": "Shipping, Order Tracking & Delivery",
        "cancellations": "Cancellations and Modifications",
        "returns": "Returns and Exchange",
        "account": "Sign Up and Login",
        "payments": "Payments"
    });

    const currentCategoryLabel = (categoriesMap as Record<string, string>)[activeCategory] || "Top Queries";

    return (
        <section className="py-8 md:py-12 bg-background relative min-h-screen">
            <Container>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                        {t.faq?.title || (isBn ? "à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦œà¦¿à¦œà§à¦žà¦¾à¦¸à¦¾ (FAQ)" : "Frequently Asked Questions")}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{t.faq?.stillNeedHelp || (isBn ? "à¦à¦–à¦¨à¦“ à¦¸à¦¾à¦¹à¦¾à¦¯à§à¦¯ à¦ªà§à¦°à§Ÿà§‹à¦œà¦¨?" : "Still need help?")}</span>
                        <Link href="/contact">
                            <Button variant="outline" size="sm" className="font-semibold text-primary hover:text-primary hover:bg-primary/5">
                                {t.faq?.contactUs || (isBn ? "à¦¯à§‹à¦—à¦¾à¦¯à§‹à¦— à¦•à¦°à§à¦¨" : "CONTACT US")}
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Main Divider */}
                <div className="h-px bg-border w-full mb-8"></div>

                {/* Content Grid */}
                <div className="flex flex-col lg:flex-row gap-10 items-start">
                    {/* Sidebar */}
                    <div className="w-full lg:w-1/4 shrink-0 flex flex-col border-r border-border/50 pr-4">
                        {categoryKeys.map((catKey) => {
                            const Icon = categoryIcons[catKey];
                            const isActive = activeCategory === catKey;
                            const label = (categoriesMap as Record<string, string>)[catKey] || catKey;
                            return (
                                <button
                                    key={catKey}
                                    onClick={() => setActiveCategory(catKey)}
                                    className={`relative flex items-center gap-4 py-4 px-2 text-left transition-colors duration-200 group ${
                                        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <Icon 
                                        size={20} 
                                        className={`shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} 
                                        fill={isActive ? "currentColor" : "none"} 
                                    />
                                    <span className={`text-sm md:text-base font-medium ${isActive ? "font-semibold" : ""}`}>
                                        {label}
                                    </span>
                                    
                                    {/* Active Right Border indicator */}
                                    {isActive && (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-md"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Main FAQs */}
                    <div className="w-full lg:w-3/4">
                        <h2 className="text-2xl font-bold text-foreground mb-6">
                            {currentCategoryLabel}
                        </h2>

                        {/* Special Banner for Top Queries */}
                        {activeCategory === "top-queries" && (
                            <div className="flex items-center justify-between p-4 mb-8 border border-border rounded-lg bg-surface">
                                <p className="text-sm md:text-base text-muted-foreground">
                                    {t.faq?.trackOrderBanner || (isBn ? "à¦†à¦ªà¦¨à¦¿ 'à¦†à¦®à¦¾à¦° à¦…à¦°à§à¦¡à¦¾à¦°' à¦¸à§‡à¦•à¦¶à¦¨ à¦¥à§‡à¦•à§‡ à¦…à¦°à§à¦¡à¦¾à¦° à¦Ÿà§à¦°à§à¦¯à¦¾à¦• à¦•à¦°à¦¤à§‡ à¦ªà¦¾à¦°à¦¬à§‡à¦¨à¥¤" : "You can track your orders in 'My Orders'.")}
                                </p>
                                <Link href="/account/orders">
                                    <Button variant="outline" size="sm" className="text-primary hover:text-primary">
                                        {t.faq?.trackOrderBtn || (isBn ? "à¦…à¦°à§à¦¡à¦¾à¦° à¦Ÿà§à¦°à§à¦¯à¦¾à¦• à¦•à¦°à§à¦¨" : "TRACK ORDERS")}
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Accordion List */}
                        <div className="flex flex-col">
                            {activeFaqs.map((item: { q: string; a: string }, idx: number) => (
                                <Accordion
                                    key={idx}
                                    num={``} // Removing number as per mockup design
                                    item={{ question: item.q, answer: item.a }}
                                    className="bg-transparent border-b border-border mb-0 shadow-none rounded-none !px-0"
                                />
                            ))}
                            {activeFaqs.length === 0 && (
                                <p className="text-muted-foreground py-4">
                                    {t.faq?.emptyFaq || (isBn ? "à¦à¦‡ à¦•à§à¦¯à¦¾à¦Ÿà¦¾à¦—à¦°à¦¿à¦° à¦œà¦¨à§à¦¯ à¦à¦–à¦¨à§‹ à¦•à§‹à¦¨à§‹ à¦ªà§à¦°à¦¶à§à¦¨ à¦¯à§‹à¦— à¦•à¦°à¦¾ à¦¹à§Ÿà¦¨à¦¿à¥¤" : "No FAQs available for this category yet.")}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default FAQSection;

