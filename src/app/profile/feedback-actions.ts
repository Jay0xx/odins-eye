"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { adjustCredibility } from "@/utils/gamification";

export interface Feedback {
    id: string;
    from_user_id: string;
    to_user_id: string;
    type: 'positive' | 'negative' | 'neutral';
    comment_text: string | null;
    related_report_id: string | null;
    created_at: string;
    from_profile?: {
        username: string;
        avatar_url: string | null;
    };
}

export interface FeedbackSummary {
    total: number;
    positive: number;
    negative: number;
    neutral: number;
}

export async function getFeedbackForUser(userId: string): Promise<{ feedback: Feedback[], summary: FeedbackSummary }> {
    const supabase = await createClient();

    const { data: rawFeedback, error } = await supabase
        .from("user_feedback")
        .select(`
            id,
            from_user_id,
            to_user_id,
            type,
            comment_text,
            related_report_id,
            created_at
        `)
        .eq("to_user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching feedback:", error);
        return { feedback: [], summary: { total: 0, positive: 0, negative: 0, neutral: 0 } };
    }

    // Fetch profiles for feedback authors
    const fromUserIds = [...new Set(rawFeedback?.map(f => f.from_user_id) || [])];
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", fromUserIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    const feedback: Feedback[] = (rawFeedback || []).map(f => ({
        ...f,
        from_profile: profileMap.get(f.from_user_id) || undefined
    }));

    const summary: FeedbackSummary = {
        total: feedback.length,
        positive: feedback.filter(f => f.type === 'positive').length,
        negative: feedback.filter(f => f.type === 'negative').length,
        neutral: feedback.filter(f => f.type === 'neutral').length,
    };

    return { feedback, summary };
}

export async function submitFeedback(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const toUserId = formData.get("toUserId") as string;
    const type = formData.get("type") as 'positive' | 'negative' | 'neutral';
    const commentText = formData.get("commentText") as string;
    const relatedReportId = formData.get("relatedReportId") as string | null;

    // Validation
    if (!toUserId || !type) {
        return { error: "Missing required fields." };
    }

    if (toUserId === user.id) {
        return { error: "You cannot leave feedback for yourself." };
    }

    if (type === 'negative' && (!commentText || commentText.length < 50)) {
        return { error: "Negative feedback requires at least 50 characters." };
    }

    // Check 30-day cooldown
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: existingFeedback } = await supabase
        .from("user_feedback")
        .select("id, created_at")
        .eq("from_user_id", user.id)
        .eq("to_user_id", toUserId)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .single();

    if (existingFeedback) {
        return { error: "You can only leave feedback once per 30 days for this user." };
    }

    // Delete old feedback if exists (to allow new one after 30 days)
    await supabase
        .from("user_feedback")
        .delete()
        .eq("from_user_id", user.id)
        .eq("to_user_id", toUserId);

    // Insert new feedback
    const { error: insertError } = await supabase
        .from("user_feedback")
        .insert({
            from_user_id: user.id,
            to_user_id: toUserId,
            type,
            comment_text: commentText || null,
            related_report_id: relatedReportId || null,
        });

    if (insertError) {
        console.error("Feedback insert error:", insertError);
        return { error: insertError.message };
    }

    // Apply credibility change for positive feedback only (immediate)
    if (type === 'positive') {
        await adjustCredibility(toUserId, 2);
    }
    // Note: Negative credibility impact requires 3+ upvotes (future feature)

    revalidatePath(`/profile`);
    revalidatePath(`/profile/${toUserId}`);
    return { success: true };
}
