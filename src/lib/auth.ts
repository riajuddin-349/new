import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "riaj_admin_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  return process.env.ADMIN_SECRET || "7f9c2e4a8b1d6e3f9a2c5b7d1e8f4a6c9b3d7e2f5a8c1";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function createSession() {
  const now = Date.now();
  const payload = `${now}:${sign(String(now))}`;
  return `${payload}:${sign(payload)}`;
}

export function isValidSession(value: string | undefined) {
  if (!value) return false;
  const parts = value.split(":");
  if (parts.length !== 3) return false;
  const [timestamp, innerSignature, sessionSignature] = parts;
  const payload = `${timestamp}:${innerSignature}`;
  const expected = sign(payload);
  if (sessionSignature.length !== expected.length) return false;
  try {
    if (!timingSafeEqual(Buffer.from(sessionSignature), Buffer.from(expected))) return false;
  } catch {
    return false;
  }
  const created = Number(timestamp);
  return Number.isFinite(created) && Date.now() - created < MAX_AGE * 1000;
}

export async function isAdmin() {
  const store = await cookies();
  return isValidSession(store.get(COOKIE)?.value);
}

export function setSessionCookie(value: string) {
  return {
    name: COOKIE,
    value,
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  };
}

export function clearSessionCookie() {
  return { ...setSessionCookie(""), maxAge: 0 };
}

export { COOKIE };
