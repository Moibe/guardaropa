import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';
import { TIPOS_PRENDA } from '../../prendas';

// Ruta relativa a propósito en el import de arriba: drizzle-kit compila este archivo
// fuera de Vite, así que el alias $lib no le resuelve.

/**
 * El guardarropa: cada prenda física, dada de alta una sola vez.
 * No se borran las que ya se usaron — se archivan (`activa = false`) para no
 * agujerear los vestuarios pasados.
 */
export const prendas = sqliteTable(
	'prendas',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		tipo: text('tipo', { enum: TIPOS_PRENDA }).notNull(),
		nombre: text('nombre').notNull(),
		color: text('color'),
		notas: text('notas'),
		activa: integer('activa', { mode: 'boolean' }).notNull().default(true),
		creado: integer('creado', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(t) => [index('prendas_tipo_idx').on(t.tipo)]
);

/**
 * Lo que se usó (o se planea usar) un día. Normalmente hay uno por fecha, pero
 * la fecha NO es única: un día puede llevar varios (día / noche / gym), cada uno
 * con su etiqueta. `etiqueta` en null = el vestuario del día, sin más.
 */
export const vestuarios = sqliteTable(
	'vestuarios',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		fecha: text('fecha').notNull(),
		etiqueta: text('etiqueta'),
		notas: text('notas'),
		creado: integer('creado', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(t) => [index('vestuarios_fecha_idx').on(t.fecha)]
);

/**
 * Qué prendas lleva un vestuario. El slot NO se guarda aquí: es el `tipo` de la
 * prenda, así no hay forma de que los dos se contradigan. `capa` ordena dentro
 * de un mismo slot (playera capa 0, saco capa 1).
 */
export const vestuarioPrendas = sqliteTable(
	'vestuario_prendas',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		vestuarioId: integer('vestuario_id')
			.notNull()
			.references(() => vestuarios.id, { onDelete: 'cascade' }),
		prendaId: integer('prenda_id')
			.notNull()
			.references(() => prendas.id, { onDelete: 'restrict' }),
		capa: integer('capa').notNull().default(0)
	},
	(t) => [
		index('vestuario_prendas_vestuario_idx').on(t.vestuarioId),
		index('vestuario_prendas_prenda_idx').on(t.prendaId)
	]
);

export type Prenda = typeof prendas.$inferSelect;
export type NuevaPrenda = typeof prendas.$inferInsert;
export type Vestuario = typeof vestuarios.$inferSelect;
export type VestuarioPrenda = typeof vestuarioPrendas.$inferSelect;
