import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { backupSqlite, openSqlite } from "../src/db/sqlite.ts";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const { env } = await import("../src/env.ts");
const { demoContent, demoSlug, seedDemo } = await import("./seed-data.ts");
const client = openSqlite(env.SQLITE_PATH);
try {
  const existing = client.prepare("SELECT owner_id FROM invitations WHERE slug = ?").get(demoSlug) as { owner_id: string } | undefined;
  const ownerId = z.uuid().parse(process.env.SEED_OWNER_ID || existing?.owner_id);
  let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey && ["127.0.0.1", "localhost"].includes(new URL(env.SUPABASE_URL).hostname)) {
    const status = JSON.parse(execFileSync("./node_modules/.bin/supabase", ["status", "-o", "json"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
    assert.equal(new URL(status.API_URL).origin, new URL(env.SUPABASE_URL).origin, "Supabase lokal tidak cocok.");
    serviceKey = status.SERVICE_ROLE_KEY;
  }
  assert(serviceKey, "Isi SUPABASE_SERVICE_ROLE_KEY di environment lokal untuk seed Auth/storage.");
  const supabase = createClient(env.SUPABASE_URL, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: owner, error: ownerError } = await supabase.auth.admin.getUserById(ownerId);
  assert(!ownerError && owner.user, "SEED_OWNER_ID harus menunjuk akun Supabase Auth yang sudah ada.");
  assert(!existing || existing.owner_id === ownerId, "Demo dimiliki akun lain.");

  const bucket = "wedding-assets";
  const assetBase = `${env.SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${demoSlug}`;
  const { content, assets } = demoContent(assetBase);
  // Validate every source before writing to storage or the database.
  const files = assets.map((path) => ({ path, bytes: readFileSync(new URL(`../prototype/assets/${path}`, import.meta.url)) }));
  console.log("Backup sebelum seed:", await backupSqlite(client));
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) throw bucketError;
  const currentBucket = buckets.find((item) => item.name === bucket);
  if (currentBucket) assert(currentBucket.public, "Bucket wedding-assets harus publik; izin tidak diubah otomatis.");
  else {
    const { error } = await supabase.storage.createBucket(bucket, { public: true, allowedMimeTypes: ["image/png", "image/jpeg"], fileSizeLimit: 10 * 1024 * 1024 });
    if (error) throw error;
  }
  for (const { path, bytes } of files) {
    const { error } = await supabase.storage.from(bucket).upload(`${demoSlug}/${path}`, bytes, {
      upsert: true, contentType: path.endsWith(".jpg") ? "image/jpeg" : "image/png",
    });
    if (error) throw error;
    const response = await fetch(`${assetBase}/${path}`, { method: "HEAD", signal: AbortSignal.timeout(15000) });
    assert(response.ok && response.headers.get("content-type")?.startsWith("image/"), `Aset belum tersedia: ${path}`);
  }
  seedDemo(client, ownerId, content);
  assert.equal(client.pragma("integrity_check", { simple: true }), "ok");
  assert.deepEqual(client.pragma("foreign_key_check"), []);
  console.log(`Seed selesai: ${env.SITE_URL.replace(/\/$/, "")}/${demoSlug}; ${assets.length} gambar, 30 galeri, 4 tamu contoh (respons lama dipertahankan).`);
  console.log("Terbitkan ulang melalui dashboard pemilik untuk menyegarkan halaman yang sudah di-cache. Link personal tersedia di dashboard pemilik.");
} finally { client.close(); }
