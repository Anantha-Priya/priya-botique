"use client";

import { useRef, useState, type FormEvent } from "react";
import { Home, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { addressSchema } from "@/lib/auth-validation";

export interface CustomerAddress {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export function AddressManager({
  initialAddresses,
  migrationPending = false,
}: {
  initialAddresses: CustomerAddress[];
  migrationPending?: boolean;
}) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [editing, setEditing] = useState<CustomerAddress | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (migrationPending) {
      setError("Address storage is not enabled until the customer-address migration is applied.");
      return;
    }
    setError("");
    setMessage("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const values = addressSchema.parse({
        fullName: String(form.get("fullName") ?? ""),
        phone: String(form.get("phone") ?? ""),
        line1: String(form.get("line1") ?? ""),
        line2: String(form.get("line2") ?? ""),
        city: String(form.get("city") ?? ""),
        state: String(form.get("state") ?? ""),
        postalCode: String(form.get("postalCode") ?? ""),
        country: String(form.get("country") ?? "India"),
        isDefault: form.get("isDefault") === "on",
      });
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Please sign in again.");

      if (values.isDefault) {
        const { error: clearError } = await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", userData.user.id)
          .eq("is_default", true);
        if (clearError) throw clearError;
      }

      const row = {
        user_id: userData.user.id,
        full_name: values.fullName,
        phone: values.phone,
        line1: values.line1,
        line2: values.line2 || null,
        city: values.city,
        state: values.state,
        postal_code: values.postalCode,
        country: values.country,
        is_default: values.isDefault,
      };

      if (editing) {
        const { data, error: saveError } = await supabase
          .from("addresses")
          .update(row)
          .eq("id", editing.id)
          .eq("user_id", userData.user.id)
          .select()
          .single();
        if (saveError) throw saveError;
        setAddresses((current) =>
          current.map((address) => (address.id === editing.id ? data : address)).map((address) => ({
            ...address,
            is_default: values.isDefault ? address.id === editing.id : address.is_default,
          })),
        );
      } else {
        const { data, error: saveError } = await supabase
          .from("addresses")
          .insert(row)
          .select()
          .single();
        if (saveError) throw saveError;
        setAddresses((current) => [
          data,
          ...current.map((address) =>
            values.isDefault ? { ...address, is_default: false } : address,
          ),
        ]);
      }
      const wasEditing = Boolean(editing);
      setEditing(null);
      setMessage(wasEditing ? "Address updated." : "Address saved.");
      setIsModalOpen(false);
      formRef.current?.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save address.");
    } finally {
      setPending(false);
    }
  }

  async function removeAddress(address: CustomerAddress) {
    if (migrationPending) return;
    setPending(true);
    setError("");
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("addresses")
      .delete()
      .eq("id", address.id);
    if (deleteError) {
      setError(deleteError.message);
    } else {
      setAddresses((current) => current.filter((item) => item.id !== address.id));
      if (editing?.id === address.id) {
        setEditing(null);
      }
      setMessage("Address deleted.");
    }
    setPending(false);
  }

  return (
    <div>
      <section>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <MapPin className="size-6 shrink-0 text-brand-burgundy" aria-hidden="true" />
              <h2 id="addresses-heading" className="font-heading text-2xl font-medium text-foreground sm:text-3xl">
                Delivery Addresses
              </h2>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Your saved delivery addresses will appear here.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-brand-beige px-3.5 py-1 text-xs font-semibold text-foreground">
            {addresses.length} saved
          </span>
        </div>

        {message && !isModalOpen ? (
          <p role="status" className="mt-4 text-sm font-medium text-brand-burgundy">
            {message}
          </p>
        ) : null}
        {error && !isModalOpen ? (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {migrationPending ? (
          <p className="mt-6 rounded-2xl border border-brand-champagne bg-brand-beige p-5 text-sm text-foreground">
            Address storage is prepared but pending migration approval.
          </p>
        ) : addresses.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
            No saved addresses yet.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {addresses.map((address) => (
              <li
                key={address.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:flex-row sm:items-center sm:p-6"
              >
                <div className="flex items-start gap-4 sm:items-center sm:gap-5">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-beige/70 text-brand-burgundy sm:size-14">
                    <Home className="size-5 sm:size-6" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 sm:border-l sm:border-border sm:pl-5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <p className="text-base font-semibold text-foreground">{address.full_name}</p>
                      {address.is_default ? (
                        <span className="inline-flex items-center rounded-full bg-brand-beige px-2.5 py-0.5 text-xs font-medium text-foreground">
                          Default
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{address.phone}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}{" "}
                      {address.postal_code}, {address.country}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(address);
                      setError("");
                      setMessage("");
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-brand-burgundy"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    Edit
                  </button>
                  <span className="h-4 w-px bg-border" aria-hidden="true" />
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => removeAddress(address)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setError("");
              setMessage("");
              setIsModalOpen(true);
            }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand-burgundy px-7 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-burgundy/90"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add New Address
          </button>
        </div>
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="address-modal-title"
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-(--shadow-floating)"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 id="address-modal-title" className="font-heading text-xl font-medium text-foreground">
                {editing ? "Edit Address" : "Add New Address"}
              </h3>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditing(null);
                  setError("");
                }}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <form
              ref={formRef}
              key={editing ? editing.id : "new-address"}
              onSubmit={submit}
              className="mt-5 grid gap-3"
            >
              <input name="fullName" defaultValue={editing?.full_name ?? ""} placeholder="Full name" required className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground" />
              <input name="phone" defaultValue={editing?.phone ?? ""} placeholder="Phone" required className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground" />
              <input name="line1" defaultValue={editing?.line1 ?? ""} placeholder="Address line 1" required className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground" />
              <input name="line2" defaultValue={editing?.line2 ?? ""} placeholder="Address line 2 (optional)" className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground" />
              <div className="grid grid-cols-2 gap-3">
                <input name="city" defaultValue={editing?.city ?? ""} placeholder="City" required className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground" />
                <input name="state" defaultValue={editing?.state ?? ""} placeholder="State" required className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input name="postalCode" defaultValue={editing?.postal_code ?? ""} placeholder="Postal code" required className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground" />
                <input name="country" defaultValue={editing?.country ?? "India"} placeholder="Country" required className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground" />
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input name="isDefault" type="checkbox" defaultChecked={editing ? editing.is_default : addresses.length === 0} />
                Make default address
              </label>
              {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
              <div className="mt-1 flex gap-3">
                <button type="submit" disabled={pending || migrationPending} className="min-h-11 flex-1 rounded-lg bg-brand-burgundy px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-burgundy/90 disabled:opacity-60">
                  {editing ? "Save Address" : "Save Address"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditing(null);
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
    </div>
  );
}
