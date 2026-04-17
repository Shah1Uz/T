import { supabase } from "./supabase";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function uploadFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const isKeyValid = (key: string | undefined) => !!key && key.startsWith("eyJ");
  const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    (isKeyValid(process.env.SUPABASE_SERVICE_ROLE_KEY) || isKeyValid(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
  
  console.log("Upload Debug:", {
    hasSupabase,
    url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey: isKeyValid(process.env.SUPABASE_SERVICE_ROLE_KEY),
    anonKey: isKeyValid(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    fileName: file.name,
    fileType: file.type
  });

  if (hasSupabase) {
    const bucket = "images";
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const filePath = `salomuy/${fileName}`;

    console.log("Uploading to Supabase:", { bucket, filePath });

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Supabase upload error details:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log("Upload Success! Public URL:", publicUrl);
    return publicUrl;
  } else {
    console.log("Falling back to local storage (Supabase config missing)");
    // Local storage fallback for development
    const uploadDir = join(process.cwd(), "public/uploads");
    try { await mkdir(uploadDir, { recursive: true }); } catch (e) {}
    
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    
    return `/uploads/${fileName}`;
  }
}
