import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import LocaleLink from '@/components/i18n/LocaleLink';

type TopNavProps = React.HTMLAttributes<HTMLElement> & {
  links: {
    title: string;
    href: string;
    isActive: boolean;
    disabled?: boolean;
  }[];
};

export function TopNav({ className, links, ...props }: TopNavProps) {
  return (
    <>
      <div className="lg:hidden">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            render={
              <Button size="icon" variant="outline" className="md:size-7" />
            }
          >
            <Menu />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start">
            {links.map(({ title, href, isActive, disabled }) => (
              <DropdownMenuItem
                key={`${title}-${href}`}
                disabled={disabled}
                render={
                  <LocaleLink
                    href={href}
                    className={!isActive ? "text-muted-foreground" : ""}
                  />
                }
              >
                {title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav
        className={cn(
          "hidden items-center space-x-4 lg:flex lg:space-x-4 xl:space-x-6",
          className
        )}
        {...props}
      >
        {links.map(({ title, href, isActive, disabled }) => (
          <LocaleLink
            key={`${title}-${href}`}
            href={href}
            className={`text-sm font-medium transition-colors hover:text-primary ${isActive ? "" : "text-muted-foreground"
              } ${disabled ? "pointer-events-none opacity-50" : ""}`}
          >
            {title}
          </LocaleLink>
        ))}
      </nav>
    </>
  );
}
