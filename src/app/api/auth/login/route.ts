import { NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  const configuredPassword = process.env.ADMIN_PASSWORD || "ZenbitxAdmin@2026!Portfolio";

  if (!configuredPassword) {
    return NextResponse.json({ error: "ADMIN_PASSWORD is not configured on the server." }, { status: 500 });
  }

  if (!body?.password || body.password !== configuredPassword) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(setSessionCookie(createSession()));
  return response;
}
