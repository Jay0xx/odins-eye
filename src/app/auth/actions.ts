"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return redirect("/login?error=" + encodeURIComponent(error.message));
    }

    revalidatePath("/", "layout");
    redirect("/reports");
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
        return redirect("/signup?error=" + encodeURIComponent("Passwords do not match"));
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        return redirect("/signup?error=" + encodeURIComponent(error.message));
    }

    // Redirect to confirmation page instead of home
    redirect("/signup/confirm?email=" + encodeURIComponent(email));
}

export async function logout() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Error logging out:", error.message);
    }

    revalidatePath("/", "layout");
    redirect("/");
}
