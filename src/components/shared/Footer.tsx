
"use client";

import React, { useState } from "react";
import LocaleLink from "@/components/i18n/LocaleLink";
import Image from "next/image";
import { Mail, MapPin, Phone, Send, Truck, ShieldCheck, HeadphonesIcon, Star, Globe } from "lucide-react";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import { AllImages } from "../../../public/images/AllImages";
import { useT } from "@/components/i18n/DictionaryProvider";
import { subscribeToNewsletter } from "@/service/NewsletterService/newsletterApi";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import { getContactEmail } from "@/helpers/config/envConfig";

const Footer = () => {
    const t = useT();
    const contactEmail = getContactEmail();
    const [email, setEmail] = useState("");

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await tryCatchWrapper(
            subscribeToNewsletter,
            { body: { email } },
            { toastLoadingMessage: "Subscribing..." }
        );
        if (res?.success) setEmail("");
    };

    return (
        <footer className="w-full font-sans pb-10 lg:pb-0">
            {/* 1. NEWSLETTER STRIP (Top, Light tinted background) */}
            <div className="bg-primary py-10 border-t border-border">
                <div className="container mx-auto px-4 xl:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1 md:pr-12 text-center md:text-left">
                            <h2 className="text-2xl font-bold text-primary-color mb-2">
                                {t.footer?.newsletter || "Sign up to our news & offers"}
                            </h2>
                            <p className="text-sm text-primary-color/80">
                                {t.footer?.newsletterText || "Be the first to know about exclusive offers, new arrivals, health tips and more!"}
                            </p>
                        </div>

                        <div className="w-full md:w-[480px]">
                            <form className="flex flex-col" onSubmit={handleSubscribe}>
                                <div className="flex shadow-sm bg-white p-1 rounded-sm border border-gray-200">
                                    <div className="flex-1 flex items-center px-3">
                                        <Mail size={20} className="text-gray-400 mr-2" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder={t.footer?.newsletterPlaceholder || "email@address.com"}
                                            className="w-full text-sm text-black placeholder:text-gray-400 bg-transparent border-none focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 rounded-sm"
                                    >
                                        <Send size={16} />
                                        <span>{t.footer?.subscribe || "Sign up"}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. MAIN FOOTER (bg-primary) */}
            <div className="bg-secondary text-primary-foreground pt-12 pb-8">
                <div className="container mx-auto px-4 xl:px-8">

                    {/* Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                        {/* COL 1: Logo & Contact */}
                        <div className="lg:col-span-2 flex flex-col gap-6 pr-4">
                            <LocaleLink href="/" className="inline-flex items-center gap-2 mb-2 bg-white rounded-md p-2 w-fit">
                                <Image
                                    src={AllImages.logo}
                                    alt="Ednleaf logo"
                                    width={160}
                                    height={50}
                                    className="h-10 w-auto object-contain"
                                />
                                <span className="font-bold text-xl tracking-tight text-secondary">Ednleaf</span>
                            </LocaleLink>

                            <div className="flex flex-col gap-5">
                                {/* Head Office */}
                                <div>
                                    <h5 className="font-bold text-sm mb-2 flex items-center gap-2">
                                        <MapPin size={16} /> Head Office
                                    </h5>
                                    <div className="text-sm text-primary-foreground/80 ml-6 space-y-1">
                                        <p>House 12, Road 5, Dhanmondi</p>
                                        <p>+880 1234 567890</p>
                                        {contactEmail ? (
                                            <a href={`mailto:${contactEmail}`} className="underline underline-offset-2 hover:text-white">{contactEmail}</a>
                                        ) : (
                                            <LocaleLink href="/contact" className="underline underline-offset-2 hover:text-white">Contact Ednleaf</LocaleLink>
                                        )}
                                    </div>
                                </div>
                                {/* Socials */}
                                <div className="mt-2">
                                    <h5 className="font-bold text-sm mb-3">Connect With Us</h5>
                                    <div className="flex gap-3">
                                        <a href="#" className="w-8 h-8 rounded bg-white/20 text-white flex items-center justify-center hover:bg-white hover:text-primary transition-colors">
                                            <FaFacebook size={16} />
                                        </a>
                                        <a href="#" className="w-8 h-8 rounded bg-white/20 text-white flex items-center justify-center hover:bg-white hover:text-primary transition-colors">
                                            <FaTwitter size={16} />
                                        </a>
                                        <a href="#" className="w-8 h-8 rounded bg-white/20 text-white flex items-center justify-center hover:bg-white hover:text-primary transition-colors">
                                            <FaInstagram size={16} />
                                        </a>
                                        <a href="#" className="w-8 h-8 rounded bg-white/20 text-white flex items-center justify-center hover:bg-white hover:text-primary transition-colors">
                                            <FaYoutube size={16} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COL 2: Categories */}
                        <div className="lg:col-span-1">
                            <h4 className="font-bold text-sm mb-5">Categories</h4>
                            <ul className="flex flex-col gap-3 text-sm text-primary-foreground/80 font-medium">
                                <li><LocaleLink href="/category/honey" className="hover:text-white transition-colors">Honey</LocaleLink></li>
                                <li><LocaleLink href="/category/ghee" className="hover:text-white transition-colors">Ghee</LocaleLink></li>
                                <li><LocaleLink href="/category/oil" className="hover:text-white transition-colors">Oil</LocaleLink></li>
                                <li><LocaleLink href="/category/spices" className="hover:text-white transition-colors">Spices</LocaleLink></li>
                                <li><LocaleLink href="/category/dates" className="hover:text-white transition-colors">Dates</LocaleLink></li>
                                <li><LocaleLink href="/category/nuts" className="hover:text-white transition-colors">Nuts</LocaleLink></li>
                            </ul>
                        </div>

                        {/* COL 3: Blog */}
                        <div className="lg:col-span-1">
                            <h4 className="font-bold text-sm mb-5">Blog</h4>
                            <ul className="flex flex-col gap-3 text-sm text-primary-foreground/80 font-medium">
                                <li><LocaleLink href="/blog/health-tips" className="hover:text-white transition-colors">Health Tips</LocaleLink></li>
                                <li><LocaleLink href="/blog/recipes" className="hover:text-white transition-colors">Healthy Recipes</LocaleLink></li>
                                <li><LocaleLink href="/blog/benefits-of-honey" className="hover:text-white transition-colors">Benefits of Honey</LocaleLink></li>
                                <li><LocaleLink href="/blog/pure-ghee" className="hover:text-white transition-colors">Why Pure Ghee?</LocaleLink></li>
                            </ul>
                        </div>

                        {/* COL 4: Information */}
                        <div className="lg:col-span-1">
                            <h4 className="font-bold text-sm mb-5">{t.footer?.information || "Information"}</h4>
                            <ul className="flex flex-col gap-3 text-sm text-primary-foreground/80 font-medium">
                                <li><LocaleLink href="/about" className="hover:text-white transition-colors">{t.footer?.aboutUs || "About Us"}</LocaleLink></li>
                                <li><LocaleLink href="/return-policy" className="hover:text-white transition-colors">{t.footer?.returnPolicy || "Return Policy"}</LocaleLink></li>
                                <li><LocaleLink href="/delivery" className="hover:text-white transition-colors">{t.footer?.delivery || "Delivery Information"}</LocaleLink></li>
                                <li><LocaleLink href="/contact" className="hover:text-white transition-colors">{t.footer?.contactUs || "Contact Us"}</LocaleLink></li>
                                <li><LocaleLink href="/terms" className="hover:text-white transition-colors">{t.footer?.terms || "Terms & Conditions"}</LocaleLink></li>
                                <li><LocaleLink href="/faq" className="hover:text-white transition-colors">{t.footer?.faq || "FAQ"}</LocaleLink></li>
                                <li><LocaleLink href="/privacy" className="hover:text-white transition-colors">{t.footer?.privacy || "Privacy Policy"}</LocaleLink></li>
                            </ul>
                        </div>
                    </div>

                    {/* 3. FEATURES STRIP (Bordered Top & Bottom) */}
                    <div className="border-y border-white/20 py-8 mb-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Feature 1 */}
                            <div className="flex items-center gap-4">
                                <Truck className="text-primary" size={36} strokeWidth={1.5} />
                                <div className="text-xs font-bold leading-tight uppercase tracking-wide">
                                    FAST DELIVERY<br />ACROSS BANGLADESH
                                </div>
                            </div>
                            {/* Feature 2 */}
                            <div className="flex items-center gap-4">
                                <ShieldCheck className="text-primary" size={36} strokeWidth={1.5} />
                                <div className="text-xs font-bold leading-tight uppercase tracking-wide">
                                    100% SECURE<br />CHECKOUT
                                </div>
                            </div>
                            {/* Feature 3 */}
                            <div className="flex items-center gap-4">
                                <HeadphonesIcon className="text-primary" size={36} strokeWidth={1.5} />
                                <div className="text-xs font-bold leading-tight uppercase tracking-wide">
                                    OUTSTANDING<br />CUSTOMER SUPPORT
                                </div>
                            </div>
                            {/* Feature 4 */}
                            <div className="flex items-center gap-4">
                                <Star className="text-primary" size={36} strokeWidth={1.5} />
                                <div className="text-xs font-bold leading-tight uppercase tracking-wide">
                                    PREMIUM QUALITY<br />GUARANTEED
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. BOTTOM BAR */}
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-6 pt-2">

                        <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-primary-foreground/80 font-medium">
                            {/* Language/Country Selector Dummy */}
                            <div className="flex items-center gap-2 px-3 py-1.5 border border-white/30 rounded cursor-pointer hover:bg-white/10 transition-colors text-white">
                                <Globe size={14} />
                                <span>Bangladesh</span>
                            </div>
                            <span>Copyright &copy; {new Date().getFullYear()} Ednleaf | {t.footer?.rights || "All Rights Reserved"}</span>

                        </div>
                    </div>

                </div>
            </div>
        </footer>
    );
};

export default Footer;

