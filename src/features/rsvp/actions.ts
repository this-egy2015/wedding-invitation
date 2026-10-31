"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/db";
import { saveRsvp, savePublicRsvp } from "@/db/writes";
import { invitationPath, isPublicInvitationSlug } from "@/lib/invitation-url";
import { env } from "@/env";

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

// shortcut: open guestbook submissions require edge rate limits if abuse appears.
export async function submitRsvpAction(_prev: RsvpFormState, formData: FormData): Promise<RsvpFormState> {
  const parsed = rsvpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Data RSVP tidak valid" };

  const result = await saveRsvp(db, parsed.data);
  if (!result.ok) return result;
  revalidatePath(invitationPath(result.slug));
  return { ok: true, message: "Terima kasih, konfirmasi kamu sudah tersimpan" };
}

export async function submitPublicRsvpAction(_prev: RsvpFormState, formData: FormData): Promise<RsvpFormState> {
  const parsed = rsvpSchema.omit({ token: true }).extend({
    slug: z.string().refine(isPublicInvitationSlug),
    name: z.string().trim().min(1, "Isi nama kamu").max(100, "Nama maksimal 100 karakter"),
    website: z.literal("").optional(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Data RSVP tidak valid" };
  const jar = await cookies();
  const cookieName = `rsvp-${parsed.data.slug}`;
  const result = await savePublicRsvp(db, parsed.data, jar.get(cookieName)?.value);
  if (!result.ok) return result;
  jar.set(cookieName, result.token, { httpOnly: true, secure: new URL(env.SITE_URL).protocol === "https:", sameSite: "lax", path: invitationPath(result.slug), maxAge: 60 * 60 * 24 * 365 });
  revalidatePath(invitationPath(result.slug));
  return { ok: true, message: "Terima kasih, konfirmasi kamu sudah tersimpan" };
}
