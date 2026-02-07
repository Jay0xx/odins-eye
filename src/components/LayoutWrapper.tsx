"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { User } from "@supabase/supabase-js";

export default function LayoutWrapper({
    children,
    user,
    profile
}: {
    children: React.ReactNode;
    user: User | null;
    profile: { username: string; avatar_url: string | null; is_admin?: boolean } | null;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} user={user} profile={profile} />

            <div className="flex flex-1 pt-[56px]">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} profile={profile} />

                <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0">
                    {children}
                </main>
            </div>

            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
