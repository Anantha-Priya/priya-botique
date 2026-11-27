import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  createDeletePermissionToken,
  DELETE_PERMISSION_COOKIE,
  DELETE_PERMISSION_TTL_MS,
  getDeletePermissionState,
} from "@/lib/admin/delete-permission";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import { isSameSiteRequest } from "@/lib/admin/is-same-site-request";
import { getSupabaseEnvironment } from "@/lib/supabase/env";

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("enable"),
    password: z.string().min(1, "Enter your current password to continue."),
  }),
  z.object({
    action: z.literal("disable"),
  }),
]);

export async function GET() {
  const admin = await getAdminContext();
  if (!admin.user) {
    return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  }
  if (!admin.isAdmin) {
    return NextResponse.json(
      { error: "Administrator access is required." },
      { status: 403 },
    );
  }

  const state = await getDeletePermissionState(admin.user.id);
  return NextResponse.json(state);
}

export async function POST(request: NextRequest) {
  if (!isSameSiteRequest(request)) {
    return NextResponse.json(
      { error: "Request origin is not allowed." },
      { status: 403 },
    );
  }

  const admin = await getAdminContext();
  if (!admin.user) {
    return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  }
  if (!admin.isAdmin) {
    return NextResponse.json(
      { error: "Administrator access is required." },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue =
      parsed.error.issues[0]?.message ?? "Invalid request payload.";
    return NextResponse.json({ error: firstIssue }, { status: 400 });
  }

  if (parsed.data.action === "disable") {
    const response = NextResponse.json({
      enabled: false,
      expiresAt: null,
      status: "disabled" as const,
    });
    response.cookies.set(DELETE_PERMISSION_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  const email = admin.user.email;
  if (!email) {
    return NextResponse.json(
      { error: "Unable to verify administrator email." },
      { status: 400 },
    );
  }

  // Verify current password without modifying the active session cookies.
  const { url, publishableKey } = getSupabaseEnvironment();
  const verifyClient = createSupabaseClient(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: verifyData, error: verifyError } =
    await verifyClient.auth.signInWithPassword({
      email,
      password: parsed.data.password,
    });

  if (verifyError || !verifyData.user || verifyData.user.id !== admin.user.id) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 401 },
    );
  }

  const { token, expiresAt } = await createDeletePermissionToken(admin.user.id);
  const response = NextResponse.json({
    enabled: true,
    expiresAt,
    status: "enabled" as const,
  });

  response.cookies.set(DELETE_PERMISSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(DELETE_PERMISSION_TTL_MS / 1000),
  });

  return response;
}
