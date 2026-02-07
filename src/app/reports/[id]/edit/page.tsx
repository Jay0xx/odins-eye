import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import SubmitForm from "@/app/submit/SubmitForm";
import Link from "next/link";

export default async function EditReportPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch report details
    const { data: report, error } = await supabase
        .from("reports")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !report) {
        notFound();
    }

    // Authorization check
    if (report.user_id !== user.id) {
        redirect(`/reports/${id}`);
    }

    // Status check
    if (report.status !== 'pending') {
        redirect(`/reports/${id}?error=Only pending reports can be edited`);
    }

    return (
        <div className="max-w-3xl mx-auto space-y-12 pb-20">
            <Link
                href={`/reports/${id}`}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-medium hover:text-white transition-colors flex items-center gap-2 mb-8"
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Report Details
            </Link>

            <div className="space-y-4 text-center">
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white leading-tight">
                    EDIT REPORT
                </h1>
                <p className="text-[#AAAAAA] text-sm uppercase tracking-widest leading-relaxed max-w-xl mx-auto">
                    Correct errors or augment the intelligence dossier with additional evidence.
                </p>
            </div>

            <div className="bg-[#0a0a0a] border border-[#222222] p-6 md:p-10">
                <SubmitForm reportId={id} initialData={report} />
            </div>

            {/* Footer warning */}
            <div className="bg-[#111111] border border-[#222222] p-4 text-center">
                <p className="text-[10px] text-[#555555] uppercase tracking-widest font-bold">
                    All modifications are recorded in the immutable audit trail
                </p>
            </div>
        </div>
    );
}
