"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteReport } from "./actions";

interface DeleteReportButtonProps {
    reportId: string;
    isOwner: boolean;
    isAdmin: boolean;
    status: string;
}

export default function DeleteReportButton({
    reportId,
    isOwner,
    isAdmin,
    status
}: DeleteReportButtonProps) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Only show if owner of pending report OR admin
    const canDelete = (isOwner && status === 'pending') || isAdmin;

    if (!canDelete) return null;

    const handleDelete = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await deleteReport(reportId);
            if (result?.error) {
                setError(result.error);
            } else {
                router.push("/reports?deleted=true");
            }
        } catch (err: any) {
            setError(err.message || "Failed to delete report");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
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
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                {isAdmin && !isOwner ? "Delete (Admin)" : "Delete"}
            </button>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-[#111111] border border-[#222222] w-full max-w-md animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="border-b border-[#222222] p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 border border-[#333333] rounded-full flex items-center justify-center">
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-white"
                                    >
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                        <line x1="12" y1="9" x2="12" y2="13"></line>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                    </svg>
                                </div>
                                <h4 className="text-lg font-black uppercase tracking-tight text-white">
                                    Delete this report?
                                </h4>
                            </div>
                            <p className="text-[12px] text-[#AAAAAA] leading-relaxed">
                                This will permanently remove the report, all evidence files, votes, and comments.
                                This action cannot be undone.
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="px-6 pt-4">
                                <p className="text-[11px] font-bold text-red-500 bg-red-900/10 border border-red-900/30 p-3">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="p-6 flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={loading}
                                className="flex-1 py-3 border border-[#333333] text-white font-bold uppercase text-[10px] tracking-widest hover:bg-[#222222] transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex-1 py-3 bg-white text-black font-bold uppercase text-[10px] tracking-widest hover:bg-[#EEEEEE] transition-colors disabled:opacity-50"
                            >
                                {loading ? "Deleting..." : "Delete Report"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
