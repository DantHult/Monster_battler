CREATE TABLE `feedback` (
	`room_id` text NOT NULL,
	`player` integer NOT NULL,
	`stage` text NOT NULL,
	`answers` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`room_id`, `player`, `stage`),
	FOREIGN KEY (`room_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`p0_token_hash` text NOT NULL,
	`p1_token_hash` text,
	`created_at` integer NOT NULL,
	`p0_seen` integer NOT NULL,
	`p1_seen` integer NOT NULL,
	`journal` text NOT NULL
);
