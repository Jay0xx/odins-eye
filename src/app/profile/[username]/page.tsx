import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ProfileForm from "../ProfileForm";
import FeedbackSection from "../FeedbackSection";
import { getFeedbackForUser } from "../feedback-actions";

export default async function PublicProfilePage({
    params
}: {
    params: Promise<{ username: string }>
}) {
    const { username } = await params;
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    // Check if the parameter is a UUID (legacy link support)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username);

    // Fetch the target profile
    let query = supabase
        .from("profiles")
        .select("id, username, avatar_url, bio, social_links, is_admin, credibility_score, xp, level");

    if (isUUID) {
        query = query.eq("id", username);
    } else {
        // Use ilike for case-insensitive exact match
        query = query.ilike("username", username);
    }

    const { data: profile, error } = await query.maybeSingle();

    if (error) {
        console.error("Error fetching profile:", error);
        notFound();
    }

    if (!profile) {
        notFound();
    }

    // Canonicalize the URL: 
    // 1. If it was a UUID search
    // 2. Or if the casing doesn't match the one in DB
    if (profile.username && (isUUID || profile.username !== username)) {
        redirect(`/profile/${profile.username}`);
    }

    const { feedback, summary } = await getFeedbackForUser(profile.id);

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
            {/* Standard Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-2 text-center md:text-left">
                    <h1 className="text-4xl font-black tracking-tight uppercase text-white">
                        {profile.username || 'Anonymous Operative'}
                    </h1>
                </div>

                {currentUser?.id === profile.id && (
                    <Link
                        href="/my-reports"
                        className="px-6 py-3 border border-[#333333] text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                    >
                        Access My Reports
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Stats/Reputation Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#111111] border border-[#222222] p-8 shadow-xl relative">
                        <ProfileForm initialProfile={profile} userId={profile.id} editable={currentUser?.id === profile.id} />
                    </div>
                </div>

                {/* Main Content Column (Feedback) */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-[#111111] border border-[#222222] p-8 min-h-[400px]">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white mb-8 border-b border-[#222222] pb-4">
                            Community Feedback
                        </h3>
                        <FeedbackSection
                            targetUserId={profile.id}
                            feedback={feedback}
                            summary={summary}
                            currentUserId={currentUser?.id}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
