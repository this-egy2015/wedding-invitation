import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { openSqlite } from "./sqlite.ts";

Object.assign(process.env, {
  SUPABASE_URL: "https://auth.example.com", SUPABASE_ANON_KEY: "test-only",
  SITE_URL: "http://localhost:3000", R2_PUBLIC_URL: "https://assets.example.com/photos",
});
const { demoContent, seedDemo } = await import("../../scripts/seed-data.ts");
const { contentSchema } = await import("../features/invitations/content.ts");

test("all seed images exist; asset validation rejects lookalike origins and path prefixes", () => {
  const { content, assets } = demoContent("https://assets.example.com/photos/demo-gaby-afdhal");
  assert.equal(assets.length, 37);
  assert.equal(new Set(assets).size, 37);
  for (const path of assets) assert(existsSync(new URL(`../../prototype/assets/${path}`, import.meta.url)), path);
  assert.equal(content.galleryUrls.length, 30);
  assert(!contentSchema.safeParse({ ...content, galleryUrls: [...content.galleryUrls, content.galleryUrls[0]] }).success);
  for (const coverImageUrl of [
    "https://assets.example.com.evil.test/photos/x.jpg", "https://assets.example.com/photos-other/x.jpg",
    "https://assets.example.com/photos/../private.jpg", "https://user:password@assets.example.com/photos/x.jpg",
  ]) assert(!contentSchema.safeParse({ ...content, coverImageUrl }).success);
  const old = structuredClone(content);
  Reflect.deleteProperty(old.quote, "imageUrl");
  Reflect.deleteProperty(old.bride, "birthOrder");
  Reflect.deleteProperty(old.groom, "birthOrder");
  Reflect.deleteProperty(old.akad, "mapImageUrl");
  Reflect.deleteProperty(old.resepsi, "mapImageUrl");
  assert.equal(contentSchema.parse(old).quote.imageUrl, "");
  assert.equal(contentSchema.parse(old).bride.birthOrder, "");
});

test("seed reruns preserve guest tokens, responses, moderation and unrelated invitations", (t) => {
  const directory = mkdtempSync(join(tmpdir(), "wedding-seed-"));
  const client = openSqlite(join(directory, "test.sqlite"));
  t.after(() => { client.close(); rmSync(directory, { recursive: true, force: true }); });
  migrate(drizzle(client), { migrationsFolder: "./drizzle/sqlite" });
  const ownerId = randomUUID();
  const { content } = demoContent("https://assets.example.com/photos/demo-gaby-afdhal");
  const id = seedDemo(client, ownerId, content);
  assert.equal((client.prepare("SELECT * FROM guests").all()).length, 4);
  assert.equal((client.prepare("SELECT * FROM rsvps").all()).length, 3);
  client.prepare("UPDATE rsvps SET wish = 'Ucapan diedit', is_wish_visible = 0").run();
  const guests = client.prepare("SELECT * FROM guests ORDER BY id").all();
  const responses = client.prepare("SELECT * FROM rsvps ORDER BY id").all();
  client.prepare(`INSERT INTO invitations (id, owner_id, template_id, template_version, slug, created_at, updated_at)
    VALUES (?, ?, 'classic', 1, 'other-wedding', 1, 1)`).run(randomUUID(), randomUUID());
  const other = client.prepare("SELECT * FROM invitations WHERE slug = 'other-wedding'").get();
  assert.equal(seedDemo(client, ownerId, { ...content, coverTitle: "Judul baru" }), id);
  assert.deepEqual(client.prepare("SELECT * FROM guests ORDER BY id").all(), guests);
  assert.deepEqual(client.prepare("SELECT * FROM rsvps ORDER BY id").all(), responses);
  assert.deepEqual(client.prepare("SELECT * FROM invitations WHERE slug = 'other-wedding'").get(), other);
  assert.throws(() => seedDemo(client, randomUUID(), content), /akun lain/);
  const stored = client.prepare("SELECT published_content FROM invitations WHERE id = ?").get(id) as { published_content: string };
  assert.equal(JSON.parse(stored.published_content).coverTitle, "Judul baru");
  assert.deepEqual(client.pragma("foreign_key_check"), []);
});
