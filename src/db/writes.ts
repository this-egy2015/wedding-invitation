import { and, eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.ts";

type Database = BetterSQLite3Database<typeof schema>;
const { guests, invitations, rsvps } = schema;

export function saveRsvp(db: Database, input: { token: string; status: "attending" | "not_attending"; attendanceCount: number; wish: string | null }) {
  // SQLite transactions must be synchronous; IMMEDIATE locks before checking the quota.
  return db.transaction((tx) => {
    const guest = tx.select({ id: guests.id, allowedGuestCount: guests.allowedGuestCount, slug: invitations.slug })
      .from(guests).innerJoin(invitations, eq(invitations.id, guests.invitationId))
      .where(and(eq(guests.shareToken, input.token), eq(invitations.status, "published"))).get();
    if (!guest) return { ok: false as const, message: "Link undangan tidak valid atau undangan tidak lagi aktif" };
    const attendanceCount = input.status === "attending" ? input.attendanceCount : 0;
    if (input.status === "attending" && (!Number.isInteger(attendanceCount) || attendanceCount < 1 || attendanceCount > guest.allowedGuestCount)) {
      return { ok: false as const, message: `Jumlah hadir harus antara 1 dan ${guest.allowedGuestCount} orang` };
    }
    // Keep moderation when a guest updates their response.
    tx.insert(rsvps).values({ guestId: guest.id, status: input.status, attendanceCount, wish: input.wish })
      .onConflictDoUpdate({ target: rsvps.guestId, set: { status: input.status, attendanceCount, wish: input.wish, respondedAt: new Date() } }).run();
    return { ok: true as const, slug: guest.slug };
  }, { behavior: "immediate" });
}

/** Caller must verify ownership with getOwnedInvitation before using this mutation. */
export function updateGuestDetails(db: Database, invitationId: string, guestId: string, input: { name: string; partnerName: string | null; allowedGuestCount: number }) {
  return db.transaction((tx) => {
    const where = and(eq(guests.id, guestId), eq(guests.invitationId, invitationId));
    if (!tx.select({ id: guests.id }).from(guests).where(where).get()) return "Tamu tidak ditemukan";
    const rsvp = tx.select({ attendanceCount: rsvps.attendanceCount }).from(rsvps).where(eq(rsvps.guestId, guestId)).get();
    if (rsvp && rsvp.attendanceCount > input.allowedGuestCount) {
      return `Tamu sudah konfirmasi ${rsvp.attendanceCount} orang; kuota tidak boleh lebih kecil`;
    }
    tx.update(guests).set(input).where(where).run();
    return null;
  }, { behavior: "immediate" });
}
