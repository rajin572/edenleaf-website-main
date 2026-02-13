import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/shared/Sidebar";
import DashboardTopBar from "@/components/shared/DashboardTopBar";
import { getCurrentUser } from "@/service/AuthService/AuthServiceAPi";

type MainLayoutProps = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

const MainLayout = async ({ children, params }: MainLayoutProps) => {
    const { locale } = await params;

    // A present-but-expired/invalid cookie must not render the shell only to
    // have every child fetch inside it 401 independently — one clean redirect
    // here instead. Next's fetch memoization means a child page calling
    // getCurrentUser() again costs nothing extra.
    const me = await getCurrentUser();
    if (!me?.success) {
        redirect(`/${locale}/sign-in`);
    }

    return (
        <SidebarProvider>
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
                <DashboardTopBar />
                <div className="flex min-w-0 flex-1 bg-background-color">
                    <main className="min-w-0 flex-1 h-[calc(100svh-64px)] overflow-y-auto scrollbar-none p-4 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default MainLayout;
