import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/account/profile-form";
import { AddressManager } from "@/components/account/address-manager";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,phone,role")
    .eq("id", user.id)
    .maybeSingle();

  const { data: addresses, error: addressError } = await supabase
    .from("addresses")
    .select("id,user_id,full_name,phone,line1,line2,city,state,postal_code,country,is_default")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const migrationPending =
    addressError?.code === "PGRST205" ||
    addressError?.code === "42P01";

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="Account sections" className="mb-8 flex flex-wrap gap-2 border-b border-border pb-4">
        <Link href="/account" className="rounded-md bg-brand-burgundy px-4 py-2 text-sm font-semibold text-white">Overview</Link>
        <form action="/auth/logout" method="post">
          <button type="submit" className="min-h-10 rounded-md border border-border px-4 text-sm">Sign out</button>
        </form>
        {profile?.role === "admin" ? (
          <Link href="/admin/product-images" className="min-h-10 rounded-md border border-border px-4 py-2 text-sm">
            Product images
          </Link>
        ) : null}
      </nav>

      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-burgundy">PRIYA account</p>
        <h1 className="mt-3 font-heading text-4xl font-medium">My account</h1>
        <p className="mt-3 text-sm text-muted-foreground">{user.email}</p>
      </header>

      <section className="mt-10" aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="font-heading text-2xl font-medium">Profile</h2>
        <div className="mt-4">
          <ProfileForm
            fullName={profile?.full_name ?? ""}
            phone={profile?.phone ?? ""}
          />
        </div>
      </section>

      <section className="mt-12 border-t border-border pt-8" aria-labelledby="addresses-heading">
        <h2 id="addresses-heading" className="font-heading text-2xl font-medium">Addresses</h2>
        <div className="mt-5">
          <AddressManager
            initialAddresses={addresses ?? []}
            migrationPending={migrationPending}
          />
        </div>
      </section>
    </main>
  );
}
