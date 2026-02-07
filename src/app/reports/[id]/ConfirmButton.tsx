"use client";

import { useState } from "react";
import { confirmLegitimate } from "./actions";

export default function ConfirmButton({ reportId, currentConfirmations }: { reportId: string, currentConfirmations: number }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleConfirm() {
        setLoading(true);
        setError(null);
        try {
            await confirmLegitimate(reportId);
        } catch (err: any) {
            setError(err.message || "Confirmation failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-4">
            {error && <p className="text-red-500 text-[10px] uppercase font-bold">{error}</p>}
            <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] hover:bg-muted-light transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
                {loading && <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />}
                Confirm Intelligence Legitimacy
            </button>
            <div className="flex justify-between items-center text-[10px] text-muted-dark font-black uppercase tracking-widest">
                <span>Trusted Confirmations</span>
                <span>{currentConfirmations}/3 Required for Full Verification</span>
            </div>
            <div className="h-1 bg-surface border border-border-subtle overflow-hidden">
                <div
                    className="h-full bg-white transition-all duration-1000"
                    style={{ width: `${Math.min((currentConfirmations / 3) * 100, 100)}%` }}
                />
            </div>
        </div>
    );
}
