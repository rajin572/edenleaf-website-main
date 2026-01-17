"use client";

import Image from 'next/image';
import LocaleLink from '@/components/i18n/LocaleLink';
import ParallaxMarquee from '@/components/ui/animation/components/AnimatedMarque';
import Container from '../ui/CustomUi/Container';
import { useT } from '@/components/i18n/DictionaryProvider';
import { GradientSectionTitle } from '../ui/CustomUi/GradientSectionTitle';
import { categoryHref } from '@/service/CatalogService/catalog.constants';
import type { IHomepageFeaturedCategory } from '@/types';

const FeaturedCategories = ({ categories }: { categories: IHomepageFeaturedCategory[] }) => {
    const t = useT();

    const marqueeItems = categories.map((category) => (
        <LocaleLink
            key={category._id}
            href={categoryHref(category.slug)}
            className="flex flex-col items-center justify-center gap-2 w-full h-[100px] bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 group"
            draggable={false}
        >
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-background">
                <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="56px"
                    draggable={false}
                />
            </div>
            <span className="text-sm font-bold text-foreground text-center">
                {category.name}
            </span>
        </LocaleLink>
    ));

    return (
        <section className="py-8 md:py-12 bg-background relative overflow-hidden">
            <Container className="relative z-10">
                <GradientSectionTitle title={t.home.shopByCategory} />
            </Container>

            <div className="w-full relative z-10 mt-10">
                <ParallaxMarquee
                    items={marqueeItems}
                    baseVelocity={-0.5}
                    itemWidth={150}
                    gap={16}
                    playMode="hover-pause"
                    draggable={true}
                />
                <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r"></div>
                <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l"></div>
            </div>
        </section>
    );
};

export default FeaturedCategories;
