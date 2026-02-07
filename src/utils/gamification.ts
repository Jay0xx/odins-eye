"use server";

import { createClient } from "@/utils/supabase/server";
import { calculateLevel } from "./gamification-utils";

export async function addXP(userId: string, amount: number) {
    const supabase = await createClient();

    // Fetch current stats
    const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("xp, level, is_admin")
        .eq("id", userId)
        .single();

    if (fetchError || !profile) {
        console.error("Error fetching profile for XP update:", fetchError);
        return;
    }

    const newXp = (profile.xp || 0) + amount;
    const newLevel = calculateLevel(newXp);

    const { error: updateError } = await supabase
        .from("profiles")
        .update({
            xp: newXp,
            level: newLevel,
            updated_at: new Date().toISOString()
        })
        .eq("id", userId);

    if (updateError) {
        console.error("Error updating XP/Level:", updateError);
    }
}

export async function adjustCredibility(userId: string, amount: number) {
    const supabase = await createClient();

    const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("credibility_score, is_admin")
        .eq("id", userId)
        .single();

    if (fetchError || !profile) {
        console.error("Error fetching profile for credibility update:", fetchError);
        return;
    }

    // Admins always have 100
    if (profile.is_admin) return;

    let newScore = (profile.credibility_score || 50) + amount;
    newScore = Math.max(0, Math.min(100, newScore));

    await supabase
        .from("profiles")
        .update({
            credibility_score: newScore,
            updated_at: new Date().toISOString()
        })
        .eq("id", userId);
}
