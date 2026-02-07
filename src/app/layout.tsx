import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Odin's Eye | Community Evidence",
  description: "See the bad actors. Share the evidence. Let the community decide.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let profile = null;
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("username, avatar_url, is_admin")
        .eq("id", user.id)
        .maybeSingle();
      profile = data;
    }

    return (
      <html lang="en">
        <body className="antialiased selection:bg-muted-dark selection:text-white" suppressHydrationWarning>
          <LayoutWrapper user={user} profile={profile}>
            {children}
          </LayoutWrapper>
        </body>
      </html>
    );
  } catch (err: any) {
    return (
      <html lang="en">
        <body className="bg-black text-white p-10 font-mono">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-xl font-bold uppercase tracking-tighter text-red-500">
              CRITICAL_UPLINK_FAILURE
            </h1>
            <p className="text-sm text-[#AAAAAA]">
              The intelligence node failed to initialize. This usually indicates missing environment variables or a synchronization error with the community registry.
            </p>
            <pre className="p-6 bg-[#111111] border border-[#222222] text-xs text-red-400 overflow-auto">
              Error: {err.message}
              {"\n"}
              {err.stack}
            </pre>
            <div className="pt-6 border-t border-[#1a1a1a]">
              <p className="text-[10px] uppercase tracking-widest text-[#444444]">
                Diagnostic Code: ERR_V3RCEL_500 // SECTOR_LAYOUT
              </p>
            </div>
          </div>
        </body>
      </html>
    );
  }
}
