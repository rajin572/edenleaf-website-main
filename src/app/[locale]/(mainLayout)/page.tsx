import HeroBanner from '@/components/home/HeroBanner';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import ProductSection from '@/components/home/ProductSection';
import ComboSection from '@/components/home/ComboSection';
import PromoBanner from '@/components/home/PromoBanner';
import Testimonials from '@/components/home/Testimonials';
import { getDictionary } from '@/i18n/dictionaries';
import { collectionHref } from '@/service/CatalogService/catalog.constants';
import { getBanners, getCombos, getHomepage, getProducts } from '@/service/CatalogService/catalogApi';
import ContactSection from '@/components/home/ContactSection';

/**
 * Every row reads the same collection the "View All" link opens, so the
 * homepage and `/collections/:slug` can never show different products.
 */
const HomePage = async () => {
    const [t, homepage, heroBanners, heroSideBanners, marketingLeftBanners, marketingRightBanners, newArrivals, combos, featured] = await Promise.all([
        getDictionary(),
        getHomepage(),
        getBanners({ placement: 'hero', limit: 50 }),
        getBanners({ placement: 'hero_side', limit: 1 }),
        getBanners({ placement: 'marketing_left', limit: 1 }),
        getBanners({ placement: 'marketing_right', limit: 1 }),
        getProducts({ collection: 'new-arrivals' }),
        getCombos(),
        getProducts({ collection: 'featured-products' }),
    ]);

    return (
        <div className="flex flex-col gap-4 pb-10">
            <HeroBanner slides={heroBanners} sideBanner={heroSideBanners[0]} />
            {homepage.showFeaturedCategories && (
                <FeaturedCategories categories={homepage.featuredCategories} />
            )}

            <ProductSection
                title={t.home.bestSellingProducts}
                viewAllLink={collectionHref('best-sales')}
                viewAllText={t.common.viewAll}
                products={homepage.bestSellers}
                showBadge
                slider
            />

            <ProductSection
                title={t.home.newArrivals}
                viewAllLink={collectionHref('new-arrivals')}
                viewAllText={t.common.viewAll}
                products={newArrivals}
                showBadge
                slider
            />

            <PromoBanner left={marketingLeftBanners[0]} right={marketingRightBanners[0]} />

            <ComboSection
                title={t.home.exclusiveComboDeals}
                viewAllLink={collectionHref('combos')}
                viewAllText={t.common.viewAll}
                combos={combos}
            />

            <ProductSection
                title={t.home.featuredProducts}
                viewAllLink={collectionHref('featured-products')}
                viewAllText={t.common.viewAll}
                products={featured}
                showBadge
            />
            <Testimonials />
            <ContactSection />

        </div>
    );
};

export default HomePage;
