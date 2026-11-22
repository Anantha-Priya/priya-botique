import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 px-4 py-12 sm:py-16">
      <div className="w-full rounded-xl border border-border bg-white p-6 sm:p-8">
        <h1 className="font-heading text-4xl font-medium">Choose a new password</h1>
        <div className="mt-6">
          <Suspense><AuthForm mode="reset" /></Suspense>
        </div>
      </div>
    </main>
  );
}
