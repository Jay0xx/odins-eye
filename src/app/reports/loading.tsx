export default function ReportsLoading() {
    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-pulse">
            <div className="space-y-4">
                <div className="h-10 w-64 bg-surface" />
                <div className="h-4 w-96 bg-surface" />
            </div>

            <div className="flex border-b border-border-subtle gap-8 pb-4">
                {[1, 2, 3].map((v) => (
                    <div key={v} className="h-4 w-24 bg-surface" />
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-surface border border-border-subtle p-6 h-[280px]">
                        <div className="flex justify-between items-start mb-6">
                            <div className="h-4 w-16 bg-muted-dark" />
                            <div className="h-4 w-20 bg-muted-dark" />
                        </div>
                        <div className="space-y-3">
                            <div className="h-6 w-3/4 bg-muted-dark" />
                            <div className="h-4 w-full bg-muted-dark" />
                            <div className="h-4 w-full bg-muted-dark" />
                            <div className="h-4 w-1/2 bg-muted-dark" />
                        </div>
                        <div className="mt-8 pt-4 border-t border-border-subtle space-y-4">
                            <div className="flex justify-between">
                                <div className="h-3 w-12 bg-muted-dark" />
                                <div className="h-3 w-12 bg-muted-dark" />
                            </div>
                            <div className="h-10 w-full bg-muted-dark" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
