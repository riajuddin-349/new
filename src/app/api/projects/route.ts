import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { addProject, getAllProjects } from "@/lib/content";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const allowed = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
]);
const MAX_FILE_SIZE = 15 * 1024 * 1024;

export async function GET() {
  return NextResponse.json({ items: await getAllProjects() });
}

async function saveImage(file: File, folder: "projects") {
  const extension = allowed.get(file.type);
  if (!extension) throw new Error(`Unsupported image type: ${file.type}`);
  if (file.size > MAX_FILE_SIZE) throw new Error(`${file.name} is larger than 15MB.`);
  const id = randomUUID();
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${id}${extension}`), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${folder}/${id}${extension}`;
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const title = String(form.get("title") || "").trim();
  const slug = String(form.get("slug") || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const category = String(form.get("category") || "").trim();
  const year = String(form.get("year") || new Date().getFullYear()).trim();
  const client = String(form.get("client") || "").trim();
  const role = String(form.get("role") || "UI/UX Designer").trim();
  const description = String(form.get("description") || "").trim();
  const challenge = String(form.get("challenge") || "").trim();
  const outcome = String(form.get("outcome") || "").trim();
  const cover = form.get("cover");
  const galleryFiles = form.getAll("gallery").filter((value): value is File => value instanceof File);

  if (!title || !slug || !category || !description || !(cover instanceof File)) {
    return NextResponse.json({ error: "Title, slug, category, description and cover image are required." }, { status: 400 });
  }

  const existing = await getAllProjects();
  if (existing.some((item) => item.slug === slug)) return NextResponse.json({ error: "A project with this slug already exists." }, { status: 409 });

  try {
    const image = await saveImage(cover, "projects");
    const gallery: string[] = [];
    for (const file of galleryFiles) gallery.push(await saveImage(file, "projects"));

    const project = await addProject({
      id: randomUUID(), slug, title, category, image, gallery, year, client, role,
      description, challenge, outcome,
    });
    return NextResponse.json({ project });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 400 });
  }
}
