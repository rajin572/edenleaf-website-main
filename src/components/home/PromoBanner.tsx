import Image from 'next/image';
import LocaleLink from '@/components/i18n/LocaleLink';
import Container from '@/components/ui/CustomUi/Container';
import type { IBanner } from '@/types';

interface PromoBannerProps {
    left?: IBanner;
    right?: IBanner;
}

const PromoBanner = ({ left, right }: PromoBannerProps) => {
    if (!left && !right) return null;

    const banners = [left, right].filter((banner): banner is IBanner => Boolean(banner));

    return (
        <Container className="pb-8 lg:pb-12">
            <div className="">
                <div className={`grid gap-3 sm:gap-10 ${banners.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
                    {banners.map((banner) => (
                        <LocaleLink
                            key={banner._id}
                            href={banner.destinationUrl}
                            aria-label={`Open ${banner.title}`}
                            className="group relative isolate block aspect-[2.15/1] bg-white overflow-hidden rounded-[1.15rem] transition duration-300 hover:-translate-y-0.5]"
                        >
                            <Image
                                src={banner.image}
                                alt={banner.title}
                                fill
                                sizes="(max-width: 1023px) 90vw, 45vw"
                                className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                            />
                            <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[1.15rem] ring-1 ring-inset ring-white/35" />
                            <span aria-hidden="true" className="absolute bottom-4 right-4 grid size-9 place-items-center rounded-full bg-white/90 text-[#1b3824] shadow-md backdrop-blur-sm transition-transform duration-300 group-hover:translate-x-0.5 sm:size-10">↗</span>
                        </LocaleLink>
                    ))}
                </div>
            </div>
        </Container>
    );
};

export default PromoBanner;
