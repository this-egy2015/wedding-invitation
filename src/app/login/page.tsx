"use client";

import { useActionState } from "react";
import { sendMagicLinkAction } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(sendMagicLinkAction, { ok: false, message: "" });

  return (
    <main className="flex min-h-dvh items-center justify-center bg-neutral-50 px-4">
      <form action={action} className="w-full max-w-sm space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Masuk</h1>
        <p className="text-sm text-neutral-600">Kami kirim link login ke email kamu.</p>
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Mengirim..." : "Kirim link login"}
        </button>
        {state.message && (
          <p role="status" className={`text-sm ${state.ok ? "text-green-700" : "text-red-700"}`}>
            {state.message}
          </p>
        )}
      </form>
    </main>
  );
}
