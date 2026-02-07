"use server";

import { createClient } from "@/utils/supabase/server";
import { uploadEvidence } from "@/utils/supabase/storage";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addXP } from "@/utils/gamification";

export async function submitReport(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const actorName = formData.get("actorName") as string;
    const walletAddress = formData.get("walletAddress") as string;
    const description = formData.get("description") as string;
    const socialsStr = formData.get("socials") as string;
    const socials = socialsStr ? JSON.parse(socialsStr) : {};

    // Handle multiple file uploads
    const files = formData.getAll("evidence") as File[];
    const evidence_urls: string[] = [];

    for (const file of files) {
        if (file.size > 0) {
            try {
                const url = await uploadEvidence(file, user.id);
                evidence_urls.push(url);
            } catch (error) {
                console.error("File upload failed:", error);
            }
        }
    }

    const { error } = await supabase.from("reports").insert({
        user_id: user.id,
        actor_name: actorName,
        wallet_address: walletAddress,
        description: description,
        social_links: socials,
        evidence_urls: evidence_urls,
        status: 'pending'
    });

    if (error) {
        return { error: error.message };
    }

    // Award XP for successful submission
    await addXP(user.id, 40);

    revalidatePath("/reports");
    redirect("/reports?success=true");
}

export async function updateReport(reportId: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // Fetch existing report to check ownership and status
    const { data: existingReport } = await supabase
        .from("reports")
        .select("user_id, status, evidence_urls")
        .eq("id", reportId)
        .single();

    if (!existingReport) {
        return { error: "Report not found." };
    }

    if (existingReport.user_id !== user.id) {
        return { error: "Unauthorized." };
    }

    if (existingReport.status !== 'pending') {
        return { error: "Only pending reports can be edited." };
    }

    const actorName = formData.get("actorName") as string;
    const walletAddress = formData.get("walletAddress") as string;
    const description = formData.get("description") as string;
    const socialsStr = formData.get("socials") as string;
    const socials = socialsStr ? JSON.parse(socialsStr) : {};

    // Handle multiple file uploads
    const files = formData.getAll("evidence") as File[];
    const evidence_urls: string[] = [...(existingReport.evidence_urls as string[] || [])];

    for (const file of files) {
        if (file.size > 0) {
            try {
                const url = await uploadEvidence(file, user.id);
                evidence_urls.push(url);
            } catch (error) {
                console.error("File upload failed:", error);
            }
        }
    }

    const { error } = await supabase.from("reports").update({
        actor_name: actorName,
        wallet_address: walletAddress,
        description: description,
        social_links: socials,
        evidence_urls: evidence_urls,
    }).eq("id", reportId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/reports/${reportId}`);
    revalidatePath("/reports");
    redirect(`/reports/${reportId}?updated=true`);
}
