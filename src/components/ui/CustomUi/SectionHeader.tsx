import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import LocaleLink from '@/components/i18n/LocaleLink';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href: string;
  };
  children?: ReactNode;
  className?: string;
}

export const SectionHeader = ({
  title,
  subtitle,
  action,
  children,
  className,
}: SectionHeaderProps) => {
  return (
    <div className={cn('flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8', className)}>
      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      
      {(action || children) && (
        <div className="flex items-center gap-4">
          {children}
          {action && (
            <LocaleLink 
              href={action.href}
              className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 group transition-colors"
            >
              {action.label}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </LocaleLink>
          )}
        </div>
      )}
    </div>
  );
};
