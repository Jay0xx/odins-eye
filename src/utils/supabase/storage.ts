import { createClient } from "./server";

export async function uploadEvidence(file: File, path: string) {
    const supabase = await createClient();

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage
        .from('evidence')
        .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('evidence')
        .getPublicUrl(filePath);

    return publicUrl;
}
