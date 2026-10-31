import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import type { Client } from "@libsql/client";
import { contentSchema, type InvitationContent } from "../src/features/invitations/content.ts";

export const seedSlug = "gaby-afdhal";

export function seedContent(assetBase: string) {
  const content = JSON.parse(readFileSync(new URL("./fixtures/gaby-afdhal.json", import.meta.url), "utf8"));
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

/** Initializes the invitation once; repeat runs never overwrite production content or responses. */
export async function seedInvitation(client: Client, ownerId: string, content: InvitationContent) {
  contentSchema.parse(content);
  const tx = await client.transaction("write");
  try {
    const existing = (await tx.execute({ sql: "SELECT id, owner_id FROM invitations WHERE slug = ?", args: [seedSlug] })).rows[0];
    if (existing && existing.owner_id !== ownerId) throw new Error("Undangan sudah dimiliki akun lain; seed dibatalkan.");
    const invitationId = existing ? String(existing.id) : randomUUID();
    const now = Date.now();
    const json = JSON.stringify(content);
    await tx.execute({ sql: `INSERT INTO invitations (id, owner_id, template_id, template_version, slug, status, draft_content, published_content, published_at, created_at, updated_at)
      VALUES (?, ?, 'classic', 1, ?, 'published', ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO NOTHING`, args: [invitationId, ownerId, seedSlug, json, json, now, now, now] });

    await tx.commit();
    return invitationId;
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally { tx.close(); }
}
