"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { guests, invitations, rsvps } from "@/db/schema";

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
// 128-bit random. Volumetric abuse is handled at the edge (Vercel WAF rule on /invite/*).
export async function submitRsvpAction(_prev: RsvpFormState, formData: FormData): Promise<RsvpFormState> {
  const parsed = rsvpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Data RSVP tidak valid" };

  const { token, status, wish } = parsed.data;
  const attendanceCount = status === "attending" ? parsed.data.attendanceCount : 0;

  const result = await db.transaction(async (tx) => {
    const [guest] = await tx
      .select({ id: guests.id, allowedGuestCount: guests.allowedGuestCount, slug: invitations.slug })
      .from(guests)
      .innerJoin(invitations, eq(invitations.id, guests.invitationId))
      .where(and(eq(guests.shareToken, token), eq(invitations.status, "published")))
      .for("update", { of: guests });
    if (!guest) return { error: "Link undangan tidak valid atau undangan tidak lagi aktif" };

    if (status === "attending" && (attendanceCount < 1 || attendanceCount > guest.allowedGuestCount)) {
      return { error: `Jumlah hadir harus antara 1 dan ${guest.allowedGuestCount} orang` };
    }

    // One row per guest; resubmitting updates it. is_wish_visible is intentionally kept so an
    // owner's moderation is not undone by the guest editing their wish.
    await tx
      .insert(rsvps)
      .values({ guestId: guest.id, status, attendanceCount, wish })
      .onConflictDoUpdate({
        target: rsvps.guestId,
        set: { status, attendanceCount, wish, respondedAt: new Date() },
      });
    return { slug: guest.slug };
  });

  if ("error" in result && typeof result.error === "string") return { ok: false, message: result.error };

  revalidatePath(`/invite/${result.slug}`);
  return { ok: true, message: "Terima kasih, konfirmasi kamu sudah tersimpan" };
}
