import React from 'react';
import ComboCard from '../shared/ComboCard';
import { GradientSectionTitle } from '../ui/CustomUi/GradientSectionTitle';
import Container from '../ui/CustomUi/Container';
import type { ICombo } from '@/types';

interface ComboSectionProps {
    title: string;
    viewAllLink?: string;
    viewAllText?: string;
    combos: ICombo[];
}

/** Same chrome as `ProductSection`, but for real `ICombo` bundles — combos
 *  aren't products (no stock/variants/single price), so they can't share
 *  `ProductCard`/`ProductCarousel`, which hard-assume that shape. */
const ComboSection: React.FC<ComboSectionProps> = ({ title, viewAllLink, viewAllText, combos }) => {
    if (combos.length === 0) return null;

    return (
        <section className="py-12">
            <Container>
                <GradientSectionTitle
                    title={title}
                    action={viewAllLink && viewAllText ? { label: viewAllText, href: viewAllLink } : undefined}
                />

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
                    {combos.map((combo) => (
                        <ComboCard key={combo._id} combo={combo} />
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default ComboSection;
