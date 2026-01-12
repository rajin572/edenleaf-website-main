"use client";

import React, { useState } from 'react';
import LocaleLink from '@/components/i18n/LocaleLink';
import Image from 'next/image';
import { User, MapPin, Heart, Info, Phone, MessageCircle, ChevronDown } from 'lucide-react';
import { AllImages } from '../../../public/images/AllImages';
import ReusableSheet from '@/components/ui/CustomUi/ReuseableSheet';
import { useT } from '@/components/i18n/DictionaryProvider';
import { format } from '@/i18n/config';
import { categoryHref, collectionHref } from '@/service/CatalogService/catalog.constants';
import type { ICategory } from '@/types';

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    categories: ICategory[];
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose, categories }) => {
    const t = useT();
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const promoLinks = [
        { name: t.nav.combo, href: collectionHref("combos") },
        { name: t.nav.offerZone, href: collectionHref("offers") },
    ];

    const toggleCategory = (categoryId: string) => {
        setExpandedCategory(prev => prev === categoryId ? null : categoryId);
    };

    return (
        <ReusableSheet
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                    setTimeout(() => setExpandedCategory(null), 300);
                }
            }}
            side="left"
            width="w-[85vw] sm:max-w-sm"
            title={
                <Image
                    src={AllImages.logo}
                    alt={t.meta.siteName}
                    width={100}
                    height={30}
                    className="h-8 w-auto object-contain"
                />
            }
        >
            <div className="-mx-6 -my-5 h-screen">
                {/* Guest Section */}
                <div className="p-4 bg-muted/30 border-b border-border flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">{t.nav.welcomeGuest}</p>
                        <div className="flex gap-2 text-xs text-primary font-semibold mt-1">
                            <LocaleLink href="/sign-in" onClick={onClose}>{t.nav.signIn}</LocaleLink>
                            <span aria-hidden>|</span>
                            <LocaleLink href="/sign-up" onClick={onClose}>{t.nav.register}</LocaleLink>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="p-2 border-b border-border">
                    <ul className="flex flex-col">
                        <li>
                            <LocaleLink
                                href="/"
                                className="block p-3 text-sm font-medium text-foreground hover:bg-muted hover:text-primary rounded transition-colors"
                                onClick={onClose}
                            >
                                {t.common.home}
                            </LocaleLink>
                        </li>

                        {promoLinks.map((promo) => (
                            <li key={promo.href}>
                                <LocaleLink
                                    href={promo.href}
                                    className="block p-3 text-sm font-medium text-primary hover:bg-muted rounded transition-colors"
                                    onClick={onClose}
                                >
                                    {promo.name}
                                </LocaleLink>
                            </li>
                        ))}

                        <li className="my-2 border-t border-border" />
                        <li className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {t.nav.categories}
                        </li>

                        {categories.map((category) => {
                            const isExpanded = expandedCategory === category._id;
                            const hasChildren = category.hasSub && category.subCategories.length > 0;

                            return (
                                <li key={category._id} className="flex flex-col">
                                    {hasChildren ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => toggleCategory(category._id)}
                                                aria-expanded={isExpanded}
                                                className="flex items-center justify-between w-full p-3 text-sm font-medium text-foreground hover:bg-muted hover:text-primary rounded transition-colors"
                                            >
                                                {category.name}
                                                <ChevronDown
                                                    size={16}
                                                    className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-primary' : ''}`}
                                                />
                                            </button>

                                            <div
                                                className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                                            >
                                                <ul className="pl-4 pb-2 flex flex-col border-l-2 border-muted ml-3 mt-1">
                                                    {category.subCategories.map((sub) => (
                                                        <li key={sub._id}>
                                                            <LocaleLink
                                                                href={categoryHref(category.slug, sub.slug)}
                                                                className="block py-2 px-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                                                                onClick={onClose}
                                                            >
                                                                {sub.name}
                                                            </LocaleLink>
                                                        </li>
                                                    ))}
                                                    <li>
                                                        <LocaleLink
                                                            href={categoryHref(category.slug)}
                                                            className="block py-2 px-3 text-sm font-semibold text-primary hover:bg-muted rounded transition-colors mt-1"
                                                            onClick={onClose}
                                                        >
                                                            {format(t.nav.viewAllCategory, { category: category.name })}
                                                        </LocaleLink>
                                                    </li>
                                                </ul>
                                            </div>
                                        </>
                                    ) : (
                                        <LocaleLink
                                            href={categoryHref(category.slug)}
                                            className="block p-3 text-sm font-medium text-foreground hover:bg-muted hover:text-primary rounded transition-colors"
                                            onClick={onClose}
                                        >
                                            {category.name}
                                        </LocaleLink>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Quick Links */}
                <div className="p-2 border-b border-border">
                    <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.nav.quickLinks}</p>
                    <ul className="flex flex-col">
                        <li>
                            <LocaleLink href="/track-order" className="flex items-center gap-3 p-3 text-sm font-medium text-foreground hover:bg-muted hover:text-primary rounded transition-colors" onClick={onClose}>
                                <MapPin size={18} className="text-muted-foreground" /> {t.nav.trackOrder}
                            </LocaleLink>
                        </li>
                        <li>
                            <LocaleLink href="/dashboard/wishlist" className="flex items-center gap-3 p-3 text-sm font-medium text-foreground hover:bg-muted hover:text-primary rounded transition-colors" onClick={onClose}>
                                <Heart size={18} className="text-muted-foreground" /> {t.nav.wishlist}
                            </LocaleLink>
                        </li>
                        <li>
                            <LocaleLink href="/dashboard/profile" className="flex items-center gap-3 p-3 text-sm font-medium text-foreground hover:bg-muted hover:text-primary rounded transition-colors" onClick={onClose}>
                                <User size={18} className="text-muted-foreground" /> {t.nav.myAccount}
                            </LocaleLink>
                        </li>
                    </ul>
                </div>

                {/* Info Links */}
                <div className="p-2">
                    <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.nav.information}</p>
                    <ul className="flex flex-col">
                        <li>
                            <LocaleLink href="/about" className="flex items-center gap-3 p-3 text-sm font-medium text-foreground hover:bg-muted hover:text-primary rounded transition-colors" onClick={onClose}>
                                <Info size={18} className="text-muted-foreground" /> {t.footer.aboutUs}
                            </LocaleLink>
                        </li>
                        <li>
                            <LocaleLink href="/contact" className="flex items-center gap-3 p-3 text-sm font-medium text-foreground hover:bg-muted hover:text-primary rounded transition-colors" onClick={onClose}>
                                <Phone size={18} className="text-muted-foreground" /> {t.footer.contact}
                            </LocaleLink>
                        </li>
                        <li>
                            <LocaleLink href="/faq" className="flex items-center gap-3 p-3 text-sm font-medium text-foreground hover:bg-muted hover:text-primary rounded transition-colors" onClick={onClose}>
                                <MessageCircle size={18} className="text-muted-foreground" /> {t.footer.faq}
                            </LocaleLink>
                        </li>
                    </ul>
                </div>
            </div>
        </ReusableSheet>
    );
};

export default MobileDrawer;
