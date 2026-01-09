"use client";

import React, { useEffect, useRef, useState } from 'react';
import TopBar from './TopBar';
import CategoryBar from './CategoryBar';
import MobileAppBar from './MobileAppBar';
import BottomNavBar from './BottomNavBar';
import FloatingCart from './FloatingCart';
import FloatingChat from './FloatingChat';
import MobileDrawer from './MobileDrawer';
import CartDrawer from './CartDrawer';
import useAuthUser from '@/hooks/useAuthUser';
import { useServerCartStore } from '@/store/serverCartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import type { ICategory } from '@/types';

const Header = ({ categories }: { categories: ICategory[] }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const user = useAuthUser();
    const fetchCart = useServerCartStore((s) => s.fetchCart);
    const resetCart = useServerCartStore((s) => s.reset);
    const resetWishlist = useWishlistStore((s) => s.reset);
    const wasLoggedIn = useRef(false);

    // Cookies are set/cleared inside server actions, so nothing else notifies
    // this already-mounted component that auth state changed — useAuthUser()
    // reacts to that via AUTH_UPDATED_EVENT, and this mirrors the server cart
    // in on login / clears it (and the wishlist store) on logout — otherwise
    // a signed-out visitor on a shared device would still see the previous
    // account's wishlist state until a hard refresh.
    useEffect(() => {
        const isLoggedIn = !!user;
        if (isLoggedIn && !wasLoggedIn.current) fetchCart();
        if (!isLoggedIn && wasLoggedIn.current) { resetCart(); resetWishlist(); }
        wasLoggedIn.current = isLoggedIn;
    }, [user, fetchCart, resetCart, resetWishlist]);

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;

                    if (currentScrollY < 50) {
                        // Always show near the very top
                        setIsVisible(true);
                        setLastScrollY(currentScrollY);
                    } else {
                        const delta = currentScrollY - lastScrollY;

                        // Require at least a 15px scroll before hiding/showing
                        // This prevents trackpad jitter from causing flashing
                        if (Math.abs(delta) > 15) {
                            setIsVisible(delta < 0);
                            setLastScrollY(currentScrollY);
                        }
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <>
            {/* Desktop Header: Hides only TopBar (h-16 = 64px) by translating up exactly that amount */}
            <header className={`hidden lg:block w-full fixed top-0 z-50 bg-background shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isVisible ? 'translate-y-0' : '-translate-y-16'}`}>
                <TopBar onCartClick={() => setIsCartOpen(true)} />
                <CategoryBar categories={categories} />
            </header>

            {/* Mobile Header: Hides completely on scroll down */}
            <header className={`lg:hidden w-full fixed top-0 z-50 bg-background shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
                <MobileAppBar
                    onMenuClick={() => setIsMobileMenuOpen(true)}
                    onCartClick={() => setIsCartOpen(true)}
                />
            </header>

            {/* Mobile Drawer Navigation */}
            <MobileDrawer
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                categories={categories}
            />

            {/* Slide-in Cart Drawer */}
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            {/* Floating Elements */}
            <FloatingCart onClick={() => setIsCartOpen(true)} />
            <FloatingChat />

            {/* Mobile Bottom Nav */}
            <BottomNavBar onCartClick={() => setIsCartOpen(true)} />
        </>
    );
};

export default Header;
