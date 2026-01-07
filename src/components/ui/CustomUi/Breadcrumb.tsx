import LocaleLink from "@/components/i18n/LocaleLink";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IBreadcrumbItem {
  label: string;
  /** Omit on the last crumb — the current page is not a link. */
  href?: string;
}

interface BreadcrumbProps {
  items: IBreadcrumbItem[];
  /** `t.common.breadcrumb` — the nav's accessible name. */
  label: string;
  className?: string;
}

/**
 * Server-safe: renders in a Server Component even though `LocaleLink` is a
 * Client Component, so the trail is in the first byte of HTML for crawlers.
 */
export const Breadcrumb = ({ items, label, className }: BreadcrumbProps) => (
  <nav aria-label={label} className={cn("mb-4", className)}>
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-text-secondary">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1">
            {item.href && !isLast ? (
              <LocaleLink
                href={item.href}
                className="hover:text-primary transition-colors"
              >
                {item.label}
              </LocaleLink>
            ) : (
              <span
                aria-current={isLast ? "page" : undefined}
                className="text-foreground font-medium line-clamp-1"
              >
                {item.label}
              </span>
            )}
            {!isLast && (
              <ChevronRight size={14} className="shrink-0 text-muted-foreground" />
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);
