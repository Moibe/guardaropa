CREATE TABLE `prendas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`posicion` text NOT NULL,
	`nombre` text NOT NULL,
	`color` text,
	`notas` text,
	`activa` integer DEFAULT true NOT NULL,
	`creado` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `prendas_posicion_idx` ON `prendas` (`posicion`);--> statement-breakpoint
CREATE TABLE `vestuario_prendas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vestuario_id` integer NOT NULL,
	`prenda_id` integer NOT NULL,
	`capa` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`vestuario_id`) REFERENCES `vestuarios`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`prenda_id`) REFERENCES `prendas`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `vestuario_prendas_vestuario_idx` ON `vestuario_prendas` (`vestuario_id`);--> statement-breakpoint
CREATE INDEX `vestuario_prendas_prenda_idx` ON `vestuario_prendas` (`prenda_id`);--> statement-breakpoint
CREATE TABLE `vestuarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fecha` text NOT NULL,
	`etiqueta` text,
	`notas` text,
	`creado` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `vestuarios_fecha_idx` ON `vestuarios` (`fecha`);