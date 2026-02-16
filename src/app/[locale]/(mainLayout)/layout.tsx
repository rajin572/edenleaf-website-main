import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import { getCategories } from "@/service/CatalogService/catalogApi";
import React from "react";

/**
 * The category tree is read once here, on the server, and handed to the header.
 * The navbar, the mobile drawer and the `/category/*` routes therefore share one
 * source of slugs — a link can never point at a category page that isn't there.
 */
const MainLayout = async ({ children }: { children: React.ReactNode }) => {
    const categories = await getCategories();

    return (
        <div className="flex flex-col min-h-screen">
            <Header categories={categories} />
            <main className="grow pt-[70px] lg:pt-[112px] md:pb-0 min-h-screen">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
