import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

export default async function MyReportsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: reports, error } = await supabase
        .from("reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching user reports:", error);
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
            <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight uppercase text-white">My Reports</h1>
                <p className="text-muted-light">Operational dossiers initialized by your node.</p>
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#444444] border-b border-[#111111] pb-4">
                <span>Personal Intelligence: {reports?.length || 0} Records</span>
                <Link href="/submit" className="text-white hover:underline transition-all">Submit New Dossier +</Link>
            </div>

            {!reports || reports.length === 0 ? (
                <div className="py-32 text-center border border-[#111111] bg-[#0a0a0a] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <p className="text-[#555555] uppercase font-bold text-[10px] tracking-[0.3em]">
                        You haven&apos;t submitted any reports yet.
                    </p>
                    <Link
                        href="/submit"
                        className="mt-10 inline-block px-12 py-4 bg-white text-black font-black uppercase text-[11px] tracking-[0.3em] hover:bg-[#EEEEEE] transition-all"
                    >
                        Submit a Report
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className="bg-[#0a0a0a] border border-[#111111] p-8 flex flex-col justify-between hover:border-[#333333] transition-all group relative overflow-hidden"
                        >
                            {/* Accent Line */}
                            <div className="absolute top-0 left-0 w-[2px] h-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <StatusBadge
                                        status={report.status}
                                        voteCount={(report.vote_yes || 0) + (report.vote_no || 0)}
                                    />
                                    <span className="text-[9px] text-[#333333] font-mono uppercase tracking-widest">
                                        ID_{report.id.slice(0, 8)}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-white uppercase group-hover:tracking-wider transition-all duration-500">
                                        {report.actor_name}
                                    </h3>
                                    <p className="text-sm text-[#AAAAAA] line-clamp-2 leading-relaxed italic">
                                        &quot;{report.description}&quot;
                                    </p>
                                    <div className="text-[9px] text-[#444444] font-bold uppercase pt-2">
                                        SUBMITTED: {new Date(report.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 space-y-6">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#555555] border-t border-[#111111] pt-6 group-hover:text-[#AAAAAA] transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1 w-1 bg-green-500/50" />
                                        Yes: {report.vote_yes || 0}
                                    </div>
                                    <div className="w-px h-3 bg-[#222222]" />
                                    <div className="flex items-center gap-2">
                                        <div className="h-1 w-1 bg-red-500/50" />
                                        No: {report.vote_no || 0}
                                    </div>
                                </div>

                                <Link
                                    href={`/reports/${report.id}`}
                                    className="block w-full text-center py-4 border border-[#222222] text-[#AAAAAA] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black hover:border-white transition-all"
                                >
                                    View Detailed Intelligence
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
