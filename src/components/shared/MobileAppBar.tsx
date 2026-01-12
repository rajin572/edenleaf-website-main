"use client";

import React, { useState } from 'react';
import LocaleLink from '@/components/i18n/LocaleLink';
import Image from 'next/image';
import { Menu, Search, ShoppingCart, ArrowLeft, MoreVertical, Contact, Heart, FileQuestion, PhoneCall } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { AllImages } from '../../../public/images/AllImages';
import { NavDropdown, DropdownItem } from './NavDropdown';
import useCartCount from '@/hooks/useCartCount';
import useAuthUser from '@/hooks/useAuthUser';

interface MobileAppBarProps {
    onMenuClick: () => void;
    onCartClick: () => void;
}

const MobileAppBar: React.FC<MobileAppBarProps> = ({ onMenuClick, onCartClick }) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const user = useAuthUser();
    const isLoggedIn = !!user;
    const cartCount = useCartCount();

    const moreDropdownItems: DropdownItem[] = [
        { label: 'About Us', href: '/about', icon: <Contact size={18} className="text-[#102a3a]" /> },
        { label: 'Wishlists', href: isLoggedIn ? '/dashboard/wishlist' : '/wishlist', icon: <Heart size={18} className="text-[#102a3a]" /> },
        { label: 'Faqs', href: '/faqs', icon: <FileQuestion size={18} className="text-[#102a3a]" /> },
        { label: 'Call Us', href: 'tel:+8801700000000', icon: <PhoneCall size={18} className="text-[#102a3a]" /> },
        { label: 'WhatsApp', href: 'https://wa.me/8801700000000', icon: <FaWhatsapp size={18} className="text-[#4FCE5D]" />, labelClassName: 'text-[#ea7f12]' },
    ];

    return (
        <div className="bg-secondary text-secondary-foreground h-14 relative">
            {!isSearchOpen ? (
                <div className="flex items-center justify-between h-full px-4">
                    <div className="flex items-center gap-3">
                        <button onClick={onMenuClick} className="p-1 -ml-1">
                            <Menu size={24} />
                        </button>
                        <LocaleLink href="/" className="flex items-center gap-1.5">
                            <Image
                                src={AllImages.logo}
                                alt="Ednleaf"
                                width={100}
                                height={30}
                                className="h-8 w-auto object-contain"
                            />
                            <span className="text-base font-bold tracking-tight">Ednleaf</span>
                        </LocaleLink>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsSearchOpen(true)} className="p-1">
                            <Search size={22} />
                        </button>
                        <button onClick={onCartClick} className="p-1 relative">
                            <ShoppingCart size={22} />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
                            )}
                        </button>
                        <div className="flex items-center">
                            <NavDropdown
                                trigger={
                                    <button className="p-1 outline-none text-foreground flex items-center justify-center">
                                        <MoreVertical className="text-white" size={22} />
                                    </button>
                                }
                                items={moreDropdownItems}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center h-full px-2 gap-2 bg-background w-full absolute top-0 left-0 z-10 animate-in slide-in-from-top-2">
                    <button onClick={() => setIsSearchOpen(false)} className="p-2 text-foreground">
                        <ArrowLeft size={20} />
                    </button>
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search for products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="grow h-10 bg-transparent outline-none text-foreground text-base"
                    />
                    <button className="p-2 text-primary">
                        <Search size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default MobileAppBar;
