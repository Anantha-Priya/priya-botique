import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, PackagePlus } from "lucide-react";
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
      <header className="flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          
          <h1 className="mt-3 font-heading text-4xl font-medium text-foreground sm:text-5xl">
            My Account
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            
            {user.email ? (
              <span className="ml-2 text-xs text-muted-foreground/80">
                ({user.email})
              </span>
            ) : null}
          </p>
        </div>

        <nav aria-label="Account actions" className="flex flex-wrap items-center gap-2.5">
          {profile?.role === "admin" ? (
            <Link
              href="/admin/products"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-burgundy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-burgundy/90"
            >
              <PackagePlus className="size-4" aria-hidden="true" />
              Manage products
            </Link>
          ) : null}
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <LogOut className="size-4 text-muted-foreground" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </nav>
      </header>

      <section className="mt-8" aria-labelledby="profile-heading">
        <ProfileForm
          fullName={profile?.full_name ?? ""}
          phone={profile?.phone ?? ""}
        />
      </section>

      <section className="mt-10 sm:mt-12" aria-labelledby="addresses-heading">
        <AddressManager
          initialAddresses={addresses ?? []}
          migrationPending={migrationPending}
        />
      </section>
    </main>
  );
}
