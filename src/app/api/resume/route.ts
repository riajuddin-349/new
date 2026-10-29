import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const PUBLIC_ID = "portfolio/resume.pdf";
const cloud = () => process.env.CLOUDINARY_CLOUD_NAME;
const key = () => process.env.CLOUDINARY_API_KEY;
const secret = () => process.env.CLOUDINARY_API_SECRET;
const configured = () => Boolean(cloud() && key() && secret());

function signature(params: Record<string, string>) {
  const canonical = Object.keys(params).sort().map((name) => `${name}=${params[name]}`).join("&");
  return createHash("sha1").update(canonical + secret()).digest("hex");
}

const adminAuth = () => ({ Authorization: `Basic ${Buffer.from(`${key()}:${secret()}`).toString("base64")}` });

async function clearResumeAccessControl() {
  const encodedPublicId = PUBLIC_ID.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud()}/resources/raw/upload/${encodedPublicId}`,
    {
      method: "POST",
      headers: { ...adminAuth(), "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ access_control: "[]", invalidate: "true" }),
      cache: "no-store",
    },
  );
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Unable to clear resume access restrictions: ${details.slice(0, 300)}`);
  }
}

async function currentResume() {
  if (!configured()) return { configured: false, resume: null };

  // Cloudinary's Admin API uses HTTP Basic authentication, not upload signatures.
  const encodedPublicId = PUBLIC_ID.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud()}/resources/raw/upload/${encodedPublicId}`,
    { headers: adminAuth(), cache: "no-store" },
  );

  if (response.status === 404) return { configured: true, resume: null };
  if (!response.ok) throw new Error("Unable to check resume storage.");
  const data = await response.json();

  // Repair an existing asset that still has an ACL restriction from an earlier upload.
  if (Array.isArray(data.access_control) && data.access_control.length > 0) {
    await clearResumeAccessControl();
  }

  return { configured: true, resume: { url: data.secure_url as string, updatedAt: data.created_at as string } };
}

export async function GET() {
  try {
    return NextResponse.json(await currentResume());
  } catch {
    return NextResponse.json({ error: "Unable to load resume right now.", configured: configured() }, { status: 502 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!configured()) return NextResponse.json({ error: "Resume storage is not configured. Add the Cloudinary environment variables in Vercel." }, { status: 503 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a PDF resume." }, { status: 400 });
  if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) return NextResponse.json({ error: "Only PDF resumes are supported." }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "The PDF must be 10MB or smaller." }, { status: 400 });

  const timestamp = String(Math.floor(Date.now() / 1000));
  // Explicitly clear per-asset access restrictions. access_mode is deprecated by Cloudinary.
  const params = { access_control: "[]", overwrite: "true", public_id: PUBLIC_ID, timestamp };
  const payload = new FormData();
  payload.append("file", file, "resume.pdf");
  payload.append("public_id", PUBLIC_ID);
  payload.append("access_control", "[]");
  payload.append("overwrite", "true");
  payload.append("timestamp", timestamp);
  payload.append("api_key", key()!);
  payload.append("signature", signature(params));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud()}/raw/upload`, { method: "POST", body: payload });
  const data = await response.json();
  if (!response.ok) return NextResponse.json({ error: data.error?.message || "Cloudinary upload failed." }, { status: 502 });

  // Upload parameters alone may not clear an ACL already stored on an overwritten asset.
  try {
    await clearResumeAccessControl();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to publish the uploaded resume.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({ resume: { url: data.secure_url, updatedAt: data.created_at } });
}

export async function DELETE() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!configured()) return NextResponse.json({ error: "Resume storage is not configured." }, { status: 503 });

  const timestamp = String(Math.floor(Date.now() / 1000));
  const params = { public_id: PUBLIC_ID, timestamp };
  const payload = new FormData();
  payload.append("public_id", PUBLIC_ID);
  payload.append("timestamp", timestamp);
  payload.append("api_key", key()!);
  payload.append("signature", signature(params));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud()}/raw/destroy`, { method: "POST", body: payload });
  const data = await response.json();
  if (!response.ok || data.result === "error") return NextResponse.json({ error: data.error?.message || "Cloudinary could not delete the resume." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
