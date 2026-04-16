import { supabase } from "./supabase";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function uploadFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (hasSupabase) {
    const bucket = "images";
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const filePath = `salomuy/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } else {
    // Local storage fallback for development
    const uploadDir = join(process.cwd(), "public/uploads");
    try { await mkdir(uploadDir, { recursive: true }); } catch (e) {}
    
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    
    return `/uploads/${fileName}`;
  }
}
