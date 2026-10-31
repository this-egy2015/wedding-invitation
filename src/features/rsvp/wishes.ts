"use server";

import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { guests, invitations, rsvps } from "@/db/schema";
import { isPublicInvitationSlug } from "@/lib/invitation-url";

const WISH_PAGE_SIZE = 5;

export type WishItem = {
  id: string;
  name: string;
  partnerName: string | null;
  wish: string | null;
};

export async function listWishesAction(slug: string, offset = 0): Promise<{ items: WishItem[]; hasMore: boolean }> {
  if (!isPublicInvitationSlug(slug) || !Number.isInteger(offset) || offset < 0) {
    return { items: [], hasMore: false };
  }

  const invitation = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(eq(invitations.slug, slug))
    .get();
  if (!invitation) return { items: [], hasMore: false };

  const rows = await db
    .select({ id: rsvps.id, name: guests.name, partnerName: guests.partnerName, wish: rsvps.wish })
    .from(rsvps)
    .innerJoin(guests, eq(guests.id, rsvps.guestId))
    .where(and(eq(guests.invitationId, invitation.id), eq(rsvps.isWishVisible, true), isNotNull(rsvps.wish)))
    .orderBy(desc(rsvps.respondedAt), desc(rsvps.id))
    .limit(WISH_PAGE_SIZE + 1)
    .offset(offset);

  return { items: rows.slice(0, WISH_PAGE_SIZE), hasMore: rows.length > WISH_PAGE_SIZE };
}
