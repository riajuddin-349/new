import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteImage, listImages } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const resources = await listImages("portfolio/gallery");
    return NextResponse.json({ items: resources.map((item) => ({ id: item.public_id, title: item.context?.custom?.title || "Gallery", image: item.secure_url, createdAt: item.created_at || new Date().toISOString() })) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gallery lookup failed." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const items = Array.isArray(body?.items) ? body.items : [];
  if (!items.length) return NextResponse.json({ error: "No gallery images provided." }, { status: 400 });
  return NextResponse.json({ items });
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const ids = Array.isArray(body?.ids) ? body.ids.filter((id: unknown): id is string => typeof id === "string" && id.length > 0) : [];
    if (!ids.length) return NextResponse.json({ error: "No gallery image selected." }, { status: 400 });
    await Promise.all(ids.map(deleteImage));
    return NextResponse.json({ deleted: ids });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Delete failed." }, { status: 500 });
  }
}
