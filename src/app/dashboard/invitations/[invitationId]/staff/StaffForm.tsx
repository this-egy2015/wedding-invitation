"use client";

import { useActionState } from "react";
import { FormErrors } from "@/components/FormErrors";
import { addStaffAction } from "@/features/invitations/staff-actions";

export function StaffForm({ invitationId }: { invitationId: string }) {
  const [state, action, pending] = useActionState(addStaffAction.bind(null, invitationId), { ok: false, errors: [] });
  return (
    <form action={action} className="space-y-3 rounded-lg border bg-white p-4">
      <label htmlFor="staff-email" className="label">Email petugas</label>
      <input id="staff-email" name="email" type="email" required maxLength={254} autoComplete="off" className="input" />
      <p className="text-sm text-neutral-600">Petugas dapat menambah, mengedit, menghapus tamu, menyalin link personal, dan mengelola ucapan pada undangan ini.</p>
      <FormErrors errors={state.errors} />
      {state.ok && <p role="status" className="text-sm text-green-700">Akses petugas tersimpan. Petugas bisa masuk melalui halaman login dengan email tersebut.</p>}
      <button type="submit" disabled={pending} className="btn-primary">{pending ? "Menyimpan…" : "Tambahkan Akses"}</button>
    </form>
  );
}
