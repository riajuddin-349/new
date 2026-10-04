import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getCloudinaryUploadConfig } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const slug = String(body?.slug || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    const kind = body?.kind === "cover" ? "cover" : "gallery";
    if (!slug) return NextResponse.json({ error: "Project slug is required." }, { status: 400 });
    const folder = `portfolio/projects/${slug}/${kind}`;
    const title = String(body?.title || slug).trim();
    return NextResponse.json(getCloudinaryUploadConfig(folder, { title, projectSlug: slug, projectAsset: kind }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create upload signature." }, { status: 500 });
  }
}
