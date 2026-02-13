"use client";

import Image from "next/image";
import LocaleLink from '@/components/i18n/LocaleLink';
import { useCurrentLocale } from "@/components/i18n/LocaleLink";
import { localizePath } from "@/i18n/config";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  MapPin,
  User,
  LogOut,
  Star,
  Ticket
} from "lucide-react";
import { AllImages } from "../../../public/images/AllImages";
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
  { label: "Saved Addresses", href: "/dashboard/address", icon: MapPin },
  { label: "My Reviews", href: "/dashboard/reviews", icon: Star },
  { label: "My Coupons", href: "/dashboard/coupons", icon: Ticket },
  { label: "Profile Settings", href: "/dashboard/profile", icon: User },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const locale = useCurrentLocale();

  return (
    <SidebarPrimitive collapsible="icon">
      <SidebarHeader className="items-center py-4">
        <LocaleLink href="/" className="flex items-center justify-center">
          <Image
            src={AllImages.logo}
            alt="Ednleaf"
            className="h-20 w-auto group-data-[collapsible=icon]:hidden"
            priority
          />
          <Image
            src={AllImages.logo}
            alt="Ednleaf"
            className="hidden h-auto w-7 shrink-0 group-data-[collapsible=icon]:block object-cover object-left"
            priority
          />
        </LocaleLink>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarMenu className="gap-1.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === localizePath(href, locale);
            return (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton
                  render={<LocaleLink href={href} />}
                  isActive={isActive}
                  tooltip={label}
                  size="lg"
                  className="gap-3 rounded-xl px-4 text-[15px] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-full [&_svg]:size-5"
                >
                  <Icon strokeWidth={isActive ? 2.5 : 2} />
                  <span
                    className={`group-data-[collapsible=icon]:hidden ${isActive ? "font-semibold" : "font-medium"}`}
                  >
                    {label}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="pb-4">
        <LocaleLink
          href="/sign-in"
          className="flex items-center justify-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-[15px] font-semibold text-destructive transition-colors hover:bg-destructive hover:text-white group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:rounded-md group-data-[collapsible=icon]:p-0 mx-2"
        >
          <LogOut className="size-5" />
          <span className="group-data-[collapsible=icon]:hidden">Logout</span>
        </LocaleLink>
      </SidebarFooter>
    </SidebarPrimitive>
  );
}
