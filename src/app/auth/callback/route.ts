import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "";

  if (!code) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("The sign-in link is invalid or expired.")}`, request.url),
    );
  }

  const supabase = await createClient();
  const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url),
    );
  }

  if (next === "/reset-password") {
    return NextResponse.redirect(new URL("/reset-password", request.url));
  }

  let isAdmin = false;
  if (sessionData.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", sessionData.user.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";
  }

  const safeNext = isAdmin
    ? next.startsWith("/admin")
      ? next
      : "/admin/dashboard"
    : next.startsWith("/account")
      ? next
      : "/account";

  return NextResponse.redirect(new URL(safeNext, request.url));
}
