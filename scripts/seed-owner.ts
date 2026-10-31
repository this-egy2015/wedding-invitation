import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

/** Admin creation does not send email or mark the address as verified. */
export async function findOrCreateSeedOwner(admin: SupabaseClient["auth"]["admin"], email: string) {
  const address = z.email().parse(email.trim()).toLowerCase();
  for (let page = 1; ; page++) {
    const { data, error } = await admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const existing = data.users.find((user) => user.email?.toLowerCase() === address);
    if (existing) return existing.id;
    if (data.users.length < 100) break;
  }
  const { data, error } = await admin.createUser({ email: address, email_confirm: false });
  if (error) throw error;
  if (!data.user) throw new Error("Akun owner gagal dibuat.");
  return data.user.id;
}
