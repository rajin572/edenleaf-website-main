"use client";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import { IJwtPayload } from "@/types";
import { getServerUrl } from "@/helpers/config/envConfig";
import { logoutUser } from "@/service/AuthService/AuthServiceAPi";
import { AUTH_UPDATED_EVENT } from "@/hooks/useAuthUser";
import tryCatchWrapper from "@/utils/tryCatchWrapper";



export function NavUser({ user }: { user: IJwtPayload | null }) {
  const serverUrl = getServerUrl();
  const { isMobile } = useSidebar();
  const avatarFallback = user?.fullName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  const handleLogout = async () => {
    await tryCatchWrapper(logoutUser, undefined, { toastLoadingMessage: "Signing out..." });
    window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
    window.location.reload();
  };
  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                />
              }
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.profileImage ? serverUrl + user?.profileImage : undefined} alt={user?.fullName} />
                <AvatarFallback className="rounded-lg">{avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-semibold">{user?.fullName}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ms-auto size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.profileImage ? serverUrl + user?.profileImage : undefined} alt={user?.fullName} />
                    <AvatarFallback className="rounded-lg">{avatarFallback}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-start text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.fullName}</span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" className="cursor-pointer" onClick={handleLogout}>
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}

