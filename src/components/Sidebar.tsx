"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import UserSearch from "./UserSearch";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    profile: { username: string; avatar_url: string | null; is_admin?: boolean } | null;
}

export default function Sidebar({ isOpen, onClose, user, profile }: SidebarProps) {
    const pathname = usePathname();

    const navItems = [
        { name: "Home", href: "/" },
        { name: "Reports", href: "/reports" },
        { name: "Verified", href: "/verified" },
        { name: "Submit Report", href: "/submit" },
        { name: "User Rankings", href: "/leaderboard" },
    ];

    if (user) {
        navItems.push({ name: "My Reports", href: "/my-reports" });
        navItems.push({ name: "Profile", href: "/profile" });
    }

    return (
        <aside
            className={`
        fixed md:sticky top-[56px] left-0 bottom-0 z-40
        w-[240px] bg-background border-r border-border-subtle
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
        >
            <div className="md:hidden px-3 pt-4 pb-2">
                <UserSearch />
            </div>
            <nav className="flex-1 py-4 overflow-y-auto">
                <ul className="space-y-1 px-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={onClose}
                                    className={`
                    flex items-center px-3 py-2 text-sm font-medium
                    transition-colors
                    ${isActive
                                            ? "text-foreground bg-sidebar-hover"
                                            : "text-muted-light hover:text-foreground hover:bg-sidebar-hover"}
                  `}
                                >
                                    {item.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <div className="p-4 border-t border-border-subtle">
                <div className="text-[10px] uppercase tracking-wider text-muted-dark font-bold">
                    System Status: Active
                </div>
            </div>
        </aside>
    );
}
