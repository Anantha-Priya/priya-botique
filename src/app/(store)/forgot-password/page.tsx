import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 px-4 py-12 sm:py-16">
      <div className="w-full rounded-xl border border-border bg-white p-6 sm:p-8">
        <h1 className="font-heading text-4xl font-medium">Reset password</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">We will email a secure password-reset link.</p>
        <div className="mt-6">
          <Suspense><AuthForm mode="forgot" /></Suspense>
        </div>
        <Link className="mt-5 block text-sm text-brand-burgundy underline" href="/login">Back to sign in</Link>
      </div>
    </main>
  );
}
