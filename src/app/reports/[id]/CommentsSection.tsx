"use client";

import { useState } from "react";
import Link from "next/link";
import { addComment, deleteComment, type Comment } from "./comment-actions";

interface CommentsProps {
    reportId: string;
    comments: Comment[];
    currentUserId?: string;
    isAdmin?: boolean;
}

function CommentItem({
    comment,
    reportId,
    currentUserId,
    isAdmin,
    depth = 0
}: {
    comment: Comment;
    reportId: string;
    currentUserId?: string;
    isAdmin?: boolean;
    depth?: number;
}) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canDelete = currentUserId && (comment.user_id === currentUserId || isAdmin);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("reportId", reportId);
        formData.append("commentText", replyText);
        formData.append("parentId", comment.id);

        try {
            const result = await addComment(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                setReplyText("");
                setShowReplyForm(false);
                window.location.reload();
            }
        } catch (err: any) {
            setError(err.message || "Failed to add reply");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Delete this comment?")) return;

        const result = await deleteComment(comment.id, reportId);
        if (result?.error) {
            alert(result.error);
        } else {
            window.location.reload();
        }
    };

    return (
        <div className={`${depth > 0 ? 'ml-8 border-l border-[#222222] pl-4' : ''}`}>
            <div className="py-4 border-b border-[#222222]">
                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <Link href={`/profile/${comment.author?.username || comment.user_id}`} className="w-8 h-8 rounded-full bg-[#222222] flex items-center justify-center flex-shrink-0 overflow-hidden hover:opacity-80 transition-opacity">
                        {comment.author?.avatar_url ? (
                            <img
                                src={comment.author.avatar_url}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-[10px] font-bold text-white">
                                {(comment.author?.username || '?').charAt(0).toUpperCase()}
                            </span>
                        )}
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/profile/${comment.author?.username || comment.user_id}`} className="text-[11px] font-bold text-white hover:underline">
                                {comment.author?.username || 'Unknown'}
                            </Link>
                            <span className="text-[10px] text-[#555555]">
                                {formatDate(comment.created_at)}
                            </span>
                        </div>
                        <p className="text-[13px] text-[#CCCCCC] mt-2 leading-relaxed whitespace-pre-wrap">
                            {comment.comment_text}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-4 mt-3">
                            {currentUserId && depth < 3 && (
                                <button
                                    onClick={() => setShowReplyForm(!showReplyForm)}
                                    className="text-[9px] font-bold uppercase tracking-widest text-[#555555] hover:text-white transition-colors"
                                >
                                    Reply
                                </button>
                            )}
                            {canDelete && (
                                <button
                                    onClick={handleDelete}
                                    className="text-[9px] font-bold uppercase tracking-widest text-[#555555] hover:text-white transition-colors"
                                >
                                    Delete
                                </button>
                            )}
                        </div>

                        {/* Reply Form */}
                        {showReplyForm && (
                            <form onSubmit={handleReply} className="mt-4 space-y-3">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write a reply..."
                                    rows={2}
                                    className="w-full bg-[#111111] border border-[#222222] p-3 text-white text-sm focus:border-white outline-none transition-colors resize-none"
                                />
                                {error && (
                                    <p className="text-[10px] font-bold text-red-500">{error}</p>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={loading || !replyText.trim()}
                                        className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-[#EEEEEE] disabled:opacity-50"
                                    >
                                        {loading ? "..." : "Reply"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowReplyForm(false)}
                                        className="px-4 py-2 border border-[#333333] text-[#777777] text-[10px] font-bold uppercase tracking-widest hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div>
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            reportId={reportId}
                            currentUserId={currentUserId}
                            isAdmin={isAdmin}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function CommentsSection({ reportId, comments, currentUserId, isAdmin }: CommentsProps) {
    const [commentText, setCommentText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("reportId", reportId);
        formData.append("commentText", commentText);

        try {
            const result = await addComment(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                setCommentText("");
                window.location.reload();
            }
        } catch (err: any) {
            setError(err.message || "Failed to add comment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-12 border-t border-[#222222] pt-8">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#777777] mb-6">
                Discussion ({comments.length})
            </h3>

            {/* Add Comment Form */}
            {currentUserId ? (
                <form onSubmit={handleSubmit} className="mb-8 bg-[#111111] border border-[#222222] p-4">
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Share your thoughts on this report..."
                        rows={3}
                        className="w-full bg-transparent text-white text-sm focus:outline-none resize-none placeholder-[#555555]"
                    />
                    {error && (
                        <p className="text-[10px] font-bold text-red-500 mb-3">{error}</p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-[9px] text-[#555555]">{commentText.length}/2000</span>
                        <button
                            type="submit"
                            disabled={loading || !commentText.trim()}
                            className="px-6 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-[#EEEEEE] disabled:opacity-50 transition-colors"
                        >
                            {loading ? "Posting..." : "Post Comment"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mb-8 bg-[#111111] border border-[#222222] p-4 text-center">
                    <p className="text-[11px] text-[#555555]">
                        <a href="/login" className="text-white hover:underline">Log in</a> to join the discussion
                    </p>
                </div>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
                <p className="text-[12px] text-[#555555] text-center py-8">No comments yet. Be the first to share your thoughts.</p>
            ) : (
                <div>
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            reportId={reportId}
                            currentUserId={currentUserId}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
