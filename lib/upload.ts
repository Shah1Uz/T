import { supabase } from "./supabase";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function uploadFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && 
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
  
  console.log("Upload Debug:", {
    hasSupabase,
    url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    fileName: file.name,
    fileType: file.type
  });

  const isVercel = !!process.env.VERCEL;

  if (hasSupabase) {
    const bucket = "images";
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const filePath = `salomuy/${fileName}`;

    console.log("Uploading to Supabase:", { bucket, filePath });

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      });
    
    // Fallback: If upload with path failed, try uploading directly to bucket root
    if (error) {
       console.warn("Folder upload failed, trying root upload...", error.message);
       const rootPath = fileName;
       const { data: rootData, error: rootError } = await supabase.storage
         .from(bucket)
         .upload(rootPath, buffer, {
           contentType: file.type || 'image/jpeg',
           cacheControl: '3600',
           upsert: true
         });
       
       if (rootError) {
         console.error("Supabase upload error details:", rootError);
         throw new Error(`Supabase Upload failed: ${rootError.message}. Please check if the 'images' bucket exists and has correct policies.`);
       }
       
       const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(rootPath);
       return publicUrl;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log("Upload Success! Public URL:", publicUrl);
    return publicUrl;
  } else {
    if (isVercel) {
      throw new Error("Supabase sozlamalari (URL/Key) Vercel-da topilmadi. Iltimos, Vercel Dashboard-da Environment Variables qismini tekshiring.");
    }
    
    console.log("Falling back to local storage (Supabase config missing)");
    // Local storage fallback for development
    const uploadDir = join(process.cwd(), "public", "uploads");
    try { await mkdir(uploadDir, { recursive: true }); } catch (e) {}
    
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    
    return `/uploads/${fileName}`;
  }
}
