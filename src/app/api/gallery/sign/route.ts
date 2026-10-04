import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getCloudinaryUploadConfig } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const title = String(body?.title || "Gallery").trim() || "Gallery";
    return NextResponse.json(getCloudinaryUploadConfig("portfolio/gallery", { title }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create upload signature." }, { status: 500 });
  }
}
