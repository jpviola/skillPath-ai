import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";

const COOKIE_NAME = "skillpath_device_id";

function hashString(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

function normalizeIp(value: string | null): string {
  if (!value) return "unknown";
  const first = value.split(",")[0]?.trim() || "unknown";
  return first;
}

export function getClientFingerprint(req: NextRequest): {
  cookieId: string;
  fingerprint: string;
  setCookie: boolean;
} {
  const existing = req.cookies.get(COOKIE_NAME)?.value?.trim();
  const cookieId = existing || randomUUID();
  const forwardedFor =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-vercel-forwarded-for") ||
    null;
  const ip = normalizeIp(forwardedFor);
  const userAgent = req.headers.get("user-agent")?.slice(0, 80) || "unknown";
  const fingerprint = `ip:${hashString(ip)}:ua:${hashString(userAgent)}:id:${cookieId}`;
  return { cookieId, fingerprint, setCookie: !existing };
}

export function buildDeviceCookie(value: string) {
  return {
    name: COOKIE_NAME,
    value,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    },
  };
}
