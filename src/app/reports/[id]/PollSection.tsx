"use client";

import { useState } from "react";
import { castPollVote } from "./actions";

interface PollOption {
    id: string;
    label: string;
}

interface PollSectionProps {
    reportId: string;
    options: PollOption[];
    initialResults: Record<string, number>;
    hasVoted: string | null;
    isLoggedIn: boolean;
}

export default function PollSection({
    reportId,
    options,
    initialResults,
    hasVoted,
    isLoggedIn
}: PollSectionProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(hasVoted);
    const [results, setResults] = useState(initialResults);

    const totalVotes = Object.values(results).reduce((a, b) => a + b, 0);

    async function handlePollVote(optionId: string) {
        if (!isLoggedIn) {
            setError("Log in to participate in actionable polls.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await castPollVote(reportId, optionId);
            setSelectedOption(optionId);
            setResults(prev => ({
                ...prev,
                [optionId]: (prev[optionId] || 0) + 1
            }));
        } catch (err: any) {
            setError(err.message || "Failed to submit poll vote");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-8 pt-12 pb-20 mt-12 border-t border-border-subtle">
            <div className="space-y-2">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-medium">Actionable Intelligence Poll</h3>
                <h4 className="text-lg font-bold text-white tracking-tight">Should the community mass-report this person&apos;s social accounts?</h4>
            </div>

            {error && (
                <div className="p-3 bg-surface border border-red-900/30 text-red-500 text-xs text-center">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {options.map((option) => {
                    const voteCount = results[option.id] || 0;
                    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                    const isSelected = selectedOption === option.id;

                    return (
                        <div key={option.id} className="space-y-2">
                            <button
                                disabled={loading || selectedOption !== null}
                                onClick={() => handlePollVote(option.id)}
                                className={`
                  w-full text-left p-4 border transition-all relative overflow-hidden group
                  ${isSelected ? 'border-white bg-surface' : 'border-border-subtle hover:border-muted-medium bg-transparent'}
                  ${selectedOption !== null && !isSelected ? 'opacity-60' : ''}
                `}
                            >
                                {/* Result Bar Background */}
                                {selectedOption !== null && (
                                    <div
                                        className="absolute inset-y-0 left-0 bg-white/5 transition-all duration-1000"
                                        style={{ width: `${percentage}%` }}
                                    />
                                )}

                                <div className="relative flex justify-between items-center z-10">
                                    <span className={`text-xs font-bold uppercase tracking-widest ${isSelected ? 'text-white' : 'text-muted-light group-hover:text-white'}`}>
                                        {option.label}
                                    </span>
                                    {selectedOption !== null && (
                                        <span className="text-[10px] font-mono text-muted-medium">
                                            {voteCount} • {percentage.toFixed(0)}%
                                        </span>
                                    )}
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>

            {selectedOption && (
                <p className="text-[10px] text-muted-dark font-bold uppercase tracking-widest text-center">
                    Submission Logged. Community consensus forming.
                </p>
            )}
        </div>
    );
}
