import { randomBytes, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import type { Client } from "@libsql/client";
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
export async function seedDemo(client: Client, ownerId: string, content: InvitationContent) {
  contentSchema.parse(content);
  const tx = await client.transaction("write");
  try {
    const existing = (await tx.execute({ sql: "SELECT id, owner_id FROM invitations WHERE slug = ?", args: [demoSlug] })).rows[0];
    if (existing && existing.owner_id !== ownerId) throw new Error("Demo sudah dimiliki akun lain; seed dibatalkan.");
    const invitationId = existing ? String(existing.id) : randomUUID();
    const now = Date.now();
    const json = JSON.stringify(content);
    await tx.execute({ sql: `INSERT INTO invitations (id, owner_id, template_id, template_version, slug, status, draft_content, published_content, published_at, created_at, updated_at)
      VALUES (?, ?, 'classic', 1, ?, 'published', ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET draft_content = excluded.draft_content, published_content = excluded.published_content,
        status = 'published', published_at = excluded.published_at, updated_at = excluded.updated_at`, args: [invitationId, ownerId, demoSlug, json, json, now, now, now] });

    const samples = [
      { name: "Tamu Contoh — Belum Konfirmasi", status: null, count: 0, wish: null },
      { name: "Tamu Contoh — Keluarga", status: "attending", count: 2, wish: "Selamat menempuh hidup baru. Semoga menjadi keluarga yang sakinah, mawaddah, warahmah." },
      { name: "Tamu Contoh — Sahabat", status: "attending", count: 1, wish: "Semoga selalu bahagia dan saling menguatkan. Sampai bertemu di hari bahagia kalian!" },
      { name: "Tamu Contoh — Berhalangan", status: "not_attending", count: 0, wish: "Mohon maaf belum bisa hadir. Doa terbaik untuk Gaby dan Afdhal." },
    ];
    for (const [index, sample] of samples.entries()) {
      const guestId = `387f920e-0754-4a87-b084-00000000000${index + 1}`;
      const guest = (await tx.execute({ sql: "SELECT invitation_id FROM guests WHERE id = ?", args: [guestId] })).rows[0];
      if (guest && guest.invitation_id !== invitationId) throw new Error("ID tamu seed bertabrakan dengan undangan lain.");
      if (guest) continue;
      await tx.execute({ sql: `INSERT INTO guests (id, invitation_id, name, allowed_guest_count, share_token, created_at, updated_at)
        VALUES (?, ?, ?, 2, ?, ?, ?)`, args: [guestId, invitationId, sample.name, randomBytes(16).toString("base64url"), now, now] });
      if (sample.status) {
        await tx.execute({ sql: `INSERT INTO rsvps (id, guest_id, status, attendance_count, wish, is_wish_visible, responded_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 1, ?, ?)`, args: [randomUUID(), guestId, sample.status, sample.count, sample.wish, now, now] });
      }
    }
    await tx.commit();
    return invitationId;
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally { tx.close(); }
}
