import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import type { InvitationContent } from "@/features/invitations/content";

export const invitationStatus = pgEnum("invitation_status", ["draft", "published", "unpublished"]);
// "pending" is not stored: a guest without an rsvps row is pending.
export const rsvpStatus = pgEnum("rsvp_status", ["attending", "not_attending"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

// RLS is enabled with no policies: the app connects as the postgres role (bypasses RLS),
// while the public Supabase Data API (anon/authenticated) gets no access to these tables.
export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    templateId: text("template_id").notNull(),
    templateVersion: integer("template_version").notNull(),
    slug: text("slug").notNull().unique(),
    status: invitationStatus("status").notNull().default("draft"),
    draftContent: jsonb("draft_content").$type<InvitationContent>(),
    publishedContent: jsonb("published_content").$type<InvitationContent>(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("invitations_owner_id_idx").on(t.ownerId),
    check("invitations_slug_format", sql`${t.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
  ],
).enableRLS();

export const guests = pgTable(
  "guests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    partnerName: text("partner_name"),
    allowedGuestCount: integer("allowed_guest_count").notNull().default(1),
    shareToken: text("share_token").notNull().unique(),
    ...timestamps,
  },
  (t) => [
    index("guests_invitation_id_idx").on(t.invitationId),
    check("guests_allowed_guest_count_range", sql`${t.allowedGuestCount} between 1 and 20`),
  ],
).enableRLS();

export const rsvps = pgTable(
  "rsvps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    guestId: uuid("guest_id")
      .notNull()
      .unique()
      .references(() => guests.id, { onDelete: "cascade" }),
    status: rsvpStatus("status").notNull(),
    attendanceCount: integer("attendance_count").notNull(),
    wish: text("wish"),
    isWishVisible: boolean("is_wish_visible").notNull().default(true),
    respondedAt: timestamp("responded_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamps.updatedAt,
  },
  (t) => [
    check(
      "rsvps_attendance_matches_status",
      sql`(${t.status} = 'attending' and ${t.attendanceCount} >= 1) or (${t.status} = 'not_attending' and ${t.attendanceCount} = 0)`,
    ),
    check("rsvps_wish_length", sql`char_length(${t.wish}) <= 500`),
  ],
).enableRLS();
