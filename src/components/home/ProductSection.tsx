import React from 'react';
import ProductCard from '../shared/ProductCard';
import { GradientSectionTitle } from '../ui/CustomUi/GradientSectionTitle';
import Container from '../ui/CustomUi/Container';
import type { IProduct } from '@/types';
import ProductCarousel from './ProductCarousel';

interface ProductSectionProps {
    title: string;
    viewAllLink?: string;
    viewAllText?: string;
    products: IProduct[];
    showBadge?: boolean;
    slider?: boolean;
}

const ProductSection: React.FC<ProductSectionProps> = ({
    title,
    viewAllLink,
    viewAllText,
    products,
    showBadge = false,
    slider = false,
}) => {
    return (
        <section className="py-12">
            <Container>
                <GradientSectionTitle
                    title={title}
                    action={viewAllLink && viewAllText ? { label: viewAllText, href: viewAllLink } : undefined}
                />

                {slider ? (
                    <ProductCarousel title={title} products={products} showBadge={showBadge} />
                ) : (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} showBadge={showBadge} />
                        ))}
                    </div>
                )}
            </Container>
        </section>
    );
};

export default ProductSection;
