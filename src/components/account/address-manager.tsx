"use client";

import { useRef, useState, type FormEvent } from "react";
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
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.8fr)]">
      <section>
        <h2 className="font-heading text-2xl font-medium">Saved addresses</h2>
        {migrationPending ? (
          <p className="mt-4 rounded-md border border-brand-champagne bg-brand-beige p-4 text-sm">
            Address storage is prepared but pending migration approval.
          </p>
        ) : addresses.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No saved addresses yet.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {addresses.map((address) => (
              <li key={address.id} className="rounded-xl border border-border bg-white p-4 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{address.full_name}{address.is_default ? " · Default" : ""}</p>
                    <p className="mt-1">{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
                    <p>{address.city}, {address.state} {address.postal_code}</p>
                    <p>{address.country}</p>
                    <p className="mt-1 text-muted-foreground">{address.phone}</p>
                  </div>
                  <div className="grid gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(address);
                        setError("");
                        setMessage("");
                      }}
                      className="text-brand-burgundy underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => removeAddress(address)}
                      className="text-red-700 underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-heading text-2xl font-medium">{editing ? "Edit address" : "Add address"}</h2>
        <form
          ref={formRef}
          key={editing ? editing.id : "new-address"}
          onSubmit={submit}
          className="mt-4 grid gap-3"
        >
          <input
            name="fullName"
            defaultValue={editing?.full_name ?? ""}
            placeholder="Full name"
            required
            className="min-h-11 rounded-md border border-border px-3"
          />
          <input
            name="phone"
            defaultValue={editing?.phone ?? ""}
            placeholder="Phone"
            required
            className="min-h-11 rounded-md border border-border px-3"
          />
          <input
            name="line1"
            defaultValue={editing?.line1 ?? ""}
            placeholder="Address line 1"
            required
            className="min-h-11 rounded-md border border-border px-3"
          />
          <input
            name="line2"
            defaultValue={editing?.line2 ?? ""}
            placeholder="Address line 2 (optional)"
            className="min-h-11 rounded-md border border-border px-3"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              name="city"
              defaultValue={editing?.city ?? ""}
              placeholder="City"
              required
              className="min-h-11 rounded-md border border-border px-3"
            />
            <input
              name="state"
              defaultValue={editing?.state ?? ""}
              placeholder="State"
              required
              className="min-h-11 rounded-md border border-border px-3"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              name="postalCode"
              defaultValue={editing?.postal_code ?? ""}
              placeholder="Postal code"
              required
              className="min-h-11 rounded-md border border-border px-3"
            />
            <input
              name="country"
              defaultValue={editing?.country ?? "India"}
              placeholder="Country"
              required
              className="min-h-11 rounded-md border border-border px-3"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              name="isDefault"
              type="checkbox"
              defaultChecked={editing ? editing.is_default : addresses.length === 0}
            />
            Make default address
          </label>
          {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
          {message ? <p role="status" className="text-sm text-green-700">{message}</p> : null}
          <button
            type="submit"
            disabled={pending || migrationPending}
            className="min-h-11 rounded-md bg-brand-burgundy px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {editing ? "Save address" : "Add address"}
          </button>
          {editing ? (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setError("");
                setMessage("");
              }}
              className="text-sm text-brand-burgundy underline"
            >
              Cancel editing
            </button>
          ) : null}
        </form>
      </section>
    </div>
  );
}
