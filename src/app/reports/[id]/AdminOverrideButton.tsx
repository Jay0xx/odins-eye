"use client";

import { useState } from "react";
import { adminVerifyReport } from "./actions";

export default function AdminOverrideButton({ reportId }: { reportId: string }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleOverride = async () => {
        if (!confirm("Execute Admin Override? This will permanently verify the report.")) return;

        setLoading(true);
        setError(null);
        try {
            await adminVerifyReport(reportId);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Override failed.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-white text-black text-[10px] font-black uppercase p-3 tracking-widest text-center animate-in fade-in">
                Report Fully Verified by Admin
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <button
                onClick={handleOverride}
                disabled={loading}
                className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] hover:bg-[#AAAAAA] transition-all disabled:opacity-50"
            >
                {loading ? "Executing..." : "Confirm as Legitimate (Admin Override)"}
            </button>
            {error && (
                <p className="text-red-500 text-[9px] font-bold uppercase tracking-widest text-center">{error}</p>
            )}
        </div>
    );
}
