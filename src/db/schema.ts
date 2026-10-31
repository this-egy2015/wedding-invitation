import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { InvitationContent } from "@/features/invitations/content";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()).$onUpdate(() => new Date()),
};

export const invitations = sqliteTable("invitations", {
  id: text("id").primaryKey().$defaultFn(randomUUID),
  // Supabase Auth verifies this UUID; authorization remains an application boundary.
  ownerId: text("owner_id").notNull(),
  templateId: text("template_id").notNull(),
  templateVersion: integer("template_version").notNull(),
  slug: text("slug").notNull().unique(),
  status: text("status", { enum: ["draft", "published", "unpublished"] }).notNull().default("draft"),
  draftContent: text("draft_content", { mode: "json" }).$type<InvitationContent>(),
  publishedContent: text("published_content", { mode: "json" }).$type<InvitationContent>(),
  publishedAt: integer("published_at", { mode: "timestamp_ms" }),
  ...timestamps,
}, (t) => [
  index("invitations_owner_id_idx").on(t.ownerId),
  check("invitations_status", sql`${t.status} in ('draft', 'published', 'unpublished')`),
  check("invitations_slug_format", sql`length(${t.slug}) between 3 and 60 and ${t.slug} not glob '*[^a-z0-9-]*' and ${t.slug} not like '-%' and ${t.slug} not like '%-' and ${t.slug} not like '%--%'`),
  check("invitations_draft_json", sql`${t.draftContent} is null or json_valid(${t.draftContent})`),
  check("invitations_published_json", sql`${t.publishedContent} is null or json_valid(${t.publishedContent})`),
]);

export const guests = sqliteTable("guests", {
  id: text("id").primaryKey().$defaultFn(randomUUID),
  invitationId: text("invitation_id").notNull().references(() => invitations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  partnerName: text("partner_name"),
  allowedGuestCount: integer("allowed_guest_count").notNull().default(1),
  shareToken: text("share_token").notNull().unique(),
  ...timestamps,
}, (t) => [
  index("guests_invitation_id_idx").on(t.invitationId),
  check("guests_allowed_guest_count_range", sql`${t.allowedGuestCount} between 1 and 20`),
  check("guests_token_format", sql`length(${t.shareToken}) = 22 and ${t.shareToken} not glob '*[^A-Za-z0-9_-]*'`),
]);

export const rsvps = sqliteTable("rsvps", {
  id: text("id").primaryKey().$defaultFn(randomUUID),
  guestId: text("guest_id").notNull().unique().references(() => guests.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["attending", "not_attending"] }).notNull(),
  attendanceCount: integer("attendance_count").notNull(),
  wish: text("wish"),
  isWishVisible: integer("is_wish_visible", { mode: "boolean" }).notNull().default(true),
  respondedAt: integer("responded_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: timestamps.updatedAt,
}, (t) => [
  check("rsvps_attendance_matches_status", sql`(${t.status} = 'attending' and ${t.attendanceCount} between 1 and 20) or (${t.status} = 'not_attending' and ${t.attendanceCount} = 0)`),
  check("rsvps_wish_length", sql`length(${t.wish}) <= 500`),
  check("rsvps_visibility", sql`${t.isWishVisible} in (0, 1)`),
]);
