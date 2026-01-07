import { cn } from '@/lib/utils';
import React from 'react';
import { ComponentProps } from 'react';

export type TagTheme = 'error' | 'warning' | 'success' | 'blue' | 'purple' | 'orange';

type TagProps = {
    children: string | number;
    theme?: TagTheme;
    className?: string; // Custom className
} & ComponentProps<'span'>;

const Tag: React.FC<TagProps> = ({ children, theme = 'blue', className, ...props }) => {
    // Define theme-specific styles
    const themeClasses: Record<string, string> = {
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-400 text-white',
        success: 'bg-green-500 text-white',
        blue: 'bg-blue-500 text-white',
        purple: 'bg-purple-500 text-white',
        orange: 'bg-orange-500 text-white',
    };

    // Combine theme styles with custom className
    const tagClasses = cn(
        'inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full', // Default base styles
        themeClasses[theme], // Apply theme styles
        className // Apply custom class if passed
    );

    return (
        <span {...props} className={tagClasses}>
            {children}
        </span>
    );
};

export default Tag;
