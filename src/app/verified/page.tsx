import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function VerifiedPage() {
    const supabase = await createClient();

    // Only show community_verified and fully_verified reports (exclude expired)
    const nowIso = new Date().toISOString();
    const { data: reports, error } = await supabase
        .from("reports")
        .select("*")
        .in("status", ["community_verified", "fully_verified"])
        .or(`expires_at.gt.${nowIso},status.eq.fully_verified`)
        .order("trusted_confirmations", { ascending: false })
        .order("vote_yes", { ascending: false });

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                    Verified Reports
                </h1>
                <p className="text-[#AAAAAA] max-w-2xl text-lg">
                    These reports have been verified through community voting and trusted confirmations.
                </p>
            </div>

            {!reports || reports.length === 0 ? (
                <div className="py-24 text-center border border-[#222222] bg-[#0a0a0a]">
                    <p className="text-[#AAAAAA] text-lg">
                        No verified reports yet.
                    </p>
                    <Link
                        href="/reports"
                        className="mt-6 inline-block px-8 py-4 border border-[#222222] text-white hover:bg-[#111111] transition-colors"
                    >
                        View All Reports
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className={`
                bg-[#0a0a0a] border p-8 flex flex-col justify-between
                ${report.status === 'fully_verified' ? 'border-white' : 'border-[#222222]'}
              `}
                        >
                            <div className="flex flex-col h-full">
                                {/* Status badge */}
                                <div>
                                    <div
                                        className={`
                      inline-block px-3 py-1 text-xs font-medium uppercase tracking-wide
                      ${report.status === 'fully_verified' ? 'bg-white text-black' : 'bg-[#222222] text-white'}
                    `}
                                    >
                                        {report.status === 'fully_verified' ? 'Fully Verified' : 'Community Verified'}
                                    </div>
                                </div>

                                <div className="space-y-6 mt-6 flex-grow">
                                    <h2 className="text-3xl font-bold text-white">
                                        {report.actor_name}
                                    </h2>

                                    <div className="text-sm text-[#AAAAAA]">
                                        {report.trusted_confirmations || 0} trusted confirmations • {report.vote_yes} yes votes
                                    </div>

                                    <p className="text-[#AAAAAA] leading-relaxed line-clamp-3">
                                        {report.description}
                                    </p>
                                </div>

                                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                                    <a
                                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                                            `Warning: ${report.actor_name} has been verified as a potential threat. Details: `
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-4 bg-white text-black font-medium text-center hover:bg-gray-200 transition-colors"
                                    >
                                        Report on X
                                    </a>
                                    <Link
                                        href={`/reports/${report.id}`}
                                        className="flex-1 py-4 border border-[#222222] text-white text-center hover:bg-[#111111] transition-colors"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
