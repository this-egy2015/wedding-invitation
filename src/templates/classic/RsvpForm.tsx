"use client";

import { useActionState, useState, useTransition } from "react";
import { submitRsvpAction } from "@/features/rsvp/actions";
import type { TemplateGuest } from "../types";

export function RsvpForm({ token, guest }: { token: string; guest: TemplateGuest }) {
  const [state, formAction] = useActionState(submitRsvpAction, { ok: false, message: "" });
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(guest.rsvpStatus ?? "");

  return (
    <form
      // Submit via transition so React does not clear the guest's input when the action fails.
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className="space-y-4 text-left"
    >
      <input type="hidden" name="token" value={token} />

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Konfirmasi kehadiran</legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["attending", "Hadir"],
              ["not_attending", "Tidak Hadir"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={`cursor-pointer rounded-md border px-3 py-2 text-center text-sm ${status === value ? "border-gold bg-sand" : "border-neutral-300 bg-white"}`}
            >
              <input
                type="radio"
                name="status"
                value={value}
                checked={status === value}
                onChange={() => setStatus(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {status === "attending" ? (
        <div>
          <label htmlFor="attendanceCount" className="mb-1 block text-sm font-medium">
            Jumlah yang hadir
          </label>
          <select
            id="attendanceCount"
            name="attendanceCount"
            defaultValue={guest.attendanceCount || 1}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
          >
            {Array.from({ length: guest.allowedGuestCount }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} orang
              </option>
            ))}
          </select>
        </div>
      ) : (
        <input type="hidden" name="attendanceCount" value="0" />
      )}

      <div>
        <label htmlFor="wish" className="mb-1 block text-sm font-medium">
          Ucapan & doa
        </label>
        <textarea
          id="wish"
          name="wish"
          rows={4}
          maxLength={500}
          defaultValue={guest.wish ?? ""}
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      {state.message && (
        <p role="status" className={`text-sm ${state.ok ? "text-green-700" : "text-red-700"}`}>
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !status}
        className="w-full rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory disabled:opacity-50"
      >
        {pending ? "Mengirim..." : guest.rsvpStatus ? "Perbarui Konfirmasi" : "Kirim Konfirmasi"}
      </button>
    </form>
  );
}
