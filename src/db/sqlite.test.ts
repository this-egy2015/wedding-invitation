import assert from "node:assert/strict";
import { chmodSync, mkdtempSync, rmSync, statSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes, randomUUID } from "node:crypto";
import { test, type TestContext } from "node:test";
import { pathToFileURL } from "node:url";
import { createClient } from "@libsql/client";
import { drizzle as libsqlDrizzle } from "drizzle-orm/libsql";
import { Worker } from "node:worker_threads";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema.ts";
import { backupSqlite, openSqlite } from "./sqlite.ts";
import { saveRsvp, savePublicRsvp, updateGuestDetails } from "./writes.ts";

function fixture(t: TestContext) {
  const directory = mkdtempSync(join(tmpdir(), "wedding-sqlite-"));
  const path = join(directory, "test.sqlite");
  const client = openSqlite(path);
  const db = drizzle(client, { schema });
  migrate(db, { migrationsFolder: "./drizzle/sqlite" });
  const remoteClient = createClient({ url: pathToFileURL(path).href, timeout: 5000 });
  const asyncDb = libsqlDrizzle(remoteClient, { schema });
  t.after(() => { remoteClient.close(); if (client.open) client.close(); rmSync(directory, { recursive: true, force: true }); });
  const invitation = db.insert(schema.invitations).values({ ownerId: randomUUID(), slug: "test-wedding", templateId: "classic", templateVersion: 1, status: "published" }).returning().get();
  const guest = db.insert(schema.guests).values({ invitationId: invitation.id, name: "Tamu", allowedGuestCount: 3, shareToken: randomBytes(16).toString("base64url") }).returning().get();
  const input = { token: guest.shareToken, status: "attending" as const, attendanceCount: 2, wish: "Selamat" };
  return { directory, path, client, db, asyncDb, invitation, guest, input };
}

test("public RSVP creates a random token, updates only that visitor, and keeps moderation", async (t) => {
  const { db, asyncDb, invitation } = fixture(t);
  const input = { slug: invitation.slug, name: "Tamu Publik", status: "attending" as const, attendanceCount: 2, wish: "Selamat!" };
  const first = await savePublicRsvp(asyncDb, input, "invalid-cookie");
  assert(first.ok);
  assert.match(first.token, /^[A-Za-z0-9_-]{22}$/);
  const guest = db.select().from(schema.guests).where(eq(schema.guests.shareToken, first.token)).get()!;
  db.update(schema.rsvps).set({ isWishVisible: false }).where(eq(schema.rsvps.guestId, guest.id)).run();
  const updated = await savePublicRsvp(asyncDb, { ...input, name: "Nama Diperbaiki", status: "not_attending", wish: "Doa terbaik" }, first.token);
  assert(updated.ok);
  assert.equal(updated.token, first.token);
  const response = db.select().from(schema.rsvps).where(eq(schema.rsvps.guestId, guest.id)).get()!;
  assert.equal(response.attendanceCount, 0);
  assert.equal(response.isWishVisible, false);
  assert.equal(response.wish, "Doa terbaik");
  assert.equal(db.select().from(schema.guests).where(eq(schema.guests.id, guest.id)).get()!.name, "Nama Diperbaiki");
  const sameName = await savePublicRsvp(asyncDb, input);
  assert(sameName.ok);
  assert.notEqual(sameName.token, first.token);
  assert.equal(db.select().from(schema.rsvps).all().length, 2);
});

