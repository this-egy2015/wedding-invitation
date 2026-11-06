CREATE TABLE `invitation_staff` (
	`invitation_id` text NOT NULL,
	`email` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`invitation_id`, `email`),
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "invitation_staff_normalized_email" CHECK("invitation_staff"."email" = lower(trim("invitation_staff"."email")) and length("invitation_staff"."email") between 3 and 254)
);
--> statement-breakpoint
CREATE INDEX `invitation_staff_email_idx` ON `invitation_staff` (`email`);