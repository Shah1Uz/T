import { v2 as cloudinary } from "cloudinary";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const hasCloudinary = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY;

  if (hasCloudinary) {
    const isMedia = file.type.startsWith("audio/") || file.type.startsWith("video/");
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        resource_type: isMedia ? "video" : "auto",
        folder: "salomuy"
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }).end(buffer);
    });

    return (result as any).secure_url;
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
