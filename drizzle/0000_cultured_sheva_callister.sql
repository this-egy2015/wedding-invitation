CREATE TYPE "public"."invitation_status" AS ENUM('draft', 'published', 'unpublished');--> statement-breakpoint
CREATE TYPE "public"."rsvp_status" AS ENUM('attending', 'not_attending');--> statement-breakpoint
CREATE TABLE "guests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitation_id" uuid NOT NULL,
	"name" text NOT NULL,
	"partner_name" text,
	"allowed_guest_count" integer DEFAULT 1 NOT NULL,
	"share_token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guests_share_token_unique" UNIQUE("share_token"),
	CONSTRAINT "guests_allowed_guest_count_range" CHECK ("guests"."allowed_guest_count" between 1 and 20)
);
--> statement-breakpoint
ALTER TABLE "guests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"template_id" text NOT NULL,
	"template_version" integer NOT NULL,
	"slug" text NOT NULL,
	"status" "invitation_status" DEFAULT 'draft' NOT NULL,
	"draft_content" jsonb,
	"published_content" jsonb,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_slug_unique" UNIQUE("slug"),
	CONSTRAINT "invitations_slug_format" CHECK ("invitations"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
ALTER TABLE "invitations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "rsvps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_id" uuid NOT NULL,
	"status" "rsvp_status" NOT NULL,
	"attendance_count" integer NOT NULL,
	"wish" text,
	"is_wish_visible" boolean DEFAULT true NOT NULL,
	"responded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rsvps_guest_id_unique" UNIQUE("guest_id"),
	CONSTRAINT "rsvps_attendance_matches_status" CHECK (("rsvps"."status" = 'attending' and "rsvps"."attendance_count" >= 1) or ("rsvps"."status" = 'not_attending' and "rsvps"."attendance_count" = 0)),
	CONSTRAINT "rsvps_wish_length" CHECK (char_length("rsvps"."wish") <= 500)
);
--> statement-breakpoint
ALTER TABLE "rsvps" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "guests_invitation_id_idx" ON "guests" USING btree ("invitation_id");--> statement-breakpoint
CREATE INDEX "invitations_owner_id_idx" ON "invitations" USING btree ("owner_id");