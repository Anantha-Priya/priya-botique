"use client";

import { useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AdminPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;
      setPassword("");
      setConfirmPassword("");
      setMessage("Your administrator password has been updated.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to update password.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-6 shadow-(--shadow-card) sm:p-8"
    >
      <div className="flex items-center gap-2.5">
        <KeyRound className="size-5 text-brand-burgundy" aria-hidden="true" />
        <h2 className="font-heading text-2xl font-medium text-foreground">
          Change Password
        </h2>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Update the password for your administrator account.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium text-foreground">
          New Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            autoComplete="new-password"
            required
            className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-foreground">
          Confirm New Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            autoComplete="new-password"
            required
            className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
          />
        </label>
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="mt-4 text-sm font-medium text-brand-burgundy">
          {message}
        </p>
      ) : null}

      <div className="mt-5">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-burgundy px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-burgundy/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Updating..." : "Update Password"}
        </button>
      </div>
    </form>
  );
}
