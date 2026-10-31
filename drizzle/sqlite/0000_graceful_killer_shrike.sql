CREATE TABLE `guests` (
	`id` text PRIMARY KEY NOT NULL,
	`invitation_id` text NOT NULL,
	`name` text NOT NULL,
	`partner_name` text,
	`allowed_guest_count` integer DEFAULT 1 NOT NULL,
	`share_token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "guests_allowed_guest_count_range" CHECK("guests"."allowed_guest_count" between 1 and 20),
	CONSTRAINT "guests_token_format" CHECK(length("guests"."share_token") = 22 and "guests"."share_token" not glob '*[^A-Za-z0-9_-]*')
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guests_share_token_unique` ON `guests` (`share_token`);--> statement-breakpoint
CREATE INDEX `guests_invitation_id_idx` ON `guests` (`invitation_id`);--> statement-breakpoint
CREATE TABLE `invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`template_id` text NOT NULL,
	`template_version` integer NOT NULL,
	`slug` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`draft_content` text,
	`published_content` text,
	`published_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "invitations_status" CHECK("invitations"."status" in ('draft', 'published', 'unpublished')),
	CONSTRAINT "invitations_slug_format" CHECK(length("invitations"."slug") between 3 and 60 and "invitations"."slug" not glob '*[^a-z0-9-]*' and "invitations"."slug" not like '-%' and "invitations"."slug" not like '%-' and "invitations"."slug" not like '%--%'),
	CONSTRAINT "invitations_draft_json" CHECK("invitations"."draft_content" is null or json_valid("invitations"."draft_content")),
	CONSTRAINT "invitations_published_json" CHECK("invitations"."published_content" is null or json_valid("invitations"."published_content"))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_slug_unique` ON `invitations` (`slug`);--> statement-breakpoint
CREATE INDEX `invitations_owner_id_idx` ON `invitations` (`owner_id`);--> statement-breakpoint
CREATE TABLE `rsvps` (
	`id` text PRIMARY KEY NOT NULL,
	`guest_id` text NOT NULL,
	`status` text NOT NULL,
	`attendance_count` integer NOT NULL,
	`wish` text,
	`is_wish_visible` integer DEFAULT true NOT NULL,
	`responded_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "rsvps_attendance_matches_status" CHECK(("rsvps"."status" = 'attending' and "rsvps"."attendance_count" between 1 and 20) or ("rsvps"."status" = 'not_attending' and "rsvps"."attendance_count" = 0)),
	CONSTRAINT "rsvps_wish_length" CHECK(length("rsvps"."wish") <= 500),
	CONSTRAINT "rsvps_visibility" CHECK("rsvps"."is_wish_visible" in (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rsvps_guest_id_unique` ON `rsvps` (`guest_id`);