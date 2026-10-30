"use client";

import { useActionState } from "react";
import { FormErrors } from "@/components/FormErrors";
import type { GuestFormState } from "@/features/guests/actions";

type Props = {
  action: (prev: GuestFormState, formData: FormData) => Promise<GuestFormState>;
  initial?: { name: string; partnerName: string | null; allowedGuestCount: number };
  submitLabel: string;
};

/** Used for both adding (form resets after submit) and editing a guest. */
export function GuestForm({ action, initial, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, { ok: false, errors: [] });

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_8rem]">
        <div>
          <label htmlFor="name" className="label">
            Nama tamu
          </label>
          <input id="name" name="name" required maxLength={100} defaultValue={initial?.name} className="input" />
        </div>
        <div>
          <label htmlFor="partnerName" className="label">
            Nama pasangan (opsional)
          </label>
          <input id="partnerName" name="partnerName" maxLength={100} defaultValue={initial?.partnerName ?? ""} className="input" />
        </div>
        <div>
          <label htmlFor="allowedGuestCount" className="label">
            Kuota
          </label>
          <input
            id="allowedGuestCount"
            name="allowedGuestCount"
            type="number"
            min={1}
            max={20}
            required
            defaultValue={initial?.allowedGuestCount ?? 2}
            className="input"
          />
        </div>
      </div>
      <FormErrors errors={state.errors} />
      {state.ok && <p className="text-sm text-green-700">Tersimpan.</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Menyimpan..." : submitLabel}
      </button>
    </form>
  );
}
