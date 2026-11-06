import { and, asc, count, eq, like, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { cache } from "react";
import { db } from "@/db";
import { listGuestInvitations } from "@/db/access";
import { guests, rsvps } from "@/db/schema";
import { env } from "@/env";
import { invitationPath } from "@/lib/invitation-url";
import { requireUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/access-policy";

export const getGuestManagementInvitation = cache(async (invitationId: string) => {
  const user = await requireUser();
  if (!z.uuid().safeParse(invitationId).success) notFound();
  const invitation = (await listGuestInvitations(db, user)).find((item) => item.id === invitationId);
  if (!invitation) notFound();
  return { ...invitation, canEditInvitation: isAdminEmail(user.email) };
});

export const GUEST_PAGE_SIZE = 20;

export const guestLink = (slug: string, shareToken: string) =>
  `${env.SITE_URL}${invitationPath(slug, shareToken)}`;

const guestWithRsvp = {
  id: guests.id,
  name: guests.name,
  partnerName: guests.partnerName,
  allowedGuestCount: guests.allowedGuestCount,
  shareToken: guests.shareToken,
  createdAt: guests.createdAt,
  rsvpStatus: rsvps.status,
  attendanceCount: rsvps.attendanceCount,
  wish: rsvps.wish,
  isWishVisible: rsvps.isWishVisible,
  respondedAt: rsvps.respondedAt,
};

export async function listGuests(invitationId: string, search: string, page: number) {
  await getGuestManagementInvitation(invitationId);
  const where = and(
    eq(guests.invitationId, invitationId),
    search ? or(like(guests.name, `%${search}%`), like(guests.partnerName, `%${search}%`)) : undefined,
  );

  const [rows, [{ total }]] = await Promise.all([
    db
      .select(guestWithRsvp)
      .from(guests)
      .leftJoin(rsvps, eq(rsvps.guestId, guests.id))
      .where(where)
      .orderBy(asc(guests.name))
      .limit(GUEST_PAGE_SIZE)
      .offset((page - 1) * GUEST_PAGE_SIZE),
    db.select({ total: count() }).from(guests).where(where),
  ]);

  return { rows, total };
}

export async function getGuest(invitationId: string, guestId: string) {
  await getGuestManagementInvitation(invitationId);
  if (!z.uuid().safeParse(guestId).success) notFound();

  const [guest] = await db
    .select(guestWithRsvp)
    .from(guests)
    .leftJoin(rsvps, eq(rsvps.guestId, guests.id))
    .where(and(eq(guests.id, guestId), eq(guests.invitationId, invitationId)));
  if (!guest) notFound();
  return guest;
}

/** Return only template fields; browser-cookie tokens must never enter client props. */
export async function getGuestByToken(invitationId: string, token: string) {
  if (!/^[A-Za-z0-9_-]{22}$/.test(token)) return null;

  const [guest] = await db
    .select({ name: guests.name, partnerName: guests.partnerName, allowedGuestCount: guests.allowedGuestCount,
      rsvpStatus: rsvps.status, attendanceCount: rsvps.attendanceCount, wish: rsvps.wish })
    .from(guests)
    .leftJoin(rsvps, eq(rsvps.guestId, guests.id))
    .where(and(eq(guests.shareToken, token), eq(guests.invitationId, invitationId)));
  return guest ?? null;
}

