"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  loginSchema,
  registerSchema,
  emailSchema,
} from "@/lib/auth-validation";

type AuthMode = "login" | "register" | "forgot" | "reset";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(
    searchParams.get("error") ?? "",
  );
  const [message, setMessage] = useState(
    searchParams.get("message") ?? "",
  );
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    const supabase = createClient();
    try {
      if (mode === "login") {
        const values = loginSchema.parse({
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? ""),
        });
        const { error: authError } = await supabase.auth.signInWithPassword(values);
        if (authError) throw authError;
        const next = searchParams.get("next");
        router.push(next?.startsWith("/account") ? next : "/account");
        router.refresh();
        return;
      }

      if (mode === "register") {
        const values = registerSchema.parse({
          fullName: String(form.get("fullName") ?? ""),
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? ""),
          confirmPassword: String(form.get("confirmPassword") ?? ""),
        });
        const { data, error: authError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: { full_name: values.fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (authError) throw authError;
        if (data.session) {
          router.push("/account");
          router.refresh();
        } else {
          setMessage("Check your email to confirm your PRIYA account.");
        }
        return;
      }

      if (mode === "forgot") {
        const email = emailSchema.parse(String(form.get("email") ?? ""));
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (authError) throw authError;
        setMessage("If an account exists for that email, password reset instructions were sent.");
        return;
      }

      const password = String(form.get("password") ?? "");
      const confirmPassword = String(form.get("confirmPassword") ?? "");
      if (password.length < 8) throw new Error("Password must be at least 8 characters.");
      if (password !== confirmPassword) throw new Error("Passwords do not match.");
      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) throw authError;
      setMessage("Your password has been updated.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to complete the request.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      {mode === "register" ? (
        <label className="grid gap-1.5 text-sm">
          Full name
          <input name="fullName" autoComplete="name" required className="min-h-11 rounded-md border border-border bg-white px-3" />
        </label>
      ) : null}
      {(mode === "login" || mode === "register" || mode === "forgot") ? (
        <label className="grid gap-1.5 text-sm">
          Email
          <input name="email" type="email" autoComplete="email" required className="min-h-11 rounded-md border border-border bg-white px-3" />
        </label>
      ) : null}
      {(mode === "login" || mode === "register" || mode === "reset") ? (
        <label className="grid gap-1.5 text-sm">
          {mode === "reset" ? "New password" : "Password"}
          <input name="password" type="password" minLength={mode === "login" ? 1 : 8} autoComplete={mode === "login" ? "current-password" : "new-password"} required className="min-h-11 rounded-md border border-border bg-white px-3" />
        </label>
      ) : null}
      {(mode === "register" || mode === "reset") ? (
        <label className="grid gap-1.5 text-sm">
          Confirm password
          <input name="confirmPassword" type="password" minLength={8} autoComplete="new-password" required className="min-h-11 rounded-md border border-border bg-white px-3" />
        </label>
      ) : null}
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      {message ? <p role="status" className="text-sm text-green-700">{message}</p> : null}
      <button type="submit" disabled={pending} className="min-h-12 rounded-md bg-brand-burgundy px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
        {pending
          ? "Please wait..."
          : mode === "login"
            ? "Sign in"
            : mode === "register"
              ? "Create account"
              : mode === "forgot"
                ? "Send reset link"
                : "Update password"}
      </button>
    </form>
  );
}
