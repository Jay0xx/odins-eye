import { login } from "@/app/auth/actions";
import Link from "next/link";

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; message?: string }>;
}) {
    const { error, message } = await searchParams;

    return (
        <div className="max-w-md mx-auto mt-20 space-y-8 animate-in fade-in duration-500">
            <div className="space-y-2 text-center">
                <h1 className="text-4xl font-bold tracking-tight">LOG IN</h1>
                <p className="text-muted-light">Access the Odin&apos;s Eye network</p>
            </div>

            <form action={login} className="space-y-6">
                {error && (
                    <div className="p-3 bg-surface border border-red-900/30 text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}
                {message && !error && (
                    <div className="p-3 bg-surface border border-white/10 text-muted-light text-sm text-center">
                        {message}
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-medium">
                        Email Address
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full bg-surface border border-border-subtle p-3 text-sm focus:outline-none focus:border-white transition-colors"
                        placeholder="name@example.com"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-medium">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="w-full bg-surface border border-border-subtle p-3 text-sm focus:outline-none focus:border-white transition-colors"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-4 bg-white text-black font-black uppercase text-sm tracking-widest hover:bg-muted-light transition-all"
                >
                    Sign In
                </button>
            </form>

            <div className="text-center text-sm text-muted-light">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-white hover:underline">
                    Create one
                </Link>
            </div>
        </div>
    );
}
