import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 px-4 py-12 sm:py-16">
      <div className="w-full rounded-xl border border-border bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-burgundy">PRIYA account</p>
        <h1 className="mt-3 font-heading text-4xl font-medium">Create account</h1>
        <div className="mt-6">
          <Suspense><AuthForm mode="register" /></Suspense>
        </div>
        <p className="mt-5 text-sm">Already registered? <Link className="text-brand-burgundy underline" href="/login">Sign in</Link></p>
      </div>
    </main>
  );
}
