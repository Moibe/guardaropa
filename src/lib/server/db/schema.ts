import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';

// Una entrada del calendario: algo colgado de un día concreto.
// `fecha` se guarda como texto ISO 'YYYY-MM-DD' (no timestamp) para que el día sea
// el día, sin que la zona horaria lo recorra al cruzar medianoche.
export const entradas = sqliteTable(
	'entradas',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		fecha: text('fecha').notNull(),
		titulo: text('titulo').notNull(),
		nota: text('nota'),
		creado: integer('creado', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(t) => [index('entradas_fecha_idx').on(t.fecha)]
);

export type Entrada = typeof entradas.$inferSelect;
export type NuevaEntrada = typeof entradas.$inferInsert;
