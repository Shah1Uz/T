import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/upload";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file = data.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const url = await uploadFile(file);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
