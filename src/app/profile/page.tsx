import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileForm from "./ProfileForm";
import FeedbackSection from "./FeedbackSection";
import { getFeedbackForUser } from "./feedback-actions";

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, bio, social_links, is_admin, credibility_score, xp, level")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
        console.error("Profile fetch error:", profileError);
    }

    const { feedback, summary } = await getFeedbackForUser(user.id);

    // If they have a username, redirect them to their vanity URL
    if (profile?.username) {
        redirect(`/profile/${profile.username}`);
    }

    // Otherwise, show the setup form in a standard dashboard layout
    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
            <div className="space-y-2 text-center md:text-left">
                <h1 className="text-4xl font-black tracking-tight uppercase text-white">Operative Dossier</h1>
                <p className="text-muted-light">Initialize your community identity in the Odin&apos;s Eye registry.</p>
            </div>

            <div className="bg-[#111111] border border-[#222222] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#444444] to-transparent" />

                <ProfileForm initialProfile={profile} userId={user.id} />

                <div className="mt-12 pt-8 border-t border-[#1a1a1a]">
                    <Link
                        href="/my-reports"
                        className="flex items-center justify-center gap-3 w-full py-4 border border-[#333333] text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                        Access My Reports Archive
                    </Link>
                </div>
            </div>

            <div className="pt-6 border-t border-[#111111] flex justify-between items-center bg-[#0a0a0a] p-4 font-mono text-[9px] text-[#444444] uppercase tracking-[0.4em]">
                <span>ODIN&apos;S EYE // SECURE_NODE_{user.id.slice(0, 8).toUpperCase()}</span>
                <span>STATUS: INITIALIZING</span>
            </div>
        </div>
    );
}
