import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { addGalleryItems, getGallery } from "@/lib/content";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const allowed = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/avif", ".avif"],
]);
const MAX_FILE_SIZE = 15 * 1024 * 1024;

export async function GET() {
  return NextResponse.json({ items: await getGallery() });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const title = String(form.get("title") || "Gallery").trim() || "Gallery";
  const files = form.getAll("images").filter((value): value is File => value instanceof File);
  if (!files.length) return NextResponse.json({ error: "Select at least one image." }, { status: 400 });

  const uploadDir = path.join(process.cwd(), "public", "uploads", "gallery");
  await mkdir(uploadDir, { recursive: true });
  const items = [];

  for (const file of files) {
    const extension = allowed.get(file.type);
    if (!extension) return NextResponse.json({ error: `Unsupported image type: ${file.type}` }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: `${file.name} is larger than 15MB.` }, { status: 400 });
    const id = randomUUID();
    await writeFile(path.join(uploadDir, `${id}${extension}`), Buffer.from(await file.arrayBuffer()));
    items.push({ id, title, image: `/uploads/gallery/${id}${extension}`, createdAt: new Date().toISOString() });
  }

  return NextResponse.json({ items: await addGalleryItems(items) });
}
