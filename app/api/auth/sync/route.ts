import { NextResponse } from "next/server";
import { syncUser } from "@/lib/auth";

export async function GET() {
  const user = await syncUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(user);
}
