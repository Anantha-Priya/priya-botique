"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Pin,
  PlusCircle,
  ShieldCheck,
  Store,
  UserRound,
  X,
} from "lucide-react";

interface AdminShellProps {
  adminName: string;
  adminEmail: string;
  children: ReactNode;
}

const NAV_ITEMS = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    match: (pathname: string) => pathname === "/admin/dashboard",
  },
  {
    href: "/admin/products",
    label: "Manage Products",
    icon: Package,
    match: (pathname: string) =>
      pathname === "/admin/products" ||
      (pathname.startsWith("/admin/products/") &&
        pathname !== "/admin/products/new"),
  },
  {
    href: "/admin/products/new",
    label: "Add Product",
    icon: PlusCircle,
    match: (pathname: string) => pathname === "/admin/products/new",
  },
  {
    href: "/admin/new-arrivals",
    label: "New Arrivals",
    icon: Pin,
    match: (pathname: string) => pathname === "/admin/new-arrivals",
  },
  {
    href: "/admin/profile",
    label: "Admin Profile",
    icon: UserRound,
    match: (pathname: string) => pathname === "/admin/profile",
  },
] as const;

function SidebarContent({
  pathname,
  collapsed,
  isMobile,
  onToggleCollapse,
  onCloseMobile,
}: {
  pathname: string;
  collapsed: boolean;
  isMobile?: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}) {
  const showLabels = isMobile || !collapsed;

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-5">
          <Link
            href="/admin/dashboard"
            onClick={() => isMobile && onCloseMobile()}
            className="flex min-w-0 items-center gap-2.5"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-burgundy font-heading text-base font-semibold text-white">
              P
            </span>
            {showLabels ? (
              <div className="min-w-0">
                <p className="truncate font-heading text-sm font-semibold tracking-wider text-foreground">
                  PRIYA&apos;S BOUTIQUE
                </p>
                <p className="truncate text-[11px] font-medium uppercase tracking-[0.16em] text-brand-burgundy">
                  Admin Studio
                </p>
              </div>
            ) : null}
          </Link>

          {isMobile ? (
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={onCloseMobile}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={onToggleCollapse}
              className="hidden rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:inline-flex"
            >
              {collapsed ? (
                <ChevronRight className="size-4" aria-hidden="true" />
              ) : (
                <ChevronLeft className="size-4" aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        <nav aria-label="Admin sidebar navigation" className="space-y-1 p-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!showLabels ? item.label : undefined}
                onClick={() => isMobile && onCloseMobile()}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-burgundy text-white shadow-sm"
                    : "text-foreground hover:bg-brand-beige/70 hover:text-brand-burgundy"
                } ${!showLabels ? "justify-center px-2" : ""}`}
              >
                <Icon className="size-4.5 shrink-0" aria-hidden="true" />
                {showLabels ? <span className="truncate">{item.label}</span> : null}
              </Link>
            );
          })}

          <div className="my-3 border-t border-border" />

          <Link
            href="/"
            title={!showLabels ? "View Storefront" : undefined}
            onClick={() => isMobile && onCloseMobile()}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-brand-beige/70 hover:text-brand-burgundy ${
              !showLabels ? "justify-center px-2" : ""
            }`}
          >
            <Store className="size-4.5 shrink-0" aria-hidden="true" />
            {showLabels ? <span className="truncate">View Storefront</span> : null}
          </Link>
        </nav>
      </div>

      <div className="border-t border-border p-3">
        <form action="/auth/logout" method="post">
          <button
            type="submit"
            title={!showLabels ? "Sign Out" : undefined}
            className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-destructive/10 hover:text-destructive ${
              !showLabels ? "justify-center px-2" : ""
            }`}
          >
            <LogOut className="size-4.5 shrink-0" aria-hidden="true" />
            {showLabels ? <span>Sign Out</span> : null}
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({
  adminName,
  adminEmail,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (adminName || adminEmail || "A")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop collapsible sidebar */}
      <aside
        className={`hidden shrink-0 border-r border-border bg-card transition-[width] duration-200 lg:block ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="sticky top-0 h-screen overflow-y-auto">
          <SidebarContent
            pathname={pathname}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((prev) => !prev)}
            onCloseMobile={() => setMobileOpen(false)}
          />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 h-full w-72 max-w-[85vw] border-r border-border bg-card shadow-(--shadow-floating)">
            <SidebarContent
              pathname={pathname}
              collapsed={false}
              isMobile
              onToggleCollapse={() => setCollapsed((prev) => !prev)}
              onCloseMobile={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open admin navigation"
                onClick={() => setMobileOpen(true)}
                className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-secondary lg:hidden"
              >
                <Menu className="size-5" aria-hidden="true" />
              </button>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-heading text-base font-semibold tracking-wide text-foreground sm:text-lg">
                    PRIYA&apos;S BOUTIQUE
                  </span>
                  <span className="hidden text-muted-foreground sm:inline">/</span>
                  <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
                    Admin Dashboard
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
              <span className="hidden items-center gap-1.5 rounded-full border border-brand-champagne/70 bg-brand-beige/70 px-3 py-1 text-xs font-semibold text-brand-burgundy md:inline-flex">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Administrator
              </span>

              <Link
                href="/"
                className="hidden min-h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-brand-burgundy hover:text-brand-burgundy sm:inline-flex"
              >
                <Store className="size-3.5" aria-hidden="true" />
                View Storefront
              </Link>

              <Link
                href="/admin/profile"
                aria-label="Admin profile"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background py-1 pr-3 pl-1 text-xs font-medium text-foreground transition-colors hover:border-brand-burgundy"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-brand-burgundy text-xs font-semibold text-white">
                  {initials}
                </span>
                <span className="hidden max-w-28 truncate sm:inline">
                  {adminName || "Admin"}
                </span>
              </Link>

              <form action="/auth/logout" method="post" className="hidden sm:block">
                <button
                  type="submit"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <LogOut className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
