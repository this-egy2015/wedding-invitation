"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { saveRsvp } from "@/db/writes";
import { invitationPath } from "@/lib/invitation-url";

export type RsvpFormState = { ok: boolean; message: string };

const rsvpSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{22}$/),
  status: z.enum(["attending", "not_attending"], { error: "Pilih status kehadiran" }),
  attendanceCount: z.coerce.number().int().min(0).max(20),
  wish: z
    .string()
    .trim()
    .max(500, "Ucapan maksimal 500 karakter")
    .transform((v) => v || null),
});

// No app-level rate limit: each token can only upsert its own single row, and tokens are
// 128-bit random. Volumetric abuse must be handled at the edge for public invitation POSTs.
export async function submitRsvpAction(_prev: RsvpFormState, formData: FormData): Promise<RsvpFormState> {
  const parsed = rsvpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Data RSVP tidak valid" };

  const result = await saveRsvp(db, parsed.data);
  if (!result.ok) return result;
  revalidatePath(invitationPath(result.slug));
  return { ok: true, message: "Terima kasih, konfirmasi kamu sudah tersimpan" };
}
