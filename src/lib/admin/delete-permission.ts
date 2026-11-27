import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const DELETE_PERMISSION_COOKIE = "priya_admin_delete_perm";
export const DELETE_PERMISSION_TTL_MS = 5 * 60 * 1000;

export type DeletePermissionStatus = "disabled" | "enabled" | "expired";

export interface DeletePermissionState {
  enabled: boolean;
  expiresAt: number | null;
  status: DeletePermissionStatus;
}

interface DeletePermissionPayload {
  userId: string;
  sessionMarker: string;
  exp: number;
}

function getSigningSecret(): string {
  const secret =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.CLOUDINARY_API_SECRET ??
    process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    throw new Error(
      "A server secret is required to sign administrator deletion permissions.",
    );
  }

  return secret;
}

async function getCurrentSessionMarker(): Promise<string> {
  const cookieStore = await cookies();
  const authCookies = cookieStore
    .getAll()
    .filter((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => `${c.name}=${c.value}`)
    .join(";");

  return createHash("sha256")
    .update(authCookies || "no-session")
    .digest("hex")
    .slice(0, 24);
}

function signPayload(encodedPayload: string): string {
  return createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function createDeletePermissionToken(userId: string): Promise<{
  token: string;
  expiresAt: number;
}> {
  const expiresAt = Date.now() + DELETE_PERMISSION_TTL_MS;
  const sessionMarker = await getCurrentSessionMarker();
  const payload: DeletePermissionPayload = {
    userId,
    sessionMarker,
    exp: expiresAt,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(encoded);
  return {
    token: `${encoded}.${signature}`,
    expiresAt,
  };
}

export async function getDeletePermissionState(
  userId: string,
): Promise<DeletePermissionState> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(DELETE_PERMISSION_COOKIE)?.value;

  if (!rawToken) {
    return { enabled: false, expiresAt: null, status: "disabled" };
  }

  const dotIndex = rawToken.indexOf(".");
  if (dotIndex <= 0) {
    return { enabled: false, expiresAt: null, status: "disabled" };
  }

  const encoded = rawToken.slice(0, dotIndex);
  const providedSig = rawToken.slice(dotIndex + 1);

  let expectedSig: string;
  try {
    expectedSig = signPayload(encoded);
  } catch {
    return { enabled: false, expiresAt: null, status: "disabled" };
  }

  if (!safeEqual(providedSig, expectedSig)) {
    return { enabled: false, expiresAt: null, status: "disabled" };
  }

  let payload: DeletePermissionPayload;
  try {
    payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as DeletePermissionPayload;
  } catch {
    return { enabled: false, expiresAt: null, status: "disabled" };
  }

  if (
    typeof payload.userId !== "string" ||
    typeof payload.sessionMarker !== "string" ||
    typeof payload.exp !== "number"
  ) {
    return { enabled: false, expiresAt: null, status: "disabled" };
  }

  const currentMarker = await getCurrentSessionMarker();
  if (payload.userId !== userId || payload.sessionMarker !== currentMarker) {
    return { enabled: false, expiresAt: null, status: "disabled" };
  }

  if (Date.now() >= payload.exp) {
    return { enabled: false, expiresAt: payload.exp, status: "expired" };
  }

  return {
    enabled: true,
    expiresAt: payload.exp,
    status: "enabled",
  };
}
