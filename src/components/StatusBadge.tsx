import React from 'react';

interface StatusBadgeProps {
    status: string;
    voteCount?: number;
    className?: string;
    large?: boolean;
}

export default function StatusBadge({ status, voteCount = 0, className = "", large = false }: StatusBadgeProps) {
    const isUnderReview = status === 'pending' && voteCount > 0;

    let label = status.replace('_', ' ');
    if (status === 'pending') {
        label = isUnderReview ? "Under Review" : "Pending";
    }

    const getIcon = () => {
        if (status === 'pending') {
            return (
                <svg width={large ? "14" : "10"} height={large ? "14" : "10"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
            );
        }
        if (status === 'community_verified' || status === 'fully_verified') {
            return (
                <svg width={large ? "14" : "14"} height={large ? "14" : "14"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            );
        }
        if (status === 'expired') {
            return (
                <svg width={large ? "14" : "10"} height={large ? "14" : "10"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            );
        }
        return null;
    };

    const baseStyles = large
        ? "text-[11px] font-black uppercase px-4 py-2 tracking-[0.2em] flex items-center gap-2"
        : "text-[9px] font-black uppercase px-2 py-1 tracking-tighter flex items-center gap-1.5";

    const variantStyles = () => {
        switch (status) {
            case 'fully_verified':
                return "bg-white text-black";
            case 'community_verified':
                return "bg-black border border-white text-white";
            case 'expired':
                return "bg-[#111111] border border-[#333333] text-[#555555]";
            case 'pending':
                return isUnderReview
                    ? "bg-[#222222] text-white border border-[#444444]"
                    : "bg-[#111111] text-[#777777] border border-[#222222]";
            default:
                return "bg-[#111111] text-muted-dark border border-border-subtle";
        }
    };

    return (
        <span className={`${baseStyles} ${variantStyles()} ${className}`}>
            {getIcon()}
            {label}
        </span>
    );
}