test("public RSVP rejects unpublished/missing invitations and quota abuse without creating guests", async (t) => {
  const { db, asyncDb, invitation, guest } = fixture(t);
  const input = { slug: invitation.slug, name: "Tamu", status: "attending" as const, attendanceCount: 21, wish: null };
  assert.equal((await savePublicRsvp(asyncDb, input)).ok, false);
  assert.equal((await savePublicRsvp(asyncDb, { ...input, attendanceCount: 4 }, guest.shareToken)).ok, false);
  assert.equal((await savePublicRsvp(asyncDb, { ...input, slug: "missing", attendanceCount: 1 })).ok, false);
  db.update(schema.invitations).set({ status: "unpublished" }).where(eq(schema.invitations.id, invitation.id)).run();
  assert.equal((await savePublicRsvp(asyncDb, { ...input, attendanceCount: 1 })).ok, false);
  assert.equal(db.select().from(schema.guests).all().length, 1);
  assert.equal(db.select().from(schema.rsvps).all().length, 0);
});

test("a browser token from another invitation never edits its guest", async (t) => {
  const { db, asyncDb, invitation, guest } = fixture(t);
  db.insert(schema.invitations).values({ ownerId: randomUUID(), slug: "other-wedding", templateId: "classic", templateVersion: 1, status: "published" }).run();
  const result = await savePublicRsvp(asyncDb, { slug: "other-wedding", name: "Other", status: "attending", attendanceCount: 1, wish: null }, guest.shareToken);
  assert(result.ok);
  assert.notEqual(result.token, guest.shareToken);
  assert.equal(db.select().from(schema.guests).where(eq(schema.guests.id, guest.id)).get()!.name, guest.name);
  assert.equal(db.select().from(schema.guests).where(eq(schema.guests.invitationId, invitation.id)).all().length, 1);
});

test("SQLite files are private and public/symlink paths are refused", (t) => {
  const { path, directory, client } = fixture(t);
  assert.equal(statSync(path).mode & 0o777, 0o600);
  assert.equal(statSync(directory).mode & 0o777, 0o700);
  assert.equal(client.pragma("foreign_keys", { simple: true }), 1);
  assert.equal(client.pragma("journal_mode", { simple: true }), "wal");
  assert.equal(client.pragma("synchronous", { simple: true }), 2);
  assert.equal(client.pragma("trusted_schema", { simple: true }), 0);
  for (const path of ["public/data.sqlite", "public/..hidden/data.sqlite", "out/data.sqlite", ".next/data.sqlite"]) assert.throws(() => openSqlite(path), /privat/);
  const alias = join(directory, "alias.sqlite");
  symlinkSync(path, alias);
  assert.throws(() => openSqlite(alias), /ELOOP/);
  chmodSync(directory, 0o755);
  assert.throws(() => openSqlite(path), /chmod 700/);
  chmodSync(directory, 0o700);
});

test("generated schema enforces foreign keys, uniqueness, statuses, tokens and RSVP constraints", (t) => {
  const { db, client, invitation, guest } = fixture(t);
  assert.throws(() => db.insert(schema.guests).values({ invitationId: randomUUID(), name: "Orphan", shareToken: randomBytes(16).toString("base64url") }).run());
  assert.throws(() => db.insert(schema.guests).values({ invitationId: invitation.id, name: "Duplicate", shareToken: guest.shareToken }).run());
  assert.throws(() => db.insert(schema.guests).values({ invitationId: invitation.id, name: "Invalid", shareToken: "short" }).run());
  assert.throws(() => client.prepare("update invitations set status = ? where id = ?").run("unknown", invitation.id));
  assert.throws(() => client.prepare("update invitations set slug = ? where id = ?").run("bad--slug", invitation.id));
  assert.throws(() => client.prepare("update invitations set draft_content = ? where id = ?").run("not json", invitation.id));
  assert.throws(() => db.insert(schema.rsvps).values({ guestId: guest.id, status: "not_attending", attendanceCount: 1 }).run());
  assert.throws(() => db.insert(schema.rsvps).values({ guestId: guest.id, status: "attending", attendanceCount: 1, wish: "x".repeat(501) }).run());
});

