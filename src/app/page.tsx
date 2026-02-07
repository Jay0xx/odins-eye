import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-black text-white">
      <div className="max-w-3xl w-full text-center space-y-10">
        {/* Site name & subheading */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter text-white">
            Odin&apos;s Eye
          </h1>
          <p className="text-xl md:text-2xl text-[#AAAAAA] max-w-2xl mx-auto">
            See the bad actors. Share the evidence. Let the community decide.
          </p>
        </div>

        {/* Auth state & CTA buttons */}
        {user && profile ? (
          <div className="space-y-6">
            <p className="text-lg text-[#AAAAAA]">
              Welcome back, <span className="text-white font-medium">{profile.username}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/reports"
                className="px-10 py-5 bg-white text-black font-medium text-lg hover:bg-gray-200 transition-colors rounded"
              >
                Browse Reports
              </Link>
              <Link
                href="/profile"
                className="px-10 py-5 border border-[#222222] text-white font-medium text-lg hover:bg-[#111111] transition-colors rounded"
              >
                View Profile
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reports"
              className="px-10 py-5 bg-white text-black font-medium text-lg hover:bg-gray-200 transition-colors rounded"
            >
              Browse Reports
            </Link>
            <Link
              href="/signup"
              className="px-10 py-5 border border-[#222222] text-white font-medium text-lg hover:bg-[#111111] transition-colors rounded"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
