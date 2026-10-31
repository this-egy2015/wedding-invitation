import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { backupSqlite, openSqlite } from "../src/db/sqlite.ts";
import { connectDatabase } from "../src/db/client.ts";
import { findOrCreateSeedOwner } from "./seed-owner.ts";

const envFile = process.env.APP_ENV_FILE ?? ".env.local";
if (process.env.APP_ENV_FILE || existsSync(envFile)) process.loadEnvFile(envFile);
const { env } = await import("../src/env.ts");
const { seedContent, seedSlug, seedInvitation } = await import("./seed-data.ts");
const client = await connectDatabase({ ...env, VERCEL: process.env.VERCEL });
try {
  const existing = (await client.execute({ sql: "SELECT owner_id FROM invitations WHERE slug = ?", args: [seedSlug] })).rows[0];
  let ownerId = z.uuid().optional().parse(process.env.SEED_OWNER_ID || existing?.owner_id);
  let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!serviceKey && ["127.0.0.1", "localhost"].includes(new URL(env.SUPABASE_URL).hostname)) {
    const status = JSON.parse(execFileSync("./node_modules/.bin/supabase", ["status", "-o", "json"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
    assert.equal(new URL(status.API_URL).origin, new URL(env.SUPABASE_URL).origin, "Supabase lokal tidak cocok.");
    serviceKey = status.SERVICE_ROLE_KEY;
  }
  assert(serviceKey, "Isi SUPABASE_SERVICE_ROLE_KEY di environment privat untuk verifikasi owner Auth.");
  const supabase = createClient(env.SUPABASE_URL, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  if (!ownerId) {
    assert(process.env.SEED_OWNER_EMAIL, "DB baru memerlukan SEED_OWNER_ID atau SEED_OWNER_EMAIL.");
    ownerId = await findOrCreateSeedOwner(supabase.auth.admin, process.env.SEED_OWNER_EMAIL);
  }
  const { data: owner, error: ownerError } = await supabase.auth.admin.getUserById(ownerId);
  assert(!ownerError && owner.user, "SEED_OWNER_ID harus menunjuk akun Supabase Auth yang sudah ada.");
  assert(!existing || existing.owner_id === ownerId, "Undangan dimiliki akun lain.");

  const assetBase = `/berubah/${seedSlug}`;
  const { content, assets } = seedContent(assetBase);
  // Validate every source before writing assets or the database.
  const files = assets.map((path) => ({ path, bytes: readFileSync(new URL(`../prototype/assets/${path}`, import.meta.url)) }));
  if (!env.TURSO_DATABASE_URL) {
    const local = openSqlite(env.SQLITE_PATH);
    try { console.log("Backup sebelum seed:", await backupSqlite(local)); }
    finally { local.close(); }
  }
  const bucket = "wedding-assets";
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) throw bucketError;
  const currentBucket = buckets.find((item) => item.name === bucket);
  if (currentBucket) assert(currentBucket.public, "Bucket wedding-assets harus publik; izin tidak diubah otomatis.");
  else {
    const { error } = await supabase.storage.createBucket(bucket, { public: true, allowedMimeTypes: ["image/png", "image/jpeg"], fileSizeLimit: 10 * 1024 * 1024 });
    if (error) throw error;
  }
  // Existing objects may contain owner edits; only upload assets on initial creation.
  for (const { path, bytes } of existing ? [] : files) {
    const objectPath = `berubah/${seedSlug}/${path}`;
    const { error } = await supabase.storage.from(bucket).upload(objectPath, bytes, {
      upsert: true, contentType: path.endsWith(".jpg") ? "image/jpeg" : "image/png",
    });
    if (error) throw error;
    const response = await fetch(`${env.SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${objectPath}`, { method: "HEAD", signal: AbortSignal.timeout(15000) });
    assert(response.ok, `Gambar belum tersedia: ${path}`);
  }
  await seedInvitation(client, ownerId, content);
  assert.equal((await client.execute("PRAGMA integrity_check")).rows[0][0], "ok");
  assert.equal((await client.execute("PRAGMA foreign_key_check")).rows.length, 0);
  console.log(`Seed selesai: ${env.SITE_URL.replace(/\/$/, "")}/${seedSlug}; ${assets.length} gambar, 30 galeri, tanpa data tamu/ucapan contoh (konten dan respons lama dipertahankan).`);
  console.log("Terbitkan ulang melalui dashboard pemilik untuk menyegarkan halaman yang sudah di-cache. Link personal tersedia di dashboard pemilik.");
} finally { client.close(); }
