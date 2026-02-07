import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function LeaderboardPage() {
    const supabase = await createClient();

    // Fetch top 50 users sorted by level, then xp, then credibility
    const { data: topUsers, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, level, xp, credibility_score, is_admin")
        .order("level", { ascending: false })
        .order("xp", { ascending: false })
        .order("credibility_score", { ascending: false })
        .limit(50);

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
            <div className="space-y-3">
                <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
                    User Rankings
                </h1>
                <p className="text-[#AAAAAA] text-sm uppercase tracking-widest leading-relaxed">
                    Global ranking of the most active community Investigators.
                </p>
            </div>

            <div className="bg-[#0a0a0a] border border-[#222222] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[#222222] bg-[#111111]">
                            <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-[#555555] font-black w-16">Rank</th>
                            <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-[#555555] font-black">Operative</th>
                            <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-[#555555] font-black text-center">Level</th>
                            <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-[#555555] font-black text-center">Credibility</th>
                            <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-[#555555] font-black text-right">XP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topUsers?.map((user, index) => (
                            <tr
                                key={user.id}
                                className="group border-b border-[#111111] hover:bg-[#111111] transition-colors"
                            >
                                <td className="py-5 px-6 font-mono text-sm text-[#444444]">
                                    #{index + 1}
                                </td>
                                <td className="py-5 px-6">
                                    <Link
                                        href={`/profile/${user.username || user.id}`}
                                        className="flex items-center gap-3 group/link"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[#111111] border border-[#222222] flex-shrink-0 overflow-hidden">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} className="w-full h-full object-cover grayscale group-hover/link:grayscale-0 transition-all" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white">
                                                    {user.username?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-[#AAAAAA] group-hover/link:text-white transition-colors">
                                                {user.username || 'Anonymous'}
                                            </span>
                                            {user.is_admin && (
                                                <span className="text-[8px] font-black text-white bg-[#222222] px-1 w-fit mt-0.5">ADMIN</span>
                                            )}
                                        </div>
                                    </Link>
                                </td>
                                <td className="py-5 px-6 text-center">
                                    <span className="text-sm font-mono text-white">
                                        LVL {user.level}
                                    </span>
                                </td>
                                <td className="py-5 px-6 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="h-1 w-16 bg-[#111111]">
                                            <div
                                                className="h-full bg-white opacity-50 transition-all"
                                                style={{ width: `${user.is_admin ? 100 : user.credibility_score}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-mono text-[#555555]">
                                            {user.is_admin ? "100" : user.credibility_score}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-5 px-6 text-right">
                                    <span className="text-sm font-mono font-bold text-white tracking-tighter">
                                        {user.xp.toLocaleString()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {(!topUsers || topUsers.length === 0) && (
                    <div className="py-20 text-center">
                        <p className="text-[11px] uppercase tracking-widest text-[#444444] font-bold">
                            No data synchronized from the network.
                        </p>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="bg-[#111111] border border-[#222222] p-6 space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white">XP Acquisition</h4>
                    <p className="text-[11px] text-[#777777] leading-relaxed">
                        Earn XP by submitting confirmed reports (+40), getting reports community verified (+250), or reaching full verification (+500).
                    </p>
                </div>
                <div className="bg-[#111111] border border-[#222222] p-6 space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Credibility</h4>
                    <p className="text-[11px] text-[#777777] leading-relaxed">
                        Reputation score based on community feedback. High credibility increases the weight of your votes in verification protocols.
                    </p>
                </div>
                <div className="bg-[#111111] border border-[#222222] p-6 space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Promotion</h4>
                    <p className="text-[11px] text-[#777777] leading-relaxed">
                        Level up as you accumulate XP. Higher levels unlock advanced platform features and increased network influence.
                    </p>
                </div>
            </div>
        </div>
    );
}
