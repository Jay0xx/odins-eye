"use client";

import { useState } from "react";
import Link from "next/link";
import { submitFeedback, type Feedback, type FeedbackSummary } from "./feedback-actions";

interface FeedbackSectionProps {
    targetUserId: string;
    feedback: Feedback[];
    summary: FeedbackSummary;
    currentUserId?: string;
}

export default function FeedbackSection({
    targetUserId,
    feedback,
    summary,
    currentUserId
}: FeedbackSectionProps) {
    const [showAll, setShowAll] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | 'neutral'>('positive');
    const [commentText, setCommentText] = useState("");
    const [relatedReportId, setRelatedReportId] = useState("");

    const displayedFeedback = showAll ? feedback : feedback.slice(0, 5);
    const canLeaveFeedback = currentUserId && currentUserId !== targetUserId;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("toUserId", targetUserId);
        formData.append("type", feedbackType);
        formData.append("commentText", commentText);
        if (relatedReportId) formData.append("relatedReportId", relatedReportId);

        try {
            const result = await submitFeedback(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                setSuccess(true);
                setIsModalOpen(false);
                setCommentText("");
                setRelatedReportId("");
                window.location.reload();
            }
        } catch (err: any) {
            setError(err.message || "Failed to submit feedback");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'positive':
                return <span className="text-[10px] font-black text-white border border-white px-1.5 py-0.5">+</span>;
            case 'negative':
                return <span className="text-[10px] font-black text-[#777777] border border-[#777777] px-1.5 py-0.5">−</span>;
            default:
                return <span className="text-[10px] font-black text-[#555555] border border-[#555555] px-1.5 py-0.5">•</span>;
        }
    };

    return (
        <div className="mt-10 w-full">
            {/* Section Header */}
            <div className="border-t border-[#222222] pt-8">
                <div className="flex items-center justify-end mb-6">
                    {canLeaveFeedback && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-[10px] font-bold uppercase tracking-widest text-white border border-[#333333] px-4 py-2 hover:bg-[#111111] transition-colors"
                        >
                            Leave Feedback
                        </button>
                    )}
                </div>

                {/* Summary Stats */}
                <div className="bg-[#111111] border border-[#222222] p-4 mb-6">
                    <div className="flex items-center gap-6 text-[11px] font-mono">
                        <span className="text-white font-bold">{summary.total} feedback</span>
                        <span className="text-[#AAAAAA]">{summary.positive} positive</span>
                        <span className="text-[#777777]">{summary.negative} negative</span>
                        <span className="text-[#555555]">{summary.neutral} neutral</span>
                    </div>
                </div>

                {/* Feedback List */}
                {feedback.length === 0 ? (
                    <p className="text-[12px] text-[#555555] text-center py-8">No feedback yet.</p>
                ) : (
                    <div className="space-y-0">
                        {displayedFeedback.map((item) => (
                            <div key={item.id} className="border-b border-[#222222] py-4 first:pt-0">
                                <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    <Link href={`/profile/${item.from_profile?.username || item.from_user_id}`} className="w-8 h-8 rounded-full bg-[#222222] flex items-center justify-center flex-shrink-0 overflow-hidden hover:opacity-80 transition-opacity">
                                        {item.from_profile?.avatar_url ? (
                                            <img
                                                src={item.from_profile.avatar_url}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-[10px] font-bold text-white">
                                                {(item.from_profile?.username || '?').charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </Link>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Link href={`/profile/${item.from_profile?.username || item.from_user_id}`} className="text-[11px] font-bold text-white hover:underline">
                                                {item.from_profile?.username || 'Unknown'}
                                            </Link>
                                            {getTypeBadge(item.type)}
                                            <span className="text-[10px] text-[#555555]">
                                                {formatDate(item.created_at)}
                                            </span>
                                            {item.related_report_id && (
                                                <a
                                                    href={`/reports/${item.related_report_id}`}
                                                    className="text-[9px] font-bold text-[#777777] hover:text-white uppercase tracking-widest transition-colors"
                                                >
                                                    View Report
                                                </a>
                                            )}
                                        </div>
                                        {item.comment_text && (
                                            <p className="text-[12px] text-[#AAAAAA] mt-2 leading-relaxed">
                                                {item.comment_text}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Show More */}
                {feedback.length > 5 && !showAll && (
                    <button
                        onClick={() => setShowAll(true)}
                        className="w-full py-3 mt-4 text-[10px] font-bold uppercase tracking-widest text-[#777777] hover:text-white border border-[#222222] hover:bg-[#111111] transition-colors"
                    >
                        Show All ({feedback.length})
                    </button>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-black border border-[#333333] w-full max-w-md">
                        <div className="border-b border-[#222222] p-4 flex items-center justify-between">
                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-white">
                                Leave Feedback
                            </h4>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-[#777777] hover:text-white text-lg"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Type Selection */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#777777]">
                                    Type
                                </label>
                                <div className="flex gap-2">
                                    {(['positive', 'negative', 'neutral'] as const).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFeedbackType(type)}
                                            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border transition-colors ${feedbackType === type
                                                ? 'bg-white text-black border-white'
                                                : 'border-[#333333] text-[#777777] hover:text-white'
                                                }`}
                                        >
                                            {type === 'positive' && '+'}
                                            {type === 'negative' && '−'}
                                            {type === 'neutral' && '•'} {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comment */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#777777]">
                                        Comment {feedbackType === 'negative' && <span className="text-white">(required, 50+ chars)</span>}
                                    </label>
                                    <span className="text-[9px] text-[#555555]">{commentText.length}</span>
                                </div>
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Share your experience..."
                                    rows={4}
                                    className="w-full bg-[#111111] border border-[#222222] p-4 text-white text-sm focus:border-white outline-none transition-colors resize-none"
                                />
                            </div>

                            {/* Related Report */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#777777]">
                                    Related Report ID (optional)
                                </label>
                                <input
                                    type="text"
                                    value={relatedReportId}
                                    onChange={(e) => setRelatedReportId(e.target.value)}
                                    placeholder="UUID of related report"
                                    className="w-full bg-[#111111] border border-[#222222] p-4 text-white text-sm focus:border-white outline-none transition-colors font-mono"
                                />
                            </div>

                            {error && (
                                <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 text-center">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-[#EEEEEE] transition-all disabled:opacity-50"
                            >
                                {loading ? "Submitting..." : "Submit Feedback"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
