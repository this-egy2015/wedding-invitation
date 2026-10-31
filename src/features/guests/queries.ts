import { and, asc, count, eq, like, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { guests, rsvps } from "@/db/schema";
import { env } from "@/env";
import { invitationPath } from "@/lib/invitation-url";

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

/** Caller must have verified ownership of invitationId (getOwnedInvitation). */
export async function listGuests(invitationId: string, search: string, page: number) {
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

/** Caller must have verified ownership of invitationId (getOwnedInvitation). */
export async function getGuest(invitationId: string, guestId: string) {
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

