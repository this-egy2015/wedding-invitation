"use client";

import { useActionState } from "react";
import { FormErrors } from "@/components/FormErrors";
import { createInvitationAction } from "@/features/invitations/actions";

export function NewInvitationForm({ templateOptions }: { templateOptions: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(createInvitationAction, { ok: false, errors: [] });

  return (
    <form action={action} className="max-w-lg space-y-4 rounded-lg border bg-white p-6">
      <h1 className="text-xl font-semibold">Buat Undangan</h1>
      <div>
        <label htmlFor="slug" className="label">
          Slug URL
        </label>
        <input id="slug" name="slug" required placeholder="gaby-afdhal" className="input" />
        <p className="mt-1 text-xs text-neutral-500">
          Menjadi /&lt;slug&gt;. Tidak bisa diubah setelah dibuat agar link tamu tidak rusak.
        </p>
      </div>
      <div>
        <label htmlFor="templateId" className="label">
          Template
        </label>
        <select id="templateId" name="templateId" className="input">
          {templateOptions.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <FormErrors errors={state.errors} />
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Menyimpan..." : "Buat"}
      </button>
    </form>
  );
}
