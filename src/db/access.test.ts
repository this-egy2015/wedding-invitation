import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { connectDatabase } from "./client.ts";
import * as schema from "./schema.ts";
import { hasDashboardAccess, listGuestInvitations } from "./access.ts";
import { isAdminEmail } from "../lib/access-policy.ts";

test("staff grants are normalized, scoped per invitation, revocable, and cannot confer admin rights", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "staff-access-"));
  const client = await connectDatabase({ SQLITE_PATH: join(directory, "test.sqlite") });
  t.after(() => { client.close(); rmSync(directory, { recursive: true, force: true }); });
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "./drizzle/sqlite" });
  const admin = { id: randomUUID(), email: "admin@example.test" };
  const staff = { id: randomUUID(), email: "helper@example.test" };
  const adminEmail = admin.email;
  const [first] = await db.insert(schema.invitations).values({ ownerId: admin.id, slug: "first-wedding", templateId: "classic", templateVersion: 1 }).returning();
  const [second] = await db.insert(schema.invitations).values({ ownerId: admin.id, slug: "second-wedding", templateId: "classic", templateVersion: 1 }).returning();
  await db.insert(schema.invitations).values({ ownerId: staff.id, slug: "old-other-owner", templateId: "classic", templateVersion: 1 });

  assert(isAdminEmail(" ADMIN@example.test ", adminEmail));
  assert(!isAdminEmail(staff.email, adminEmail));
  assert(!isAdminEmail(admin.email, ""));
  assert(await hasDashboardAccess(db, admin.email, adminEmail));
  assert(!await hasDashboardAccess(db, staff.email, adminEmail));
  assert.deepEqual(await listGuestInvitations(db, staff, adminEmail), [], "old ownership alone cannot bypass allowlist");
  assert.equal((await listGuestInvitations(db, admin, adminEmail)).length, 2);

  await db.insert(schema.invitationStaff).values({ invitationId: first.id, email: staff.email });
  await db.insert(schema.invitationStaff).values({ invitationId: first.id, email: staff.email }).onConflictDoNothing();
  assert(await hasDashboardAccess(db, " Helper@Example.test ", adminEmail));
  assert.deepEqual((await listGuestInvitations(db, staff, adminEmail)).map(i => i.id), [first.id]);
  assert(!await hasDashboardAccess(db, "outsider@example.test", adminEmail));
  await assert.rejects(() => db.insert(schema.invitationStaff).values({ invitationId: second.id, email: "UPPER@example.test" }));
  await assert.rejects(() => db.insert(schema.invitationStaff).values({ invitationId: randomUUID(), email: staff.email }));

  await db.insert(schema.invitationStaff).values({ invitationId: second.id, email: staff.email });
  await db.delete(schema.invitationStaff).where(eq(schema.invitationStaff.invitationId, first.id));
  assert.deepEqual((await listGuestInvitations(db, staff, adminEmail)).map(i => i.id), [second.id]);
  await db.delete(schema.invitations).where(eq(schema.invitations.id, second.id));
  assert(!await hasDashboardAccess(db, staff.email, adminEmail), "cascade/revocation removes access immediately");
  assert.deepEqual(await listGuestInvitations(db, staff, adminEmail), []);
});
