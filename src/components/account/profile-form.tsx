"use client";

import { useState, type FormEvent } from "react";
import { Pencil, UserRound, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { profileSchema } from "@/lib/auth-validation";

export function ProfileForm({
  fullName,
  phone,
}: {
  fullName: string;
  phone: string;
}) {
  const [currentFullName, setCurrentFullName] = useState(fullName);
  const [currentPhone, setCurrentPhone] = useState(phone);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const values = profileSchema.parse({
        fullName: String(form.get("fullName") ?? ""),
        phone: String(form.get("phone") ?? ""),
      });
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Please sign in again.");
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: values.fullName, phone: values.phone })
        .eq("id", userData.user.id);
      if (updateError) throw updateError;
      setCurrentFullName(values.fullName);
      setCurrentPhone(values.phone ?? "");
      setMessage("Profile updated.");
      setIsModalOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update profile.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-(--shadow-card) sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-beige/70 text-brand-burgundy sm:size-20">
              <UserRound className="size-8 sm:size-9" aria-hidden="true" />
            </div>

            <div>
              <h2 id="profile-heading" className="font-heading text-2xl font-medium text-foreground">
                Personal Information
              </h2>

              <dl className="mt-3 grid gap-4 sm:grid-cols-2 sm:gap-8">
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Full Name</dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground sm:text-base">
                    {currentFullName || "Not provided"}
                  </dd>
                </div>
                <div className="sm:border-l sm:border-border sm:pl-8">
                  <dt className="text-xs font-medium text-muted-foreground">Phone Number</dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground sm:text-base">
                    {currentPhone || "Not provided"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              setMessage("");
              setIsModalOpen(true);
            }}
            className="inline-flex min-h-10 w-fit shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-burgundy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-burgundy/90"
          >
            <Pencil className="size-4" aria-hidden="true" />
            Edit Profile
          </button>
        </div>

        {message ? (
          <p role="status" className="mt-4 text-sm font-medium text-brand-burgundy">
            {message}
          </p>
        ) : null}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-modal-title"
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-(--shadow-floating)"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 id="edit-profile-modal-title" className="font-heading text-xl font-medium text-foreground">
                Edit Profile
              </h3>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => {
                  setIsModalOpen(false);
                  setError("");
                }}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={submit} className="mt-5 grid gap-4">
              <label className="grid gap-1.5 text-sm font-medium text-foreground">
                Full Name
                <input
                  name="fullName"
                  defaultValue={currentFullName}
                  autoComplete="name"
                  required
                  className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-foreground">
                Phone Number
                <input
                  name="phone"
                  defaultValue={currentPhone}
                  autoComplete="tel"
                  className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                />
              </label>
              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="mt-1 flex gap-3">
                <button
                  type="submit"
                  disabled={pending}
                  className="min-h-11 flex-1 rounded-lg bg-brand-burgundy px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-burgundy/90 disabled:opacity-60"
                >
                  {pending ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError("");
                  }}
                  className="min-h-11 rounded-lg border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
