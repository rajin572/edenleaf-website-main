"use client";
import Image from "next/image";
import { AllImages } from "../../../public/images/AllImages";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "../ui/sidebar";
import { NavGroup } from "./nav-group";
import { NavUser } from "./nav-user";
import { IJwtPayload } from "@/types";
import { LayoutDashboard } from "lucide-react";

export function AppSidebar() {
  const userData = {
    userId: "1234567890",
    role: "admin",
    fullName: "John Doe",
    profileImage: undefined,
    coverPhoto: null,
    email: "h7HsH@example.com",
  } as unknown as IJwtPayload;
  // const userData: IJwtPayload | null = useUserData();


  const adminRoutes = [
    {
      title: "",
      items: [
        {
          title: "Dashboard",
          icon: LayoutDashboard,
          url: "/",
        },
        {
          title: "Users",
          icon: LayoutDashboard,
          url: "/users",
        }
      ]
    }];

  return (
    <Sidebar collapsible={"icon"} variant={"sidebar"}>
      <SidebarHeader className="overflow-hidden">
        <div className="flex items-start justify-center w-fit mx-auto">
          <Image src={AllImages.logo} alt="logo" className="max-w-40" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {adminRoutes?.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t-2 border-[#FFFFFF1A]">
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
