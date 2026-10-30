"use server";

import { z } from "zod";
import { env } from "@/env";
import { createSupabaseServerClient } from "@/lib/supabase";

export type LoginState = { ok: boolean; message: string };

export async function sendMagicLinkAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = z.email().safeParse(String(formData.get("email") ?? "").trim());
  if (!email.success) return { ok: false, message: "Email tidak valid" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    // SITE_URL, not the request Host header, so the redirect cannot be spoofed.
    options: { emailRedirectTo: `${env.SITE_URL}/auth/callback` },
  });
  if (error) return { ok: false, message: "Gagal mengirim link login, coba lagi beberapa saat" };

  return { ok: true, message: "Link login sudah dikirim. Cek email kamu." };
}
