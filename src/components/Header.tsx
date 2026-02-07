"use client";

import Link from "next/link";
import { logout } from "@/app/auth/actions";
import { User } from "@supabase/supabase-js";
import UserSearch from "./UserSearch";

export default function Header({
    onMenuClick,
    user,
    profile
}: {
    onMenuClick: () => void;
    user: User | null;
    profile: { username: string; avatar_url: string | null; is_admin?: boolean } | null;
}) {
    return (
        <header className="h-[56px] border-b border-border-subtle bg-background fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-1 -ml-1 text-muted-light hover:text-foreground transition-colors"
                    aria-label="Open menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <Link href="/" className="text-xl font-bold text-foreground">
                    Odin&apos;s Eye
                </Link>
            </div>

            <div className="hidden md:block flex-1 max-w-md mx-4">
                <UserSearch />
            </div>

            <div className="flex items-center gap-3">
                {user ? (
                    <>
                        <Link
                            href="/profile"
                            className="flex items-center gap-2 group p-1 -mr-1"
                        >
                            <span className="text-[10px] font-bold text-muted-medium group-hover:text-white transition-colors hidden sm:block">
                                {profile?.username || user.email}
                                {profile?.is_admin && (
                                    <span className="ml-2 bg-[#222222] text-[#AAAAAA] px-1 text-[8px] tracking-tighter">ADM</span>
                                )}
                            </span>
                            <div className="w-8 h-8 rounded-full border border-border-subtle overflow-hidden bg-surface group-hover:border-white transition-colors flex items-center justify-center">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] font-black uppercase text-muted-dark">
                                        {(profile?.username || "A").charAt(0)}
                                    </span>
                                )}
                            </div>
                        </Link>
                        <button
                            onClick={() => logout()}
                            className="px-3 py-1.5 text-xs font-bold border border-border-subtle hover:bg-surface transition-colors uppercase tracking-widest"
                        >
                            Log Out
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="px-3 py-1.5 text-xs font-bold border border-border-subtle hover:bg-surface transition-colors uppercase tracking-widest"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/signup"
                            className="px-3 py-1.5 text-xs font-bold border border-border-subtle hover:bg-surface transition-colors uppercase tracking-widest"
                        >
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}
