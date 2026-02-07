"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

export default function ReportFilters({
    currentFilter,
    currentSearch,
    currentSort
}: {
    currentFilter: string;
    currentSearch: string;
    currentSort: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(currentSearch);

    // Debounced search logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== currentSearch) {
                updateParams("q", searchTerm);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, currentSearch]);

    const updateParams = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all" && value !== "newest") {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        // Reset success/deleted messages when filtering
        params.delete("success");
        params.delete("deleted");

        router.push(`/reports?${params.toString()}`);
    }, [searchParams, router]);

    const statuses = [
        { id: "all", label: "All Statuses" },
        { id: "under_review", label: "Under Review" },
        { id: "pending", label: "Pending" },
        { id: "community_verified", label: "Community Verified" },
        { id: "fully_verified", label: "Fully Verified" },
        { id: "dismissed", label: "Dismissed" },
        { id: "expired", label: "Expired" },
    ];

    const sorts = [
        { id: "newest", label: "Newest First" },
        { id: "oldest", label: "Oldest First" },
        { id: "most_yes", label: "Most Yes Votes" },
        { id: "most_no", label: "Most No Votes" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-muted-dark group-focus-within:text-white transition-colors">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search Actor Name, Wallet, or Intelligence..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#111111] border border-[#222222] pl-11 pr-4 py-4 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-white transition-all font-mono"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex flex-col gap-1.5 md:w-64">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-dark px-1">Filter Status</label>
                    <div className="relative">
                        <select
                            value={currentFilter}
                            onChange={(e) => updateParams("filter", e.target.value)}
                            className="w-full bg-[#111111] border border-[#222222] px-4 py-3 text-[11px] font-bold text-white appearance-none focus:outline-none focus:border-white transition-all uppercase cursor-pointer"
                        >
                            {statuses.map(s => (
                                <option key={s.id} value={s.id} className="bg-black text-white">{s.label}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-muted-dark">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Sort Filter */}
                <div className="flex flex-col gap-1.5 md:w-64">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-dark px-1">Order By</label>
                    <div className="relative">
                        <select
                            value={currentSort}
                            onChange={(e) => updateParams("sort", e.target.value)}
                            className="w-full bg-[#111111] border border-[#222222] px-4 py-3 text-[11px] font-bold text-white appearance-none focus:outline-none focus:border-white transition-all uppercase cursor-pointer"
                        >
                            {sorts.map(s => (
                                <option key={s.id} value={s.id} className="bg-black text-white">{s.label}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-muted-dark">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clear Filters (Desktop Inline) */}
            <div className="flex flex-wrap gap-2">
                {currentFilter !== "all" && (
                    <Badge label={`Status: ${currentFilter}`} onClear={() => updateParams("filter", "all")} />
                )}
                {currentSort !== "newest" && (
                    <Badge label={`Sorted: ${currentSort.replace('_', ' ')}`} onClear={() => updateParams("sort", "newest")} />
                )}
                {currentSearch && (
                    <Badge label={`Query: ${currentSearch}`} onClear={() => setSearchTerm("")} />
                )}
            </div>
        </div>
    );
}

function Badge({ label, onClear }: { label: string; onClear: () => void }) {
    return (
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#111111] border border-[#333333] text-[9px] font-black uppercase tracking-widest text-[#AAAAAA]">
            {label}
            <button onClick={onClear} className="hover:text-white transition-colors">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </span>
    );
}
