"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { addXP } from "@/utils/gamification";

export async function castVote(reportId: string, voteType: 'yes' | 'no') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Fetch report state before vote
    const { data: reportBefore } = await supabase
        .from("reports")
        .select("status, user_id")
        .eq("id", reportId)
        .single();

    // Insert vote
    const { error: voteError } = await supabase
        .from("votes")
        .insert({
            user_id: user.id,
            report_id: reportId,
            vote_type: voteType,
        });

    if (voteError) {
        if (voteError.code === '23505') throw new Error("You have already voted on this report.");
        throw voteError;
    }

    // Check if status transitioned to community_verified (triggered by DB)
    const { data: reportAfter } = await supabase
        .from("reports")
        .select("status")
        .eq("id", reportId)
        .single();

    if (reportBefore && reportAfter && reportBefore.status === 'pending' && reportAfter.status === 'community_verified') {
        await addXP(reportBefore.user_id, 250);
    }

    revalidatePath(`/reports/${reportId}`);
    revalidatePath("/reports");
    revalidatePath("/verified");
}

export async function confirmLegitimate(reportId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Check user credibility and admin status
    const { data: profile } = await supabase
        .from("profiles")
        .select("credibility_score, is_admin")
        .eq("id", user.id)
        .single();

    if (!profile || ((profile.credibility_score || 0) < 75 && !profile.is_admin)) {
        throw new Error("High-level clearance required for this action.");
    }

    const { data: report } = await supabase
        .from("reports")
        .select("trusted_confirmations, status, user_id")
        .eq("id", reportId)
        .single();

    if (report) {
        const oldStatus = report.status;
        if (profile.is_admin) {
            // Admin override: Direct verification
            const { error } = await supabase
                .from("reports")
                .update({
                    status: 'fully_verified',
                    expires_at: null,
                    trusted_confirmations: (report.trusted_confirmations || 0) + 1
                })
                .eq("id", reportId);

            if (error) throw error;

            if (oldStatus !== 'fully_verified') {
                await addXP(report.user_id, 500);
            }
        } else {
            // Normal trusted operative flow
            const newCount = (report.trusted_confirmations || 0) + 1;
            const updates: any = { trusted_confirmations: newCount };

            if (newCount >= 3) {
                updates.status = 'fully_verified';
                updates.expires_at = null;
            }

            const { error } = await supabase
                .from("reports")
                .update(updates)
                .eq("id", reportId);

            if (error) throw error;

            if (updates.status === 'fully_verified' && oldStatus !== 'fully_verified') {
                await addXP(report.user_id, 500);
            }
        }
    }

    revalidatePath(`/reports/${reportId}`);
    revalidatePath("/verified");
    revalidatePath("/reports");
}

export async function adminVerifyReport(reportId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Strict admin check
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (!profile?.is_admin) {
        throw new Error("Admin override required.");
    }

    const { data: report } = await supabase
        .from("reports")
        .select("status, user_id")
        .eq("id", reportId)
        .single();

    if (!report) throw new Error("Report not found.");
    const oldStatus = report.status;

    const { error } = await supabase
        .from("reports")
        .update({
            status: 'fully_verified',
            expires_at: null,
            trusted_confirmations: 3 // Force target reached for display
        })
        .eq("id", reportId);

    if (error) throw error;

    if (oldStatus !== 'fully_verified') {
        await addXP(report.user_id, 500);
    }

    revalidatePath(`/reports/${reportId}`);
    revalidatePath("/verified");
    revalidatePath("/reports");
}

export async function castPollVote(reportId: string, option: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from("poll_votes")
        .insert({
            user_id: user.id,
            report_id: reportId,
            option: option
        });

    if (error) {
        if (error.code === '23505') throw new Error("You have already participated in this poll.");
        throw error;
    }

    revalidatePath(`/reports/${reportId}`);
}

export async function deleteReport(reportId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Fetch report and user profile
    const { data: report } = await supabase
        .from("reports")
        .select("user_id, status, evidence_urls")
        .eq("id", reportId)
        .single();

    if (!report) {
        return { error: "Report not found." };
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    const isAdmin = profile?.is_admin || false;
    const isOwner = report.user_id === user.id;

    // Permission check
    if (!isOwner && !isAdmin) {
        return { error: "You can only delete your own reports." };
    }

    // Status check (only pending can be deleted by non-admins)
    if (report.status !== 'pending' && !isAdmin) {
        return { error: "Cannot delete reports that are in voting or verified." };
    }

    // Delete related data first (cascade)
    await supabase.from("votes").delete().eq("report_id", reportId);
    await supabase.from("poll_votes").delete().eq("report_id", reportId);
    await supabase.from("report_comments").delete().eq("report_id", reportId);

    // Delete evidence files from storage
    const evidenceUrls = report.evidence_urls as string[] || [];
    for (const url of evidenceUrls) {
        // Extract path from URL (format: .../storage/v1/object/public/evidence/[path])
        const match = url.match(/\/evidence\/(.+)$/);
        if (match) {
            await supabase.storage.from("evidence").remove([match[1]]);
        }
    }

    // Delete the report itself
    const { error } = await supabase
        .from("reports")
        .delete()
        .eq("id", reportId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/reports");
    revalidatePath("/verified");
    return { success: true };
}
