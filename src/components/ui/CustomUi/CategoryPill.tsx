import LocaleLink from '@/components/i18n/LocaleLink';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface CategoryPillProps {
  label: string;
  href: string;
  imageUrl?: string;
  isActive?: boolean;
  className?: string;
}

export const CategoryPill = ({
  label,
  href,
  imageUrl,
  isActive,
  className,
}: CategoryPillProps) => {
  return (
    <LocaleLink
      href={href}
      className={cn(
        'group flex items-center gap-2 rounded-full border px-4 py-2 transition-all hover:border-primary hover:shadow-sm',
        isActive ? 'border-primary bg-primary/5 text-primary font-medium' : 'bg-background text-foreground',
        className
      )}
    >
      {imageUrl && (
        <div className="relative w-6 h-6 overflow-hidden rounded-full shrink-0 bg-muted">
          <Image
            src={imageUrl}
            alt={label}
            fill
            className="object-cover"
          />
        </div>
      )}
      <span className="text-sm whitespace-nowrap">{label}</span>
    </LocaleLink>
  );
};
