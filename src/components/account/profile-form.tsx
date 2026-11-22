"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { profileSchema } from "@/lib/auth-validation";

export function ProfileForm({
  fullName,
  phone,
}: {
  fullName: string;
  phone: string;
}) {
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
      setMessage("Profile updated.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update profile.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid max-w-xl gap-4">
      <label className="grid gap-1.5 text-sm">
        Full name
        <input name="fullName" defaultValue={fullName} autoComplete="name" required className="min-h-11 rounded-md border border-border bg-white px-3" />
      </label>
      <label className="grid gap-1.5 text-sm">
        Phone
        <input name="phone" defaultValue={phone} autoComplete="tel" className="min-h-11 rounded-md border border-border bg-white px-3" />
      </label>
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      {message ? <p role="status" className="text-sm text-green-700">{message}</p> : null}
      <button type="submit" disabled={pending} className="min-h-11 w-fit rounded-md bg-brand-burgundy px-5 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
