import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { AdminPasswordForm } from "@/components/admin/admin-password-form";
import { getAdminContext } from "@/lib/admin/get-admin-context";

export const metadata: Metadata = { title: "Admin Profile" };

export default function AdminProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
          <p role="status" className="text-sm text-muted-foreground">
            Loading administrator profile...
          </p>
        </main>
      }
    >
      <AdminProfileContent />
    </Suspense>
  );
}

async function AdminProfileContent() {
  const { user, isAdmin, fullName } = await getAdminContext();

  if (!user) {
    redirect("/login?next=%2Fadmin%2Fprofile");
  }
  if (!isAdmin) {
    redirect("/account");
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <header className="border-b border-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-burgundy">
          PRIYA&apos;S BOUTIQUE · Administration
        </p>
        <h1 className="mt-2 font-heading text-3xl font-medium text-foreground sm:text-4xl">
          Admin Profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Administrator account details and security settings.
        </p>
      </header>

      <section className="mt-8" aria-labelledby="admin-details-heading">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-(--shadow-card) sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-beige/70 text-brand-burgundy sm:size-20">
                <UserRound className="size-8 sm:size-9" aria-hidden="true" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2
                    id="admin-details-heading"
                    className="font-heading text-2xl font-medium text-foreground"
                  >
                    {fullName || "Boutique Administrator"}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-champagne/70 bg-brand-beige/70 px-3 py-0.5 text-xs font-semibold text-brand-burgundy">
                    <ShieldCheck className="size-3.5" aria-hidden="true" />
                    Administrator
                  </span>
                </div>

                <dl className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-8">
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      Admin Name
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-foreground">
                      {fullName || "Not set"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      Email Address
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-foreground">
                      {user.email ?? "Not available"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <LogOut className="size-4 text-muted-foreground" aria-hidden="true" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mt-8" aria-label="Password settings">
        <AdminPasswordForm />
      </section>
    </main>
  );
}
