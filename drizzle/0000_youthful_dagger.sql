CREATE TABLE `entradas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fecha` text NOT NULL,
	`titulo` text NOT NULL,
	`nota` text,
	`creado` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `entradas_fecha_idx` ON `entradas` (`fecha`);