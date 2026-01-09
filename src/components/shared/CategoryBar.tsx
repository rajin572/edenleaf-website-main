"use client";

import LocaleLink from '@/components/i18n/LocaleLink';
import { ChevronDown } from 'lucide-react';
import Container from '../ui/CustomUi/Container';
import { useT } from '@/components/i18n/DictionaryProvider';
import { format } from '@/i18n/config';
import { categoryHref, collectionHref } from '@/service/CatalogService/catalog.constants';
import type { ICategory } from '@/types';

const CategoryBar = ({ categories }: { categories: ICategory[] }) => {
    const t = useT();

    const promoLinks = [
        { name: t.nav.combo, href: collectionHref("combos") },
        { name: t.nav.offerZone, href: collectionHref("offers") },
    ];

    return (
        <div className="bg-secondary hidden lg:block">
            <Container>
                <div className="h-12 flex items-center whitespace-nowrap">
                    <ul className="flex items-center gap-6 text-sm font-semibold text-secondary-foreground">
                        {promoLinks.map((promo) => (
                            <li key={promo.href} className="h-12 flex items-center">
                                <LocaleLink
                                    href={promo.href}
                                    className="flex items-center gap-1 hover:text-primary transition-colors h-full"
                                >
                                    {promo.name}
                                </LocaleLink>
                            </li>
                        ))}

                        <li className="h-6 w-px bg-border mx-2" aria-hidden />

                        {categories.map((category) => (
                            <li key={category._id} className="group relative h-12 flex items-center">
                                <LocaleLink
                                    href={categoryHref(category.slug)}
                                    className="flex items-center gap-1 hover:text-primary transition-colors h-full"
                                >
                                    {category.name}
                                    {category.hasSub && (
                                        <ChevronDown size={14} className="mt-0.5 group-hover:rotate-180 transition-transform duration-200" />
                                    )}
                                </LocaleLink>

                                {category.hasSub && category.subCategories.length > 0 && (
                                    <div className="absolute top-12 left-0 w-52 bg-card shadow-lg rounded-b-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-t-0 border-border">
                                        <div className="p-2 flex flex-col">
                                            {category.subCategories.map((sub) => (
                                                <LocaleLink
                                                    key={sub._id}
                                                    href={categoryHref(category.slug, sub.slug)}
                                                    className="p-2 hover:bg-muted text-text-secondary hover:text-primary rounded text-sm transition-colors"
                                                >
                                                    {sub.name}
                                                </LocaleLink>
                                            ))}
                                            <LocaleLink
                                                href={categoryHref(category.slug)}
                                                className="p-2 hover:bg-muted hover:text-primary rounded text-sm transition-colors text-primary font-semibold mt-2 border-t border-border"
                                            >
                                                {format(t.nav.viewAllCategory, { category: category.name })}
                                            </LocaleLink>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </Container>
        </div>
    );
};

export default CategoryBar;
