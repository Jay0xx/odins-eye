export default function Loading() {
    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-pulse">
            <div className="space-y-4">
                <div className="h-10 w-64 bg-[#111111]" />
                <div className="h-4 w-96 bg-[#0a0a0a]" />
            </div>

            <div className="h-10 w-full border-b border-[#111111]" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-[#0a0a0a] border border-[#111111] p-8 h-80 flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="h-6 w-24 bg-[#111111]" />
                                <div className="h-3 w-16 bg-[#111111]" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-8 w-3/4 bg-[#111111]" />
                                <div className="h-4 w-full bg-[#111111]" />
                                <div className="h-4 w-2/3 bg-[#111111]" />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="h-10 w-full bg-[#111111] border border-[#222222]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
