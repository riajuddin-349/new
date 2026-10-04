import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { addProject, getAllProjects } from "@/lib/content";
import { isAdmin } from "@/lib/auth";
import { deleteImage } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ items: await getAllProjects() });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const title = String(body?.title || "").trim();
    const slug = String(body?.slug || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const category = String(body?.category || "").trim();
    const year = String(body?.year || new Date().getFullYear()).trim();
    const client = String(body?.client || "").trim();
    const role = String(body?.role || "UI/UX Designer").trim();
    const description = String(body?.description || "").trim();
    const challenge = String(body?.challenge || "").trim();
    const outcome = String(body?.outcome || "").trim();
    const image = String(body?.image || "").trim();
    const coverId = String(body?.coverId || "").trim();
    const gallery = Array.isArray(body?.gallery) ? body.gallery.filter((x: unknown): x is string => typeof x === "string" && x.length > 0) : [];
    const galleryIds = Array.isArray(body?.galleryIds) ? body.galleryIds.filter((x: unknown): x is string => typeof x === "string" && x.length > 0) : [];
    if (!title || !slug || !category || !description || !image || !coverId) return NextResponse.json({ error: "Title, slug, category, description and cover image are required." }, { status: 400 });
    const existing = await getAllProjects();
    if (existing.some((item) => item.slug === slug)) return NextResponse.json({ error: "A project with this slug already exists." }, { status: 409 });
    const project = await addProject({ id: randomUUID(), slug, title, category, image, gallery, year, client, role, description, challenge, outcome, coverId, galleryIds });
    return NextResponse.json({ project, coverId, galleryIds });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Project creation failed." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const slug = String(body?.slug || "").trim();
    if (!slug) return NextResponse.json({ error: "Project slug is required." }, { status: 400 });
    const { deleteAdminProject } = await import("@/lib/content");
    const project = await deleteAdminProject(slug);
    if (!project) return NextResponse.json({ error: "Admin project not found." }, { status: 404 });
    const ids = [String(body?.coverId || ""), ...(Array.isArray(body?.galleryIds) ? body.galleryIds : [])].filter(Boolean);
    await Promise.all(ids.map((id) => deleteImage(id)));
    return NextResponse.json({ deleted: slug });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Project delete failed." }, { status: 400 });
  }
}
