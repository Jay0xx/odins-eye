import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import ReportFilters from "./ReportFilters";
import StatusBadge from "@/components/StatusBadge";

interface Report {
    id: string;
    created_at: string;
    actor_name: string;
    description: string;
    status: "pending" | "community_verified" | "fully_verified" | "dismissed" | "expired";
    vote_yes?: number;
    vote_no?: number;
    user_id: string;
}

export default async function ReportsPage({
    searchParams,
}: {
    searchParams: Promise<{
        success?: string;
        filter?: string;
        deleted?: string;
        q?: string;
        sort?: string;
    }>;
}) {
    const { success, filter, deleted, q, sort } = await searchParams;
    const currentFilter = filter || "all";
    const searchQuery = q || "";
    const currentSort = sort || "newest";

    const supabase = await createClient();

    // Base query
    let query = supabase
        .from("reports")
        .select("*, profiles(username)", { count: "exact" });

    // Status Filter
    if (currentFilter === "under_review") {
        query = query.eq("status", "pending").or("vote_yes.gt.0,vote_no.gt.0");
    } else if (currentFilter !== "all") {
        query = query.eq("status", currentFilter);
    }

    // Keyword Search
    if (searchQuery) {
        query = query.or(
            `actor_name.ilike.%${searchQuery}%,wallet_address.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
    }

    // Sorting
    switch (currentSort) {
        case "oldest":
            query = query.order("created_at", { ascending: true });
            break;
        case "most_yes":
            query = query.order("vote_yes", { ascending: false, nullsFirst: false });
            break;
        case "most_no":
            query = query.order("vote_no", { ascending: false, nullsFirst: false });
            break;
        case "newest":
        default:
            query = query.order("created_at", { ascending: false });
            break;
    }

    const { data: reports, error, count } = await query;

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-white">Reports</h1>
                <p className="text-[#AAAAAA]">All submitted reports, sorted and filtered as needed.</p>
            </div>

            {/* Success / Action Messages */}
            {success && (
                <div className="p-4 bg-white text-black text-sm font-medium text-center">
                    Report submitted successfully.
                </div>
            )}
            {deleted && (
                <div className="p-4 bg-[#111111] text-white text-sm font-medium text-center">
                    Report deleted.
                </div>
            )}

            {/* Filters */}
            <ReportFilters
                currentFilter={currentFilter}
                currentSearch={searchQuery}
                currentSort={currentSort}
            />

            {/* Results count & clear */}
            <div className="flex items-center justify-between text-sm text-[#AAAAAA] border-b border-[#222222] pb-4">
                <span>Total reports: {count || 0}</span>
                {(searchQuery || currentFilter !== "all") && (
                    <Link href="/reports" className="text-white hover:underline">
                        Clear filters
                    </Link>
                )}
            </div>

            {!reports || reports.length === 0 ? (
                <div className="py-20 text-center border border-[#222222] bg-[#0a0a0a]">
                    <p className="text-[#AAAAAA] text-lg">No reports found.</p>
                    <p className="mt-2 text-sm text-[#777777]">
                        Try adjusting your filters or search terms.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((report: Report) => (
                        <div
                            key={report.id}
                            className="bg-[#0a0a0a] border border-[#222222] p-6 flex flex-col justify-between hover:border-[#444444] transition-colors"
                        >
                            <div className="space-y-4">
                                {/* Status & Date */}
                                <div className="flex justify-between items-start">
                                    <StatusBadge
                                        status={report.status}
                                        voteCount={(report.vote_yes || 0) + (report.vote_no || 0)}
                                    />
                                    <span className="text-sm text-[#777777]">
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Title & Description */}
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white">{report.actor_name}</h3>
                                    <p className="text-sm text-[#AAAAAA] line-clamp-3 leading-relaxed">
                                        {report.description}
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-8 flex items-center justify-between text-sm text-[#AAAAAA] border-t border-[#222222] pt-4">
                                <div className="flex gap-4">
                                    <span>Yes: {report.vote_yes || 0}</span>
                                    <span>No: {report.vote_no || 0}</span>
                                </div>

                                <Link
                                    href={`/reports/${report.id}`}
                                    className="px-5 py-2 border border-[#222222] text-sm hover:bg-[#111111] transition-colors"
                                >
                                    View Report
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
