"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { addXP } from "@/utils/gamification";

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Check if profile exists (to award first-time XP)
    const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

    if (checkError) {
        console.error("Profile check error:", checkError);
    }

    const isFirstTime = !existingProfile;

    const username = formData.get("username") as string;
    const bio = formData.get("bio") as string;
    const twitter = formData.get("twitter") as string;
    const telegram = formData.get("telegram") as string;
    const website = formData.get("website") as string;
    const avatarFile = formData.get("avatar") as File | null;
    let avatar_url = formData.get("currentAvatarUrl") as string || null;

    // 1. Check username uniqueness if changed
    if (username) {
        const { data: existing, error: nameError } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", username)
            .neq("id", user.id)
            .maybeSingle();

        if (nameError) {
            console.error("Username uniqueness check error:", nameError);
        }

        if (existing) {
            return { error: "Username already taken." };
        }
    }

    // 2. Upload Avatar if provided
    if (avatarFile && avatarFile.size > 0) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from("profiles")
            .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) {
            console.error("Avatar upload failure:", uploadError);
            return { error: "Failed to upload avatar: " + uploadError.message };
        }

        const { data: { publicUrl } } = supabase.storage
            .from("profiles")
            .getPublicUrl(fileName);

        avatar_url = publicUrl;
    }

    // 3. Prepare Social Links
    const social_links = {
        twitter,
        telegram,
        website
    };

    // 4. Update or Insert Profile
    const { error } = await supabase
        .from("profiles")
        .upsert({
            id: user.id,
            username: username,
            bio: bio,
            social_links: social_links,
            avatar_url: avatar_url,
            updated_at: new Date().toISOString(),
        });

    if (error) {
        console.error("Profile upsert error:", error);
        return { error: "Failed to sync profile with registry: " + error.message };
    }

    // 5. Award XP if first time
    if (isFirstTime) {
        try {
            await addXP(user.id, 100);
        } catch (xpErr) {
            console.error("XP award failure:", xpErr);
            // Non-critical, we don't return error here
        }
    }

    revalidatePath("/profile");
    revalidatePath("/reports");
    revalidatePath("/");
    return { success: true };
}

export async function checkUsername(username: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!username || username.length < 3) return { available: false, error: "Too short" };

    const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

    if (error) {
        console.error("Username check error:", error);
    }

    if (data && data.id !== user?.id) {
        return { available: false };
    }
    return { available: true };
}
