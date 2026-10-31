import { randomBytes, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import type Database from "better-sqlite3";
import { contentSchema, type InvitationContent } from "../src/features/invitations/content.ts";

export const demoSlug = "demo-gaby-afdhal";

export function demoContent(assetBase: string) {
  const content = JSON.parse(readFileSync(new URL("./fixtures/demo-gaby-afdhal.json", import.meta.url), "utf8"));
  const assets: string[] = [];
  const url = (path: string) => {
    assets.push(path);
    return `${assetBase.replace(/\/$/, "")}/${path}`;
  };
  content.coverImageUrl = url(content.coverImageUrl);
  content.coverPortraitUrl = url(content.coverPortraitUrl);
  content.bride.photoUrl = url(content.bride.photoUrl);
  content.groom.photoUrl = url(content.groom.photoUrl);
  content.quote.imageUrl = url(content.quote.imageUrl);
  content.akad.mapImageUrl = url(content.akad.mapImageUrl);
  content.resepsi.mapImageUrl = url(content.resepsi.mapImageUrl);
  content.galleryUrls = content.galleryUrls.map(url);
  return { content: contentSchema.parse(content), assets };
}

/** Updates only the demo content; existing guest tokens, responses and moderation survive reruns. */
export function seedDemo(client: Database.Database, ownerId: string, content: InvitationContent) {
  contentSchema.parse(content);
  return client.transaction(() => {
    const existing = client.prepare("SELECT id, owner_id FROM invitations WHERE slug = ?").get(demoSlug) as { id: string; owner_id: string } | undefined;
    if (existing && existing.owner_id !== ownerId) throw new Error("Demo sudah dimiliki akun lain; seed dibatalkan.");
    const invitationId = existing?.id ?? randomUUID();
    const now = Date.now();
    const json = JSON.stringify(content);
    client.prepare(`INSERT INTO invitations (id, owner_id, template_id, template_version, slug, status, draft_content, published_content, published_at, created_at, updated_at)
      VALUES (?, ?, 'classic', 1, ?, 'published', ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET draft_content = excluded.draft_content, published_content = excluded.published_content,
        status = 'published', published_at = excluded.published_at, updated_at = excluded.updated_at`).run(invitationId, ownerId, demoSlug, json, json, now, now, now);

    const samples = [
      { name: "Tamu Contoh — Belum Konfirmasi", status: null, count: 0, wish: null },
      { name: "Tamu Contoh — Keluarga", status: "attending", count: 2, wish: "Selamat menempuh hidup baru. Semoga menjadi keluarga yang sakinah, mawaddah, warahmah." },
      { name: "Tamu Contoh — Sahabat", status: "attending", count: 1, wish: "Semoga selalu bahagia dan saling menguatkan. Sampai bertemu di hari bahagia kalian!" },
      { name: "Tamu Contoh — Berhalangan", status: "not_attending", count: 0, wish: "Mohon maaf belum bisa hadir. Doa terbaik untuk Gaby dan Afdhal." },
    ];
    for (const [index, sample] of samples.entries()) {
      const guestId = `387f920e-0754-4a87-b084-00000000000${index + 1}`;
      const guest = client.prepare("SELECT invitation_id FROM guests WHERE id = ?").get(guestId) as { invitation_id: string } | undefined;
      if (guest && guest.invitation_id !== invitationId) throw new Error("ID tamu seed bertabrakan dengan undangan lain.");
      if (guest) continue;
      client.prepare(`INSERT INTO guests (id, invitation_id, name, allowed_guest_count, share_token, created_at, updated_at)
        VALUES (?, ?, ?, 2, ?, ?, ?)`).run(guestId, invitationId, sample.name, randomBytes(16).toString("base64url"), now, now);
      if (sample.status) {
        client.prepare(`INSERT INTO rsvps (id, guest_id, status, attendance_count, wish, is_wish_visible, responded_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 1, ?, ?)`).run(randomUUID(), guestId, sample.status, sample.count, sample.wish, now, now);
      }
    }
    return invitationId;
  }).immediate();
}
