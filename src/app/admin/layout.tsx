import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminContext } from "@/lib/admin/get-admin-context";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
          Loading admin workspace...
        </div>
      }
    >
      <AdminLayoutGuard>{children}</AdminLayoutGuard>
    </Suspense>
  );
}

async function AdminLayoutGuard({ children }: { children: ReactNode }) {
  const { user, isAdmin, fullName } = await getAdminContext();

  if (!user) {
    redirect("/login?next=%2Fadmin%2Fdashboard");
  }
  if (!isAdmin) {
    redirect("/account");
  }

  return (
    <AdminShell adminName={fullName} adminEmail={user.email ?? ""}>
      {children}
    </AdminShell>
  );
}
