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
}
