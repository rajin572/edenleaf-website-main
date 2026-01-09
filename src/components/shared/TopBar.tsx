"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import LocaleLink from '@/components/i18n/LocaleLink';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { useT } from '@/components/i18n/DictionaryProvider';
import Image from 'next/image';
import { Search, MapPin, User, Heart, ShoppingCart, Menu, Contact, FileQuestion, PhoneCall } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { AllImages } from '../../../public/images/AllImages';
import Container from '../ui/CustomUi/Container';
import { NavDropdown, DropdownItem } from './NavDropdown';
import useCartCount from '@/hooks/useCartCount';
import useAuthUser, { AUTH_UPDATED_EVENT } from '@/hooks/useAuthUser';
import { useWishlist } from '@/hooks/useWishlist';
import { logoutUser } from '@/service/AuthService/AuthServiceAPi';
import tryCatchWrapper from '@/utils/tryCatchWrapper';

const TopBar = ({ onCartClick }: { onCartClick?: () => void }) => {
    const t = useT();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const user = useAuthUser();
    const isLoggedIn = !!user;
    const cartCount = useCartCount();
    const { count: wishlistCount } = useWishlist();

    const handleLogout = async () => {
        const res = await tryCatchWrapper(logoutUser, undefined, { toastLoadingMessage: t.auth?.loadingSignOut || "Signing out..." });
        if (res?.success) {
            window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
            router.refresh();
        }
    };

    const moreDropdownItems: DropdownItem[] = [
        { label: t.footer.aboutUs, href: '/about', icon: <Contact size={18} className="text-[#102a3a]" /> },
        { label: 'Wishlists', href: isLoggedIn ? '/dashboard/wishlist' : '/wishlist', icon: <Heart size={18} className="text-[#102a3a]" /> },
        { label: t.contact?.title || 'Contact', href: '/contact', icon: <Contact size={18} className="text-[#102a3a]" /> },
        { label: t.footer.faq, href: '/faq', icon: <FileQuestion size={18} className="text-[#102a3a]" /> },
        { label: 'Call Us', href: 'tel:+8801700000000', icon: <PhoneCall size={18} className="text-[#102a3a]" /> },
        { label: 'WhatsApp', href: 'https://wa.me/8801700000000', icon: <FaWhatsapp size={18} className="text-[#4FCE5D]" />, labelClassName: 'text-[#ea7f12]' },
    ];

    return (
        <div className="bg-background text-foreground">
            <Container>
                <div className=" h-16 flex items-center justify-between gap-4">
                    {/* Logo */}
                    <LocaleLink href="/" className="flex flex-shrink-0 items-center gap-2">
                        <Image
                            src={AllImages.logo}
                            alt="Ednleaf"
                            width={120}
                            height={40}
                            className="h-10 w-auto object-contain"
                        />
                        <span className="text-xl font-bold tracking-tight text-secondary">Ednleaf</span>
                    </LocaleLink>

                    {/* Search Bar */}
                    <div className="flex-grow max-w-2xl relative hidden lg:block">
                        <input
                            type="text"
                            placeholder={t.common.search}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-4 pr-10 rounded text-foreground bg-[#F5F5F5] outline-none border focus:border-primary"
                        />
                        <button className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center bg-primary text-primary-foreground rounded-r">
                            <Search size={18} />
                        </button>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-6 flex-shrink-0 text-sm font-medium">
                        <LanguageSwitcher />

                        <LocaleLink href="/track-order" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                            <MapPin size={18} />
                            <span>{t.nav.trackOrder}</span>
                        </LocaleLink>

                        {isLoggedIn ? (
                            <button onClick={handleLogout} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                <User size={18} />
                                <span>{t.nav.signOut}</span>
                            </button>
                        ) : (
                            <LocaleLink href="/sign-in" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                <User size={18} />
                                <span>{t.nav.signIn}</span>
                            </LocaleLink>
                        )}

                        <LocaleLink href={isLoggedIn ? "/dashboard/wishlist" : "/wishlist"} className="flex items-center gap-1.5 hover:text-primary transition-colors relative">
                            <Heart size={18} />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{wishlistCount}</span>
                            )}
                        </LocaleLink>

                        <button onClick={onCartClick} className="flex items-center gap-1.5 hover:text-primary transition-colors relative">
                            <ShoppingCart size={18} />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
                            )}
                        </button>

                        <div className="hidden lg:block">
                            <NavDropdown
                                trigger={
                                    <button className="flex items-center gap-1.5 hover:text-primary transition-colors outline-none">
                                        <Menu size={18} />
                                        <span>{t.nav.more}</span>
                                    </button>
                                }
                                items={moreDropdownItems}
                            />
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default TopBar;
