"use client";

import { useState, useRef, useEffect } from "react";
import { updateProfile, checkUsername } from "./actions";
import { getXpProgress, getXpForNextLevel } from "@/utils/gamification-utils";

interface Profile {
    username: string;
    avatar_url: string | null;
    bio: string | null;
    is_admin?: boolean;
    xp: number;
    level: number;
    credibility_score: number;
    social_links: {
        twitter?: string;
        telegram?: string;
        website?: string;
    } | null;
}

export default function ProfileForm({
    initialProfile,
    userId,
    editable = true
}: {
    initialProfile: Profile | null,
    userId: string,
    editable?: boolean
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialProfile || !initialProfile.username);

    const [username, setUsername] = useState(initialProfile?.username || "");
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [bio, setBio] = useState(initialProfile?.bio || "");
    const [socials, setSocials] = useState({
        twitter: initialProfile?.social_links?.twitter || "",
        telegram: initialProfile?.social_links?.telegram || "",
        website: initialProfile?.social_links?.website || "",
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(initialProfile?.avatar_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Real-time username check
    useEffect(() => {
        if (username.length >= 3 && username !== initialProfile?.username) {
            const timeout = setTimeout(async () => {
                const res = await checkUsername(username);
                setUsernameAvailable(res.available);
            }, 500);
            return () => clearTimeout(timeout);
        } else {
            setUsernameAvailable(null);
        }
    }, [username, initialProfile?.username]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData(e.currentTarget);

        try {
            const result = await updateProfile(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                setSuccess(true);
                setIsEditing(false);
                // In a real app we'd probably refresh the page or update parent state
                window.location.reload();
            }
        } catch (err: any) {
            setError(err.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    if (!isEditing && initialProfile) {
        return (
            <div className="flex flex-col items-center space-y-8 animate-in fade-in duration-700">
                <div className="w-32 h-32 rounded-full border border-[#222222] overflow-hidden bg-[#111111] flex items-center justify-center shadow-xl">
                    {initialProfile.avatar_url ? (
                        <img src={initialProfile.avatar_url} alt={initialProfile.username} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-4xl font-black text-white">
                            {(initialProfile.username || "?").charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>

                <div className="text-center space-y-4 max-w-sm">
                    <div className="flex items-center justify-center gap-3">
                        <h2 className="text-3xl font-bold text-white">{initialProfile.username}</h2>
                        {initialProfile.is_admin && (
                            <span className="bg-[#222222] text-white text-[9px] font-black uppercase px-2 py-0.5 tracking-tighter rounded-sm">
                                Admin
                            </span>
                        )}
                    </div>
                    {initialProfile.bio && (
                        <p className="text-[#AAAAAA] text-sm leading-relaxed whitespace-pre-wrap">
                            {initialProfile.bio}
                        </p>
                    )}

                    <div className="flex justify-center gap-6 pt-2">
                        {initialProfile.social_links?.twitter && (
                            <a href={`https://x.com/${initialProfile.social_links.twitter}`} target="_blank" rel="noreferrer" className="text-[#777777] hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Twitter</a>
                        )}
                        {initialProfile.social_links?.telegram && (
                            <a href={`https://t.me/${initialProfile.social_links.telegram}`} target="_blank" rel="noreferrer" className="text-[#777777] hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Telegram</a>
                        )}
                        {initialProfile.social_links?.website && (
                            <a href={initialProfile.social_links.website} target="_blank" rel="noreferrer" className="text-[#777777] hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Website</a>
                        )}
                    </div>

                    <div className="pt-10 space-y-6 w-full max-w-[280px] mx-auto">
                        <div className="flex justify-between items-end">
                            <span className="text-2xl font-bold text-white uppercase tracking-tighter">Level {initialProfile.level}</span>
                            <span className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest">
                                XP: {initialProfile.xp} / {getXpForNextLevel(initialProfile.level) || 'MAX'}
                            </span>
                        </div>

                        {/* XP Progress Bar */}
                        <div className="space-y-2">
                            <div className="h-1 w-full bg-[#111111] overflow-hidden border border-[#222222]">
                                <div
                                    className="h-full bg-[#AAAAAA] transition-all duration-1000"
                                    style={{ width: `${getXpProgress(initialProfile.xp, initialProfile.level)}%` }}
                                />
                            </div>
                            <p className="text-[8px] font-bold text-[#444444] uppercase tracking-[0.2em] text-center">Level Progression</p>
                        </div>

                        <div className="pt-4 flex flex-col items-center gap-2">
                            <div className="flex items-center gap-3">
                                <div className="h-0.5 w-24 bg-[#111111]">
                                    <div
                                        className="h-full bg-[#AAAAAA] transition-all duration-1000"
                                        style={{ width: `${initialProfile.is_admin ? 100 : initialProfile.credibility_score}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-mono text-[#AAAAAA] font-bold">
                                    Credibility: {initialProfile.is_admin ? "100 (Admin)" : `${initialProfile.credibility_score}/100`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {editable && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="mt-4 px-10 py-3 border border-[#222222] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#111111] transition-all"
                    >
                        Edit Profile
                    </button>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-4">
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 rounded-full border border-[#222222] overflow-hidden bg-[#111111] cursor-pointer hover:border-white transition-all flex items-center justify-center group relative shadow-inner"
                >
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center">
                            <span className="text-[10px] font-bold uppercase text-[#777777] group-hover:text-white">Upload</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold uppercase text-white">Change</span>
                    </div>
                </div>
                <input
                    type="file"
                    name="avatar"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                <input type="hidden" name="currentAvatarUrl" value={initialProfile?.avatar_url || ""} />
            </div>

            <div className="space-y-6">
                {/* Username */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA]">Username</label>
                        {usernameAvailable === false && <span className="text-[9px] text-red-500 uppercase font-bold">Taken</span>}
                        {usernameAvailable === true && <span className="text-[9px] text-green-500 uppercase font-bold">Available</span>}
                    </div>
                    <input
                        type="text"
                        name="username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a username"
                        className="w-full bg-[#111111] border border-[#222222] p-4 text-white font-medium focus:border-white outline-none transition-colors"
                    />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA]">Bio</label>
                        <span className="text-[9px] text-[#777777] font-bold">{bio.length}/280</span>
                    </div>
                    <textarea
                        name="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value.slice(0, 280))}
                        placeholder="Tell us about yourself..."
                        rows={3}
                        className="w-full bg-[#111111] border border-[#222222] p-4 text-white font-medium focus:border-white outline-none transition-colors resize-none leading-relaxed text-sm"
                    />
                </div>

                {/* Socials */}
                <div className="space-y-4 pt-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA] block border-b border-[#222222] pb-2">Links</label>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center bg-[#111111] border border-[#222222] px-4 focus-within:border-white transition-colors">
                            <span className="text-[#777777] text-xs font-bold pr-2">X/</span>
                            <input
                                type="text"
                                name="twitter"
                                value={socials.twitter}
                                onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                                placeholder="handle"
                                className="flex-1 bg-transparent py-4 text-white outline-none text-sm"
                            />
                        </div>
                        <div className="flex items-center bg-[#111111] border border-[#222222] px-4 focus-within:border-white transition-colors">
                            <span className="text-[#777777] text-xs font-bold pr-2">TG/</span>
                            <input
                                type="text"
                                name="telegram"
                                value={socials.telegram}
                                onChange={(e) => setSocials({ ...socials, telegram: e.target.value })}
                                placeholder="username"
                                className="flex-1 bg-transparent py-4 text-white outline-none text-sm"
                            />
                        </div>
                        <div className="flex items-center bg-[#111111] border border-[#222222] px-4 focus-within:border-white transition-colors">
                            <span className="text-[#777777] text-xs font-bold pr-2">URL/</span>
                            <input
                                type="url"
                                name="website"
                                value={socials.website}
                                onChange={(e) => setSocials({ ...socials, website: e.target.value })}
                                placeholder="https://..."
                                className="flex-1 bg-transparent py-4 text-white outline-none text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">{error}</p>
            )}

            <div className="flex flex-col gap-3 pt-4">
                <button
                    type="submit"
                    disabled={loading || (username !== initialProfile?.username && usernameAvailable === false)}
                    className="w-full py-4 bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-[#EEEEEE] transition-all disabled:opacity-50"
                >
                    {loading ? "Saving..." : (initialProfile?.username ? "Update Profile" : "Save Profile")}
                </button>
                {initialProfile?.username && (
                    <button
                        type="button"
                        onClick={() => {
                            setIsEditing(false);
                            setError(null);
                        }}
                        className="w-full py-4 border border-[#222222] text-white font-bold uppercase text-xs tracking-widest hover:bg-[#111111] transition-all"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