test("RSVP rejects invalid tokens/quota/unpublished invitations and preserves moderation on upsert", async (t) => {
  const { db, asyncDb, invitation, guest, input } = fixture(t);
  assert.equal((await saveRsvp(asyncDb, { ...input, token: "' OR 1=1 --" })).ok, false);
  assert.equal((await saveRsvp(asyncDb, { ...input, attendanceCount: 4 })).ok, false);
  assert.equal(db.select().from(schema.rsvps).all().length, 0);
  assert.equal((await saveRsvp(asyncDb, input)).ok, true);
  db.update(schema.rsvps).set({ isWishVisible: false }).where(eq(schema.rsvps.guestId, guest.id)).run();
  assert.equal((await saveRsvp(asyncDb, { ...input, status: "not_attending", attendanceCount: 3 })).ok, true);
  const rows = db.select().from(schema.rsvps).all();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].attendanceCount, 0);
  assert.equal(rows[0].isWishVisible, false);
  assert(rows[0].respondedAt instanceof Date);
  db.update(schema.invitations).set({ status: "unpublished" }).where(eq(schema.invitations.id, invitation.id)).run();
  assert.equal((await saveRsvp(asyncDb, input)).ok, false);
  db.delete(schema.invitations).where(eq(schema.invitations.id, invitation.id)).run();
  assert.equal(db.select().from(schema.guests).all().length, 0);
  assert.equal(db.select().from(schema.rsvps).all().length, 0);
});

test("guest updates stay scoped to their invitation and cannot reduce an already used quota", async (t) => {
  const { db, asyncDb, invitation, guest, input } = fixture(t);
  const changes = { name: "Updated", partnerName: null, allowedGuestCount: 1 };
  assert.equal(await updateGuestDetails(asyncDb, randomUUID(), guest.id, changes), "Tamu tidak ditemukan");
  await saveRsvp(asyncDb, input);
  assert.match((await updateGuestDetails(asyncDb, invitation.id, guest.id, changes))!, /kuota tidak boleh lebih kecil/);
  const saved = db.select().from(schema.guests).where(eq(schema.guests.id, guest.id)).get()!;
  assert.equal(saved.name, "Tamu");
  assert.equal(saved.allowedGuestCount, 3);
});

test("online backup includes committed WAL data and stays private", async (t) => {
  const { client, asyncDb, input, guest } = fixture(t);
  await saveRsvp(asyncDb, input);
  const backup = await backupSqlite(client);
  assert.equal(statSync(backup).mode & 0o777, 0o600);
  const restored = new Database(backup, { readonly: true });
  try {
    assert.equal(restored.pragma("integrity_check", { simple: true }), "ok");
    assert.equal((restored.prepare("select attendance_count from rsvps where guest_id = ?").get(guest.id) as { attendance_count: number }).attendance_count, 2);
  } finally { restored.close(); }
});

test("concurrent RSVP and quota reduction serialize across independent SQLite connections", async (t) => {
  const { path, db, invitation, guest, input } = fixture(t);
  const workers = ["rsvp", "quota"].map((operation) => {
    const worker = new Worker(new URL("./test-fixtures/quota-worker.ts", import.meta.url), { workerData: { path, operation, invitationId: invitation.id, guestId: guest.id, input: { ...input, attendanceCount: 3 } } });
    t.after(() => worker.terminate());
    const ready = new Promise<void>((resolve, reject) => { worker.once("message", () => resolve()); worker.once("error", reject); });
    const result = ready.then(() => new Promise<unknown>((resolve, reject) => { worker.once("message", resolve); worker.once("error", reject); }));
    return { worker, ready, result };
  });
  await Promise.all(workers.map((entry) => entry.ready));
  for (const { worker } of workers) worker.postMessage("go");
  await Promise.all(workers.map((entry) => entry.result));
  const quota = db.select().from(schema.guests).where(eq(schema.guests.id, guest.id)).get()!.allowedGuestCount;
  const rsvp = db.select().from(schema.rsvps).where(eq(schema.rsvps.guestId, guest.id)).get();
  assert((rsvp?.attendanceCount ?? 0) <= quota);
  assert(quota === 2 || rsvp?.attendanceCount === 3);
});
