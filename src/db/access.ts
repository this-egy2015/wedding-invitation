import { and, asc, eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema.ts";
import { isAdminEmail, normalizeEmail } from "../lib/access-policy.ts";

type Database = LibSQLDatabase<typeof schema>;
const { invitations, invitationStaff } = schema;

export async function hasDashboardAccess(db: Database, email: string, adminEmail = process.env.ADMIN_EMAIL) {
  if (isAdminEmail(email, adminEmail)) return true;
  const grant = await db.select({ email: invitationStaff.email }).from(invitationStaff)
    .where(eq(invitationStaff.email, normalizeEmail(email))).limit(1).get();
  return !!grant;
}

export function listGuestInvitations(db: Database, user: { id: string; email: string }, adminEmail = process.env.ADMIN_EMAIL) {
  return db.select({ id: invitations.id, slug: invitations.slug, status: invitations.status }).from(invitations)
    .leftJoin(invitationStaff, and(eq(invitationStaff.invitationId, invitations.id), eq(invitationStaff.email, normalizeEmail(user.email))))
    .where(isAdminEmail(user.email, adminEmail) ? eq(invitations.ownerId, user.id) : eq(invitationStaff.email, normalizeEmail(user.email)))
    .orderBy(asc(invitations.slug));
}
