import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getAdminContext() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(`Unable to verify the current user: ${userError.message}`);
  }

  if (!user) {
    return { supabase, user: null, isAdmin: false };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Unable to verify administrator access: ${profileError.message}`);
  }

  return { supabase, user, isAdmin: profile?.role === "admin" };
}
