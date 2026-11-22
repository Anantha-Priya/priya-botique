import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 px-4 py-12 sm:py-16">
      <div className="w-full rounded-xl border border-border bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-burgundy">PRIYA account</p>
        <h1 className="mt-3 font-heading text-4xl font-medium">Sign in</h1>
        <div className="mt-6">
          <Suspense><AuthForm mode="login" /></Suspense>
        </div>
        <div className="mt-5 grid gap-2 text-sm">
          <Link className="text-brand-burgundy underline" href="/forgot-password">Forgot password?</Link>
          <Link className="text-brand-burgundy underline" href="/register">Create a PRIYA account</Link>
        </div>
      </div>
    </main>
  );
}
