import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import VoteSection from "./VoteSection";
import PollSection from "./PollSection";
import ConfirmButton from "./ConfirmButton";
import AdminOverrideButton from "./AdminOverrideButton";
import CommentsSection from "./CommentsSection";
import DeleteReportButton from "./DeleteReportButton";
import { getCommentsForReport } from "./comment-actions";

export default async function ReportDetailsPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch report details
    let { data: report, error } = await supabase
        .from("reports")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !report) {
        notFound();
    }

    // Fetch reporter profile
    const { data: reporterProfile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", report.user_id)
        .maybeSingle();

    // --- Expiration Logic ---
    const now = new Date();
    const expiresAt = report.expires_at ? new Date(report.expires_at) : null;

    let isExpired = report.status === 'expired' || (expiresAt && now > expiresAt && report.status !== 'fully_verified');

    if (isExpired && report.status !== 'expired') {
        await supabase.from("reports").update({ status: 'expired' }).eq("id", id);
        report.status = 'expired';
    }

    // Days remaining calculation
    const daysRemaining = expiresAt ? Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

    // --- User Data ---
    let userVote = null;
    let credibilityScore = 0;
    let isAdmin = false;
    if (user) {
        // Check vote
        const { data: voteData } = await supabase
            .from("votes")
            .select("vote_type")
            .eq("report_id", id)
            .eq("user_id", user.id)
            .single();
        userVote = voteData?.vote_type as 'yes' | 'no' | null;

        // Check credibility and admin status
        const { data: profile } = await supabase
            .from("profiles")
            .select("credibility_score, is_admin")
            .eq("id", user.id)
            .maybeSingle();
        credibilityScore = profile?.credibility_score || 0;
        isAdmin = profile?.is_admin || false;
    }

    // --- Poll Data ---
    const { data: pollResultsData } = await supabase
        .from("poll_votes")
        .select("option")
        .eq("report_id", id);

    const pollResults: Record<string, number> = {};
    pollResultsData?.forEach(v => {
        pollResults[v.option] = (pollResults[v.option] || 0) + 1;
    });

    let userPollVote = null;
    if (user) {
        const { data: pollData } = await supabase
            .from("poll_votes")
            .select("option")
            .eq("report_id", id)
            .eq("user_id", user.id)
            .single();
        userPollVote = pollData?.option || null;
    }

    // --- Aggregates for Verification Progress ---
    const vYes = report.vote_yes || 0;
    const vNo = report.vote_no || 0;
    const totalVotes = vYes + vNo;
    const yesPercentage = totalVotes > 0 ? (vYes / totalVotes) * 100 : 0;
    const margin = vYes - vNo;
    const isUnderReview = report.status === 'pending' && totalVotes > 0;
    const assetCount = (report.evidence_urls as string[])?.length || 0;
    const trustedCount = report.trusted_confirmations || 0;

    const isCommunityVerified = report.status === 'community_verified' || report.status === 'fully_verified';

    // Check if current user is the report owner
    const isOwner = user?.id === report.user_id;

    // Fetch comments
    const comments = await getCommentsForReport(id);

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
            <Link
                href="/reports"
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-medium hover:text-white transition-colors flex items-center gap-2 mb-8"
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Intelligence Feed
            </Link>

            {/* Status Banner */}
            <div className="bg-[#0a0a0a] border border-[#222222] p-8 md:p-12 text-center space-y-6 animate-in slide-in-from-top-4 duration-1000">
                <div className="flex justify-center">
                    <StatusBadge
                        status={report.status}
                        voteCount={totalVotes}
                        large
                        className="py-3 px-6 text-sm"
                    />
                </div>

                <div className="space-y-2 max-w-lg mx-auto">
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white">
                        {report.status === 'fully_verified' ? "Target Confirmed" :
                            report.status === 'community_verified' ? "Community Consensus Reached" :
                                isUnderReview ? "Active Investigation" :
                                    report.status === 'expired' ? "Dossier Deactivated" : "Pending Analysis"}
                    </h2>
                    <p className="text-xs md:text-sm text-[#777777] uppercase tracking-widest leading-relaxed">
                        {report.status === 'fully_verified' ? "This operative has been permanently flagged as a bad actor by multiple trusted sources." :
                            report.status === 'community_verified' ? "The community has reached high consensus regarding this evidence." :
                                isUnderReview ? "This report is undergoing active community verification. Voting is open." :
                                    report.status === 'expired' ? "This report has aged out without reaching the required verification threshold." :
                                        "Initial telemetry received. Awaiting first community impressions."}
                    </p>
                </div>

                {/* Progress enlargement for under review */}
                {isUnderReview && (
                    <div className="pt-4 flex justify-center gap-12 text-center font-mono">
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase text-[#555555] tracking-widest">Yes Votes</span>
                            <div className="text-2xl font-black text-white">{vYes}</div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase text-[#555555] tracking-widest">No Votes</span>
                            <div className="text-2xl font-black text-[#555555]">{vNo}</div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase text-[#555555] tracking-widest">Margin</span>
                            <div className="text-2xl font-black text-white">+{margin}</div>
                        </div>
                    </div>
                )}

                {/* Mass Reporting Call to Action */}
                {report.status === 'fully_verified' && (
                    <div className="pt-6 border-t border-[#1a1a1a] space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white animate-pulse">
                            RECOMMENDED ACTION: MASS REPORT ACCESS CHANNELS
                        </div>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#EEEEEE] transition-all">
                                External Report Protocol
                            </button>
                            <button className="px-8 py-3 border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all">
                                Blacklist Sync
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="space-y-3 flex-1">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white leading-tight">
                                {report.actor_name}
                            </h1>
                            <div className="flex flex-wrap gap-2">
                                <StatusBadge status={report.status} voteCount={totalVotes} />
                            </div>

                            {/* Action Buttons (owner of pending OR admin) */}
                            {user && (
                                <div className="flex items-center gap-2">
                                    {isOwner && report.status === 'pending' && (
                                        <Link
                                            href={`/reports/${id}/edit`}
                                            className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#777777] border border-[#333333] hover:bg-[#111111] hover:text-white transition-colors"
                                        >
                                            <svg
                                                width="12"
                                                height="12"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path>
                                            </svg>
                                            Edit
                                        </Link>
                                    )}
                                    <DeleteReportButton
                                        reportId={id}
                                        isOwner={isOwner}
                                        isAdmin={isAdmin}
                                        status={report.status}
                                    />
                                </div>
                            )}

                            {/* Expiration Info Section */}
                            <div className="pt-2 text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA]">
                                {report.status === 'fully_verified' ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                        Permanent record – no expiration
                                    </span>
                                ) : isExpired ? (
                                    <span className="text-red-500">
                                        Expired on {expiresAt?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. This report is closed.
                                    </span>
                                ) : (
                                    <span>
                                        Expires on {expiresAt?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        {daysRemaining !== null && ` (${daysRemaining} days remaining)`}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* --- Verification Progress Section --- */}
                        {!isExpired && report.status !== 'fully_verified' && (
                            <div className="w-full md:w-72 bg-surface/50 border border-border-subtle p-5 space-y-4 backdrop-blur-sm">
                                <div className="space-y-1">
                                    <h3 className="text-[10px] font-black uppercase text-muted-medium tracking-widest">Verification Status</h3>
                                    <p className="text-[11px] font-mono text-white font-bold">
                                        {vYes} Yes – {vNo} No ({yesPercentage.toFixed(0)}%) | Margin: +{margin}
                                    </p>
                                </div>
                                <div className="space-y-2 pt-2 border-t border-border-subtle/50">
                                    <ProgressItem label="30+ Votes" current={totalVotes} target={30} />
                                    <ProgressItem label="75%+ Approval" current={yesPercentage} target={75} suffix="%" />
                                    <ProgressItem label="15+ Margin" current={margin} target={15} />
                                    <ProgressItem label="3+ Evidence" current={assetCount} target={3} />
                                    <ProgressItem label="3+ Confirmations" current={trustedCount} target={3} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-[11px] font-mono text-muted-medium pt-4">
                        {report.wallet_address && (
                            <div className="bg-surface border border-border-subtle px-3 py-1.5 flex items-center gap-2">
                                <span className="text-muted-dark font-bold underline decoration-dotted">WALLET:</span>
                                <span className="text-white selection:bg-white selection:text-black">{report.wallet_address}</span>
                            </div>
                        )}

                        {report.social_links && Object.entries(report.social_links as Record<string, string>).map(([platform, handle]) => (
                            <div key={platform} className="bg-surface border border-border-subtle px-3 py-1.5 flex items-center gap-2 capitalize">
                                <span className="text-muted-dark font-bold">{platform}:</span>
                                <span className="text-white underline underline-offset-4">{handle}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-px bg-border-subtle" />

                <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-medium">Intelligence Dossier</h2>
                        {reporterProfile && (
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] uppercase tracking-widest text-[#555555]">Source:</span>
                                <Link
                                    href={`/profile/${reporterProfile.username || report.user_id}`}
                                    className="flex items-center gap-2 group"
                                >
                                    <div className="w-6 h-6 rounded-full bg-[#111111] border border-[#222222] overflow-hidden">
                                        {reporterProfile.avatar_url ? (
                                            <img src={reporterProfile.avatar_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-white">
                                                {(reporterProfile.username || 'A').charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[11px] font-bold text-[#AAAAAA] group-hover:text-white transition-colors">
                                        {reporterProfile.username || `Operative ${report.user_id.slice(0, 8)}`}
                                    </span>
                                </Link>
                            </div>
                        )}
                    </div>
                    <p className="text-lg text-white leading-relaxed font-medium selection:bg-white selection:text-black whitespace-pre-wrap">
                        {report.description}
                    </p>
                </div>

                {/* Evidence Assets */}
                {assetCount > 0 && (
                    <div className="space-y-6 pt-10">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-medium">Physical Evidence ({assetCount})</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {(report.evidence_urls as string[]).map((url, i) => {
                                const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                                return (
                                    <div key={i} className="group aspect-square bg-surface border border-border-subtle overflow-hidden relative">
                                        {isImage ? (
                                            <a href={url} target="_blank" rel="noreferrer" className="block w-full h-full">
                                                <img
                                                    src={url}
                                                    alt={`Evidence asset ${i + 1}`}
                                                    className="object-cover w-full h-full grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                                />
                                            </a>
                                        ) : (
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center hover:bg-white/5 transition-colors"
                                            >
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-dark group-hover:text-white transition-colors">
                                                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                                    <polyline points="13 2 13 9 20 9"></polyline>
                                                </svg>
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-medium group-hover:text-white break-all">
                                                    FILE_{i + 1}
                                                </span>
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- Interactive Sections --- */}
                {!isExpired && (
                    <div className="space-y-12">
                        {/* 1. Base Voting (Disabled if fully verified) */}
                        <div className={`transition-opacity ${report.status === 'fully_verified' ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                            <VoteSection
                                reportId={id}
                                initialYes={report.vote_yes || 0}
                                initialNo={report.vote_no || 0}
                                hasVoted={userVote}
                                isLoggedIn={!!user}
                            />
                        </div>

                        {/* 2. High Clearance Confirmation */}
                        {report.status !== 'fully_verified' && (
                            <div className="pt-10 border-t border-border-subtle space-y-4 animate-in slide-in-from-bottom-5 duration-700">
                                {isAdmin ? (
                                    <div className="space-y-1">
                                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Central Intelligence Admin Override</h2>
                                        <p className="text-[10px] text-muted-medium uppercase font-bold tracking-widest">Immediate finalization protocol</p>
                                        <AdminOverrideButton reportId={id} />
                                    </div>
                                ) : credibilityScore >= 75 && (
                                    <>
                                        <div className="space-y-1">
                                            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Security Intelligence Confirmation</h2>
                                            <p className="text-[10px] text-muted-medium uppercase font-bold tracking-widest">Operation Odin&apos;s Eye - Trusted Access Only</p>
                                        </div>
                                        <ConfirmButton reportId={id} currentConfirmations={trustedCount} />
                                    </>
                                )}
                            </div>
                        )}

                        {/* 3. Community Actions (Opinion Poll + Report Buttons) */}
                        {isCommunityVerified && (
                            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                                <PollSection
                                    reportId={id}
                                    options={[
                                        { id: "yes_all", label: "Execute Mass Report Protocol" },
                                        { id: "yes_some", label: "Report on Primary Socials Only" },
                                        { id: "no", label: "De-escalate Investigation" },
                                        { id: "not_sure", label: "Await More Intelligence" },
                                    ]}
                                    initialResults={pollResults}
                                    hasVoted={userPollVote}
                                    isLoggedIn={!!user}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* --- Expired State UI --- */}
                {isExpired && (
                    <div className="mt-20 p-12 border border-red-900/30 bg-red-900/5 text-center backdrop-blur-sm">
                        <div className="w-16 h-16 border-2 border-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </div>
                        <h2 className="text-2xl font-black uppercase text-red-500 tracking-[0.4em] mb-4">Intelligence Life-Cycle Ended</h2>
                        <p className="text-[11px] text-muted-medium uppercase font-bold tracking-[0.3em] max-w-sm mx-auto leading-relaxed">
                            This report has exceeded the strictly monitored 90-day activity protocol without reaching permanent verification status. Archive access only.
                        </p>
                    </div>
                )}

                {/* --- Comments Section --- */}
                <CommentsSection
                    reportId={id}
                    comments={comments}
                    currentUserId={user?.id}
                    isAdmin={isAdmin}
                />
            </div>
        </div>
    );
}

function ProgressItem({ label, current, target, suffix = "" }: { label: string, current: number, target: number, suffix?: string }) {
    const isMet = current >= target;
    const progress = Math.min((current / target) * 100, 100);

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                <span className={isMet ? "text-white" : "text-muted-dark"}>
                    {isMet && "✓ "}{label}
                </span>
                <span className={isMet ? "text-white" : "text-muted-medium"}>{current.toFixed(0)}{suffix}</span>
            </div>
            <div className="h-0.5 bg-muted-dark/20 border-border-subtle/20 overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ${isMet ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'bg-muted-dark'}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
