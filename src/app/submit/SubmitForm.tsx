"use client";

import { useState, useRef } from "react";
import { updateReport, submitReport } from "./actions";

export interface SubmitFormProps {
    reportId?: string;
    initialData?: {
        actor_name: string;
        wallet_address?: string;
        description: string;
        social_links?: Record<string, string>;
        evidence_urls?: string[];
    };
}

export default function SubmitForm({ reportId, initialData }: SubmitFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial socials
    const initialSocials = initialData?.social_links
        ? Object.entries(initialData.social_links).map(([platform, value]) => ({ platform, value }))
        : [{ platform: "Twitter/X", value: "" }];

    const [socials, setSocials] = useState<{ platform: string; value: string }[]>(initialSocials);
    const [previews, setPreviews] = useState<string[]>(initialData?.evidence_urls || []);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addSocial = () => setSocials([...socials, { platform: "", value: "" }]);
    const removeSocial = (index: number) => setSocials(socials.filter((_, i) => i !== index));
    const updateSocial = (index: number, field: "platform" | "value", text: string) => {
        const newSocials = [...socials];
        newSocials[index][field] = text;
        setSocials(newSocials);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newPreviews: string[] = [...previews];
        for (let i = 0; i < files.length; i++) {
            if (files[i].type.startsWith("image/")) {
                newPreviews.push(URL.createObjectURL(files[i]));
            }
        }
        setPreviews(newPreviews);
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        // Map socials to object for JSONB
        const socialObj: Record<string, string> = {};
        socials.forEach(s => {
            if (s.platform && s.value) socialObj[s.platform.toLowerCase()] = s.value;
        });
        formData.append("socials", JSON.stringify(socialObj));

        try {
            let result;
            if (reportId) {
                result = await updateReport(reportId, formData);
            } else {
                result = await submitReport(formData);
            }
            if (result?.error) setError(result.error);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
            {error && (
                <div className="p-4 bg-surface border border-red-900/30 text-red-500 text-sm text-center">
                    {error}
                </div>
            )}

            {/* Basic Info Section */}
            <div className="space-y-6">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-medium">Actor Name *</label>
                    <input
                        name="actorName"
                        required
                        defaultValue={initialData?.actor_name}
                        placeholder="Username or Real Name"
                        className="w-full bg-surface border border-border-subtle p-3 text-sm focus:outline-none focus:border-white transition-colors"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-medium">Wallet Address (Optional)</label>
                    <input
                        name="walletAddress"
                        defaultValue={initialData?.wallet_address}
                        placeholder="0x... or Solana Address"
                        className="w-full bg-surface border border-border-subtle p-3 text-sm focus:outline-none focus:border-white transition-colors font-mono"
                    />
                </div>
            </div>

            <div className="h-px bg-border-subtle" />

            {/* Socials Section */}
            <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-medium">Social Links</label>
                <div className="space-y-3">
                    {socials.map((social, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                placeholder="Platform (e.g. Discord)"
                                value={social.platform}
                                onChange={(e) => updateSocial(index, "platform", e.target.value)}
                                className="w-1/3 bg-surface border border-border-subtle p-3 text-sm focus:outline-none focus:border-white transition-colors"
                            />
                            <input
                                placeholder="Handle or Link"
                                value={social.value}
                                onChange={(e) => updateSocial(index, "value", e.target.value)}
                                className="flex-1 bg-surface border border-border-subtle p-3 text-sm focus:outline-none focus:border-white transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => removeSocial(index)}
                                className="px-4 text-muted-dark hover:text-red-500 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addSocial}
                        className="text-[10px] font-bold text-muted-light uppercase tracking-widest hover:text-white transition-colors"
                    >
                        + Add Social Link
                    </button>
                </div>
            </div>

            <div className="h-px bg-border-subtle" />

            {/* Content Section */}
            <div className="space-y-6">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-medium">Description *</label>
                    <textarea
                        name="description"
                        required
                        rows={6}
                        defaultValue={initialData?.description}
                        placeholder="Provide a detailed account of the malicious activity..."
                        className="w-full bg-surface border border-border-subtle p-3 text-sm focus:outline-none focus:border-white transition-colors resize-none"
                        minLength={100}
                        maxLength={2000}
                    />
                    <div className="text-[10px] text-muted-dark font-bold uppercase text-right">100 - 2000 characters</div>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-medium">Evidence * (Screenshots, PDFs)</label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border-subtle p-8 text-center cursor-pointer hover:border-muted-medium transition-colors"
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            name="evidence"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                            required={!reportId}
                        />
                        <div className="text-muted-light text-sm uppercase tracking-widest font-bold">Click to upload files</div>
                        <div className="text-[10px] text-muted-dark mt-2 font-bold uppercase">Drag and drop supported</div>
                    </div>

                    {previews.length > 0 && (
                        <div className="grid grid-cols-4 gap-4 mt-4">
                            {previews.map((src, i) => (
                                <div key={i} className="aspect-square bg-surface border border-border-subtle overflow-hidden relative">
                                    <img src={src} className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-white text-black font-black uppercase text-sm tracking-[0.2em] hover:bg-muted-light transition-all disabled:opacity-50"
                >
                    {loading ? "Initializing..." : (reportId ? "Update Report" : "Complete Report Submission")}
                </button>
            </div>
        </form>
    );
}
