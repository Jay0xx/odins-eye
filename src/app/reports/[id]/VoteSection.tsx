"use client";

import { useState } from "react";
import { castVote } from "./actions";

interface VoteSectionProps {
    reportId: string;
    initialYes: number;
    initialNo: number;
    hasVoted: 'yes' | 'no' | null;
    isLoggedIn: boolean;
}

export default function VoteSection({
    reportId,
    initialYes,
    initialNo,
    hasVoted,
    isLoggedIn
}: VoteSectionProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userVote, setUserVote] = useState<'yes' | 'no' | null>(hasVoted);
    const [counts, setCounts] = useState({ yes: initialYes, no: initialNo });

    async function handleVote(type: 'yes' | 'no') {
        if (!isLoggedIn) {
            setError("You must be logged in to vote.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await castVote(reportId, type);
            setUserVote(type);
            setCounts(prev => ({
                ...prev,
                [type]: prev[type] + 1
            }));
        } catch (err: any) {
            setError(err.message || "Failed to submit vote");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6 pt-10 border-t border-border-subtle">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-medium">Bad Actor Verification</h3>
                    <p className="text-sm text-muted-light">Intelligence verification required. Cast your vote based on provided evidence.</p>
                </div>

                <div className="flex gap-8 text-xs font-mono">
                    <div className="flex flex-col items-center">
                        <span className="text-muted-dark text-[10px] uppercase font-bold tracking-widest mb-1">Confirmed</span>
                        <span className="text-white text-lg font-bold">{counts.yes}</span>
                    </div>
                    <div className="w-px h-10 bg-border-subtle" />
                    <div className="flex flex-col items-center">
                        <span className="text-muted-dark text-[10px] uppercase font-bold tracking-widest mb-1">Disputed</span>
                        <span className="text-white text-lg font-bold">{counts.no}</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-surface border border-red-900/30 text-red-500 text-xs text-center">
                    {error}
                </div>
            )}

            {userVote ? (
                <div className="p-4 bg-muted-dark/20 border border-border-subtle text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                        Verification Protocol Complete: You voted <span className={userVote === 'yes' ? 'text-white underline' : 'text-muted-light underline'}>{userVote === 'yes' ? 'YES' : 'NO'}</span>
                    </span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => handleVote('yes')}
                        disabled={loading}
                        className="group py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] hover:bg-muted-light transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading && <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />}
                        Confirm Bad Actor
                    </button>
                    <button
                        onClick={() => handleVote('no')}
                        disabled={loading}
                        className="group py-4 border border-border-subtle text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-surface transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        Dispute Evidence
                    </button>
                </div>
            )}
        </div>
    );
}
