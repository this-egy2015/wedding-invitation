"use client";

import { useState, type FormEvent } from "react";
import { submitRsvpAction, submitPublicRsvpAction, type RsvpFormState } from "@/features/rsvp/actions";
import type { TemplateGuest } from "../types";
import styles from "./classic.module.css";

export function RsvpForm({ slug, token, guest, onSaved }: {
  slug: string;
  token: string | null;
  guest: TemplateGuest | null;
  onSaved?: () => void;
}) {
  const [state, setState] = useState<RsvpFormState>({ ok: false, message: "" });
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState(guest?.rsvpStatus ?? "");
  const action = token ? submitRsvpAction : submitPublicRsvpAction;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    try {
      const result = await action(state, data);
      setState(result);
      if (result.ok) onSaved?.();
    } catch {
      setState({ ok: false, message: "Gagal menyimpan, coba lagi" });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.rsvpForm} onSubmit={handleSubmit}>
      {token ? <input type="hidden" name="token" value={token} /> : <input type="hidden" name="slug" value={slug} />}
      <div hidden aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label>Nama<input name="name" defaultValue={[guest?.name, guest?.partnerName].filter(Boolean).join(" & ")} readOnly={!!token} required maxLength={100} autoComplete="name" /></label>
      <label>Kehadiran
        <select name="status" required value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="" disabled>Hadir/Tidak Hadir</option>
          <option value="attending">Hadir</option>
          <option value="not_attending">Tidak Hadir</option>
        </select>
      </label>
      {status === "attending" ? (
        <label>Jumlah tamu
          <select name="attendanceCount" defaultValue={guest?.attendanceCount || 1}>
            {Array.from({ length: guest?.allowedGuestCount ?? 20 }, (_, i) => i + 1).map((count) => <option value={count} key={count}>{count} orang</option>)}
          </select>
        </label>
      ) : <input type="hidden" name="attendanceCount" value="0" />}
      <label>Ucapan &amp; doa<textarea name="wish" rows={4} maxLength={500} defaultValue={guest?.wish ?? ""} placeholder="Tulis ucapan dan doa..." /></label>
      {state.message && <p role="status" className={styles.formStatus} data-ok={state.ok}>{state.message}</p>}
      <button type="submit" disabled={pending || !status} className={styles.button}>{pending ? "Menyimpan..." : guest?.rsvpStatus || state.ok ? "Perbarui Konfirmasi" : "Konfirmasi"}</button>
    </form>
  );
}
