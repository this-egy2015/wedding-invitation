"use client";

import { useActionState, useState, useTransition } from "react";
import { submitRsvpAction } from "@/features/rsvp/actions";
import type { TemplateGuest } from "../types";
import styles from "./classic.module.css";

export function RsvpForm({ token, guest }: { token: string; guest: TemplateGuest }) {
  const [state, formAction] = useActionState(submitRsvpAction, { ok: false, message: "" });
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(guest.rsvpStatus ?? "");
  return (
    <form className={styles.rsvpForm} onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      startTransition(() => formAction(data));
    }}>
      <input type="hidden" name="token" value={token} />
      <label>Nama<input value={[guest.name, guest.partnerName].filter(Boolean).join(" & ")} readOnly /></label>
      <label>Kehadiran
        <select name="status" required value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="" disabled>Hadir/Tidak Hadir</option>
          <option value="attending">Hadir</option>
          <option value="not_attending">Tidak Hadir</option>
        </select>
      </label>
      {status === "attending" ? (
        <label>Jumlah tamu
          <select name="attendanceCount" defaultValue={guest.attendanceCount || 1}>
            {Array.from({ length: guest.allowedGuestCount }, (_, i) => i + 1).map((count) => <option value={count} key={count}>{count} orang</option>)}
          </select>
        </label>
      ) : <input type="hidden" name="attendanceCount" value="0" />}
      <label>Ucapan &amp; doa<textarea name="wish" rows={4} maxLength={500} defaultValue={guest.wish ?? ""} placeholder="Tulis ucapan dan doa..." /></label>
      {state.message && <p role="status" className={styles.formStatus} data-ok={state.ok}>{state.message}</p>}
      <button type="submit" disabled={pending || !status} className={styles.button}>{pending ? "Menyimpan..." : guest.rsvpStatus ? "Perbarui Konfirmasi" : "Konfirmasi"}</button>
    </form>
  );
}
