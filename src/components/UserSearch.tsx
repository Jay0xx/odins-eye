"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserResult {
    id: string;
    username: string;
    avatar_url: string | null;
    bio: string | null;
    level: number;
    credibility_score: number;
}

export default function UserSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<UserResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            const { data, error } = await supabase
                .from("profiles")
                .select("id, username, avatar_url, bio, level, credibility_score")
                .ilike("username", `%${query}%`)
                .limit(8);

            if (!error && data) {
                setResults(data as UserResult[]);
            }
            setLoading(false);
        };

        const debounceTimer = setTimeout(fetchUsers, 300);
        return () => clearTimeout(debounceTimer);
    }, [query, supabase]);

    return (
        <div className="relative flex-1 max-w-md" ref={dropdownRef}>
            <div className={`relative flex items-center bg-[#0a0a0a] border ${isOpen ? 'border-white' : 'border-[#222222]'} transition-all`}>
                <div className="pl-3 text-[#555555]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Locate operative by alias..."
                    className="w-full bg-transparent p-2 text-xs text-white placeholder-[#444444] outline-none font-mono"
                />
                {loading && (
                    <div className="pr-3">
                        <div className="w-3 h-3 border-t-2 border-white rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {isOpen && query.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#0a0a0a] border border-[#222222] shadow-2xl z-[100] animate-in fade-in slide-in-from-top-1 duration-200">
                    {results.length > 0 ? (
                        <div className="py-1">
                            {results.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => {
                                        router.push(`/profile/${user.username}`);
                                        setIsOpen(false);
                                        setQuery("");
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#111111] transition-colors border-b border-[#111111] last:border-0"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[#111111] border border-[#222222] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} className="w-full h-full object-cover grayscale" alt="" />
                                        ) : (
                                            <span className="text-[10px] font-bold text-[#555555]">
                                                {user.username.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-white truncate">
                                                {user.username}
                                            </span>
                                            <span className="text-[8px] font-mono text-[#555555] bg-[#222222] px-1">
                                                LVL {user.level}
                                            </span>
                                        </div>
                                        {user.bio && (
                                            <span className="text-[9px] text-[#777777] truncate w-full text-left">
                                                {user.bio}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : !loading ? (
                        <div className="p-4 text-center">
                            <span className="text-[10px] uppercase font-bold text-[#444444] tracking-widest">
                                Operative not found in registry.
                            </span>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
