"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ConfirmEmailPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleResend = async () => {
        if (!email) {
            setMessage({ type: 'error', text: 'No email address found.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            });

            if (error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'success', text: 'Confirmation email resent successfully.' });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to resend email.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full space-y-8 text-center animate-in fade-in duration-700">
                {/* Icon */}
                <div className="w-20 h-20 mx-auto border-2 border-[#333333] rounded-full flex items-center justify-center">
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white"
                    >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                </div>

                {/* Heading */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-black uppercase tracking-tight text-white">
                        Check Your Email
                    </h1>
                    <p className="text-[#AAAAAA] text-sm leading-relaxed">
                        We sent a confirmation link to{" "}
                        <span className="text-white font-bold">{email || "your email"}</span>.
                        <br />
                        Click it to verify your account and finish signing up.
                    </p>
                </div>

                {/* Spam Note */}
                <div className="bg-[#111111] border border-[#222222] p-4">
                    <p className="text-[11px] text-[#777777] uppercase tracking-widest font-bold">
                        Check your spam/junk folder if you don&apos;t see it
                    </p>
                </div>

                {/* Messages */}
                {message && (
                    <div className={`p-3 border text-sm ${message.type === 'success'
                            ? 'border-green-900/30 bg-green-900/10 text-green-500'
                            : 'border-red-900/30 bg-red-900/10 text-red-500'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-4 pt-4">
                    <button
                        onClick={handleResend}
                        disabled={loading || !email}
                        className="w-full py-4 bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-[#EEEEEE] transition-all disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Resend Confirmation Email"}
                    </button>

                    <Link
                        href="/login"
                        className="block w-full py-4 border border-[#333333] text-white font-bold uppercase text-xs tracking-widest hover:bg-[#111111] transition-all text-center"
                    >
                        Back to Login
                    </Link>
                </div>

                {/* Footer */}
                <p className="text-[10px] text-[#555555] pt-6">
                    Already confirmed?{" "}
                    <Link href="/login" className="text-[#AAAAAA] hover:text-white transition-colors">
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>
    );
}
