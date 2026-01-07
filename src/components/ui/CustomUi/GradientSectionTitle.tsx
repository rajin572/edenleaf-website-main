import React from 'react';
import LocaleLink from '@/components/i18n/LocaleLink';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface GradientSectionTitleProps {
    title: string;
    action?: {
        label: string;
        href: string;
    };
    className?: string;
}

export const GradientSectionTitle = ({ title, action, className }: GradientSectionTitleProps) => {
    const words = (title || "").split(' ');
    const lastWord = words.length > 1 ? words.pop() : '';
    const firstPart = words.join(' ') || title;

    return (
        <div className={cn("relative flex items-end justify-between gap-4 w-full pb-2 md:pb-3 mb-6 border-b border-gray-300/60", className)}>
            <h2 className="text-base sm:text-xl md:text-2xl font-bold uppercase tracking-tight whitespace-nowrap text-foreground flex-1 truncate">
                <span className="truncate">{firstPart}</span>{" "}
                {lastWord && (
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-orange-500 shrink-0">
                        {lastWord}
                    </span>
                )}
            </h2>

            {action && (
                <LocaleLink
                    href={action.href}
                    className="flex items-center gap-1 text-xs md:text-sm font-semibold text-primary hover:text-primary/80 transition-colors whitespace-nowrap group shrink-0 pb-1"
                >
                    {action.label}
                    <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform group-hover:translate-x-1" />
                </LocaleLink>
            )}

            <div className="absolute -bottom-0.5 left-0 w-16 md:h-1 h-0.5 bg-linear-to-r from-primary to-orange-500"></div>
        </div>
    );
};
