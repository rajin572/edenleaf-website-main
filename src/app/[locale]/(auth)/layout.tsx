import React from 'react';
import Image from 'next/image';
import LocaleLink from '@/components/i18n/LocaleLink';
import { AllImages } from '../../../../public/images/AllImages';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
            {/* Left Side: Image/Brand (Hidden on mobile) */}
            <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative bg-primary items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/80 to-primary/40 z-10"></div>
                <Image
                    src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1080&auto=format&fit=crop"
                    alt="Ednleaf food selection"
                    fill
                    className="object-cover"
                />

                <div className="relative z-20 flex flex-col items-center justify-center p-12 text-white text-center">
                    <LocaleLink href="/" className="mb-8">
                        <Image
                            src={AllImages.logo}
                            alt="Ednleaf"
                            width={180}
                            height={60}
                            className="h-16 w-auto object-contain brightness-0 invert"
                        />
                        <span className="block mt-2 text-2xl font-bold tracking-tight">Ednleaf</span>
                    </LocaleLink>
                    <h2 className="text-4xl font-bold mb-4">100% Pure & Natural</h2>
                    <p className="text-lg opacity-90 max-w-md">
                        Join Ednleaf today to get access to authentic, healthy, and organic foods straight from the source to your doorstep.
                    </p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full md:w-1/2 lg:w-[45%] flex flex-col min-h-screen relative">
                {/* Mobile Logo Header */}
                <div className="md:hidden p-6 flex justify-center border-b border-border bg-surface">
                    <LocaleLink href="/" className="flex items-center gap-2">
                        <Image
                            src={AllImages.logo}
                            alt="Ednleaf"
                            width={140}
                            height={45}
                            className="h-10 w-auto object-contain"
                        />
                        <span className="text-xl font-bold tracking-tight text-secondary">Ednleaf</span>
                    </LocaleLink>
                </div>

                {/* Form Container */}
                <div className="flex-grow flex items-center justify-center p-6 md:p-12 lg:p-16">
                    <div className="w-full max-w-md">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
