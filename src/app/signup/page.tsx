import { signup } from "@/app/auth/actions";
import Link from "next/link";

export default async function SignupPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;

    return (
        <div className="max-w-md mx-auto mt-20 space-y-8 animate-in fade-in duration-500">
            <div className="space-y-2 text-center">
                <h1 className="text-4xl font-bold tracking-tight">SIGN UP</h1>
                <p className="text-muted-light">Join the community evidence network</p>
            </div>

            <form action={signup} className="space-y-6">
                {error && (
                    <div className="p-3 bg-surface border border-red-900/30 text-red-500 text-sm text-center">
                        {error}
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

                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-medium">
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
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
                    Create Account
                </button>
            </form>

            <div className="text-center text-sm text-muted-light">
                Already have an account?{" "}
                <Link href="/login" className="text-white hover:underline">
                    Sign In
                </Link>
            </div>
        </div>
    );
}
