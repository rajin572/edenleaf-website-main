"use client";

import React from 'react';
import LocaleLink from '@/components/i18n/LocaleLink';
import { Bell, Search, User } from 'lucide-react';
import { SidebarTrigger } from "@/components/ui/sidebar";

const DashboardTopBar = () => {
    return (
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-4 md:px-6">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-2" />
                <div className="hidden md:flex items-center bg-background border border-border rounded-lg px-3 py-1.5 focus-within:border-primary transition-colors">
                    <Search size={16} className="text-text-muted mr-2" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="bg-transparent border-none outline-none text-sm w-48 text-foreground"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button className="relative p-2 text-text-secondary hover:text-primary transition-colors rounded-full hover:bg-primary/5">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
                </button>
                
                <div className="h-5 w-px bg-border mx-1"></div>
                
                <LocaleLink href="/dashboard/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
                        {/* You can replace this with an actual Image component if user has avatar */}
                        <User size={16} />
                    </div>
                    <span className="text-sm font-semibold text-foreground hidden sm:block">Rahim Uddin</span>
                </LocaleLink>
            </div>
        </header>
    );
};

export default DashboardTopBar;
