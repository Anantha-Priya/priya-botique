"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Clock, ShieldAlert, Trash2 } from "lucide-react";
import type { DeletePermissionState } from "@/lib/admin/delete-permission";

function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function AdminDeletePermissionCard({
  initialState,
}: {
  initialState: DeletePermissionState;
}) {
  const [permission, setPermission] = useState<DeletePermissionState>(initialState);
  const [now, setNow] = useState<number>(() => Date.now());
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!permission.enabled || !permission.expiresAt) return;
    const interval = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (permission.expiresAt && current >= permission.expiresAt) {
        setPermission({
          enabled: false,
          expiresAt: permission.expiresAt,
          status: "expired",
        });
        setFeedback("");
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [permission.enabled, permission.expiresAt]);

  const remainingMs =
    permission.enabled && permission.expiresAt
      ? Math.max(0, permission.expiresAt - now)
      : 0;
  const isEnabled = permission.enabled && remainingMs > 0;
  const isExpired = permission.status === "expired" || (permission.enabled && remainingMs <= 0);

  async function handleEnable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFeedback("");
    setPending(true);

    try {
      const response = await fetch("/api/admin/delete-permission", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "enable", password }),
      });

      const body = (await response.json().catch(() => null)) as
        | (DeletePermissionState & { error?: string })
        | null;

      if (!response.ok || !body?.enabled || !body.expiresAt) {
        throw new Error(body?.error ?? "Unable to verify password.");
      }

      setNow(Date.now());
      setPermission({
        enabled: true,
        expiresAt: body.expiresAt,
        status: "enabled",
      });
      setPassword("");
      setShowPasswordPrompt(false);
      setFeedback(
        `Product deletion enabled. Permission expires in ${formatCountdown(
          Math.max(0, body.expiresAt - Date.now()),
        )}.`,
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to enable product deletion.",
      );
    } finally {
      setPending(false);
    }
  }

  async function handleDisable() {
    setError("");
    setFeedback("");
    setPending(true);

    try {
      const response = await fetch("/api/admin/delete-permission", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "disable" }),
      });

      if (!response.ok) {
        throw new Error("Unable to disable product deletion.");
      }

      setPermission({
        enabled: false,
        expiresAt: null,
        status: "disabled",
      });
      setShowPasswordPrompt(false);
      setPassword("");
      setFeedback("Product deletion is currently disabled.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to disable product deletion.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      aria-labelledby="product-deletion-settings-heading"
      className="rounded-2xl border border-border bg-card p-6 shadow-(--shadow-card) sm:p-8"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="max-w-xl">
          <div className="flex items-center gap-2.5">
            <Trash2 className="size-5 text-brand-burgundy" aria-hidden="true" />
            <h2
              id="product-deletion-settings-heading"
              className="font-heading text-2xl font-medium text-foreground"
            >
              Product Deletion Settings
            </h2>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enable temporary permission to permanently delete products from your boutique catalogue.
          </p>
        </div>

        <span
          className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
            isEnabled
              ? "border-brand-burgundy bg-brand-burgundy text-white"
              : isExpired
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-border bg-brand-beige/60 text-foreground"
          }`}
        >
          <Clock className="size-3.5" aria-hidden="true" />
          {isEnabled
            ? `Enabled · ${formatCountdown(remainingMs)}`
            : isExpired
              ? "Expired"
              : "Disabled"}
        </span>
      </div>

      {/* Current status message */}
      <div
        role="status"
        className={`mt-5 rounded-xl border px-4 py-3 text-sm font-medium ${
          isEnabled
            ? "border-brand-champagne bg-brand-beige/60 text-brand-burgundy"
            : isExpired
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-border bg-background text-muted-foreground"
        }`}
      >
        {isEnabled
          ? `Product deletion enabled. Permission expires in ${formatCountdown(remainingMs)}.`
          : isExpired
            ? "Your deletion permission has expired. Enable it again in Admin Profile."
            : "Product deletion is currently disabled."}
      </div>

      {feedback && !isEnabled && !isExpired ? (
        <p className="sr-only">{feedback}</p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-4 text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      {/* Controls */}
      <div className="mt-5">
        {isEnabled ? (
          <button
            type="button"
            disabled={pending}
            onClick={handleDisable}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-60"
          >
            {pending ? "Disabling..." : "Disable Product Deletion"}
          </button>
        ) : showPasswordPrompt ? (
          <form
            onSubmit={handleEnable}
            className="rounded-xl border border-brand-champagne/70 bg-background p-4 sm:p-5"
          >
            <div className="flex items-start gap-2.5 text-sm text-foreground">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-brand-burgundy" aria-hidden="true" />
              <p>
                Verify your current administrator password to enable product deletion for 5 minutes.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="grid flex-1 gap-1.5 text-sm font-medium text-foreground">
                Current Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  className="min-h-11 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
                />
              </label>

              <div className="flex gap-2.5">
                <button
                  type="submit"
                  disabled={pending}
                  className="min-h-11 rounded-lg bg-brand-burgundy px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-burgundy/90 disabled:opacity-60"
                >
                  {pending ? "Verifying..." : "Verify & Enable"}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setShowPasswordPrompt(false);
                    setPassword("");
                    setError("");
                  }}
                  className="min-h-11 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setError("");
              setShowPasswordPrompt(true);
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-burgundy px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-burgundy/90"
          >
            Enable Product Deletion
          </button>
        )}
      </div>
    </section>
  );
}
