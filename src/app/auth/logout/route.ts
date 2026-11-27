import { NextResponse, type NextRequest } from "next/server";
import { DELETE_PERMISSION_COOKIE } from "@/lib/admin/delete-permission";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const response = NextResponse.redirect(
    new URL("/login?message=You+have+been+signed+out.", request.url),
  );
  response.cookies.set(DELETE_PERMISSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
