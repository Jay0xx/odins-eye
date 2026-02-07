"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface Comment {
    id: string;
    report_id: string;
    user_id: string;
    parent_id: string | null;
    comment_text: string;
    created_at: string;
    author?: {
        id: string;
        username: string;
        avatar_url: string | null;
    };
    replies?: Comment[];
}

export async function getCommentsForReport(reportId: string): Promise<Comment[]> {
    const supabase = await createClient();

    const { data: rawComments, error } = await supabase
        .from("report_comments")
        .select("id, report_id, user_id, parent_id, comment_text, created_at")
        .eq("report_id", reportId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching comments:", error);
        return [];
    }

    // Fetch author profiles
    const userIds = [...new Set(rawComments?.map(c => c.user_id) || [])];
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Build comments with author info
    const comments: Comment[] = (rawComments || []).map(c => ({
        ...c,
        author: profileMap.get(c.user_id) || undefined,
        replies: []
    }));

    // Build threaded structure
    const commentMap = new Map(comments.map(c => [c.id, c]));
    const rootComments: Comment[] = [];

    for (const comment of comments) {
        if (comment.parent_id && commentMap.has(comment.parent_id)) {
            const parent = commentMap.get(comment.parent_id)!;
            parent.replies = parent.replies || [];
            parent.replies.push(comment);
        } else {
            rootComments.push(comment);
        }
    }

    return rootComments;
}

export async function addComment(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const reportId = formData.get("reportId") as string;
    const commentText = formData.get("commentText") as string;
    const parentId = formData.get("parentId") as string | null;

    if (!reportId || !commentText || commentText.trim().length === 0) {
        return { error: "Comment text is required." };
    }

    if (commentText.length > 2000) {
        return { error: "Comment must be under 2000 characters." };
    }

    const { error } = await supabase
        .from("report_comments")
        .insert({
            report_id: reportId,
            user_id: user.id,
            parent_id: parentId || null,
            comment_text: commentText.trim(),
        });

    if (error) {
        console.error("Comment insert error:", error);
        return { error: error.message };
    }

    revalidatePath(`/reports/${reportId}`);
    return { success: true };
}

export async function deleteComment(commentId: string, reportId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Check ownership or admin
    const { data: comment } = await supabase
        .from("report_comments")
        .select("user_id")
        .eq("id", commentId)
        .single();

    if (!comment) return { error: "Comment not found." };

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (comment.user_id !== user.id && !profile?.is_admin) {
        return { error: "You can only delete your own comments." };
    }

    const { error } = await supabase
        .from("report_comments")
        .delete()
        .eq("id", commentId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/reports/${reportId}`);
    return { success: true };
}
