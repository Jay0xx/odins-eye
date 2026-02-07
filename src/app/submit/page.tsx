import SubmitForm from "./SubmitForm";

export default function SubmitPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-12 pb-20">
            <div className="space-y-4 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">SUBMIT REPORT</h1>
                <p className="text-muted-light max-w-xl mx-auto">
                    Share evidence of malicious behavior. Your report will be reviewed by the community
                    and cross-referenced with established bad actor patterns.
                </p>
            </div>

            <div className="bg-surface border border-border-subtle p-6 md:p-10">
                <SubmitForm />
            </div>

            <div className="flex items-center gap-4 text-[10px] text-muted-dark font-bold uppercase tracking-widest justify-center">
                <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    Encrypted
                </span>
                <span className="w-1 h-1 bg-muted-dark rounded-full"></span>
                <span>Public Record</span>
                <span className="w-1 h-1 bg-muted-dark rounded-full"></span>
                <span>Immutable</span>
            </div>
        </div>
    );
}
