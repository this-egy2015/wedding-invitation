"use server";

import { randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { guests, rsvps } from "@/db/schema";
import { updateGuestDetails } from "@/db/writes";
import { formatIssues } from "@/features/invitations/content";
import { getOwnedInvitation } from "@/features/invitations/queries";
import { getGuest } from "./queries";

export type GuestFormState = { ok: boolean; errors: string[] };

const guestSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100),
  partnerName: z
    .string()
    .trim()
    .max(100)
    .transform((v) => v || null),
  allowedGuestCount: z.coerce.number().int().min(1, "Kuota minimal 1").max(20, "Kuota maksimal 20"),
});

// 128-bit random token, base64url => 22 chars. Must match the format check in getGuestByToken.
const newShareToken = () => randomBytes(16).toString("base64url");

export async function addGuestAction(
  invitationId: string,
  _prev: GuestFormState,
  formData: FormData,
): Promise<GuestFormState> {
  const invitation = await getOwnedInvitation(invitationId);
  const parsed = guestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: formatIssues(parsed.error) };

  await db.insert(guests).values({ ...parsed.data, invitationId: invitation.id, shareToken: newShareToken() });
  revalidatePath(`/dashboard/invitations/${invitation.id}/guests`);
  return { ok: true, errors: [] };
}

export async function updateGuestAction(
  invitationId: string,
  guestId: string,
  _prev: GuestFormState,
  formData: FormData,
): Promise<GuestFormState> {
  const invitation = await getOwnedInvitation(invitationId);
  const guest = await getGuest(invitation.id, guestId);
  const parsed = guestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: formatIssues(parsed.error) };

  const error = await updateGuestDetails(db, invitation.id, guest.id, parsed.data);
  if (error) return { ok: false, errors: [error] };

  revalidatePath(`/dashboard/invitations/${invitation.id}/guests`, "layout");
  return { ok: true, errors: [] };
}

export async function deleteGuestAction(invitationId: string, guestId: string) {
  const invitation = await getOwnedInvitation(invitationId);
  await db.delete(guests).where(and(eq(guests.id, guestId), eq(guests.invitationId, invitation.id)));
  redirect(`/dashboard/invitations/${invitation.id}/guests`);
}

export async function setWishVisibilityAction(invitationId: string, guestId: string, visible: boolean) {
  const invitation = await getOwnedInvitation(invitationId);
  const guest = await getGuest(invitation.id, guestId);
  await db.update(rsvps).set({ isWishVisible: visible }).where(eq(rsvps.guestId, guest.id));

  revalidatePath(`/dashboard/invitations/${invitation.id}/guests/${guest.id}`);
}
