import { fail } from '@sveltejs/kit';
import { asc, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { prendas, vestuarioPrendas } from '$lib/server/db/schema';
import { esTipoPrenda } from '$lib/prendas';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const catalogo = db
		.select()
		.from(prendas)
		.orderBy(asc(prendas.tipo), asc(prendas.nombre))
		.all();

	// Cuántas veces se ha usado cada prenda: decide si se puede borrar de verdad
	// o solo archivar, y de paso es dato útil de ver en el catálogo.
	const conteos = db
		.select({ prendaId: vestuarioPrendas.prendaId, veces: sql<number>`count(*)` })
		.from(vestuarioPrendas)
		.groupBy(vestuarioPrendas.prendaId)
		.all();

	const usos: Record<number, number> = {};
	for (const { prendaId, veces } of conteos) usos[prendaId] = veces;

	return { catalogo, usos };
};

/** Cuántos vestuarios usan esta prenda. */
function vecesUsada(prendaId: number): number {
	const fila = db
		.select({ veces: sql<number>`count(*)` })
		.from(vestuarioPrendas)
		.where(eq(vestuarioPrendas.prendaId, prendaId))
		.get();
	return fila?.veces ?? 0;
}

export const actions: Actions = {
	agregar: async ({ request }) => {
		const datos = await request.formData();
		const tipo = String(datos.get('tipo') ?? '');
		const nombre = String(datos.get('nombre') ?? '').trim();
		const color = String(datos.get('color') ?? '').trim();
		const notas = String(datos.get('notas') ?? '').trim();

		if (!esTipoPrenda(tipo)) return fail(400, { error: 'Elige de qué tipo es la prenda.' });
		if (!nombre) return fail(400, { error: 'Ponle nombre a la prenda.' });

		db.insert(prendas)
			.values({ tipo, nombre, color: color || null, notas: notas || null })
			.run();
		return { ok: true };
	},

	/** Archivar / restaurar: saca la prenda del selector sin tocar los vestuarios pasados. */
	alternarArchivo: async ({ request }) => {
		const datos = await request.formData();
		const id = Number(datos.get('id'));
		if (!Number.isInteger(id)) return fail(400, { error: 'Esa prenda no existe.' });

		const prenda = db.select().from(prendas).where(eq(prendas.id, id)).get();
		if (!prenda) return fail(404, { error: 'Esa prenda no existe.' });

		db.update(prendas).set({ activa: !prenda.activa }).where(eq(prendas.id, id)).run();
		return { ok: true };
	},

	/** Borrado real, solo si nunca se usó. Si ya está en un vestuario, se archiva. */
	eliminar: async ({ request }) => {
		const datos = await request.formData();
		const id = Number(datos.get('id'));
		if (!Number.isInteger(id)) return fail(400, { error: 'Esa prenda no existe.' });

		const veces = vecesUsada(id);
		if (veces > 0) {
			return fail(409, {
				error: `Esa prenda está en ${veces} ${veces === 1 ? 'vestuario' : 'vestuarios'}. Archívala en vez de borrarla para no agujerear el historial.`
			});
		}

		db.delete(prendas).where(eq(prendas.id, id)).run();
		return { ok: true };
	}
};
