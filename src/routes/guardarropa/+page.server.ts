import { fail } from '@sveltejs/kit';
import { asc, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { prendas, vestuarioPrendas } from '$lib/server/db/schema';
import { esPosicion } from '$lib/prendas';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	const catalogo = db
		.select()
		.from(prendas)
		.orderBy(asc(prendas.posicion), asc(prendas.nombre))
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

	// Qué tarjeta está abierta para editar. Vive en la URL, igual que el renglón
	// abierto del calendario: sin estado de cliente y con botón de atrás.
	const editarParam = Number(url.searchParams.get('editar'));
	const editar = catalogo.some((p) => p.id === editarParam) ? editarParam : null;

	return { catalogo, usos, editar };
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
		const posicion = String(datos.get('posicion') ?? '');
		const nombre = String(datos.get('nombre') ?? '').trim();
		const color = String(datos.get('color') ?? '').trim();
		const notas = String(datos.get('notas') ?? '').trim();

		if (!esPosicion(posicion)) return fail(400, { error: 'Elige en qué posición va la prenda.' });
		if (!nombre) return fail(400, { error: 'Ponle nombre a la prenda.' });

		db.insert(prendas)
			.values({ posicion, nombre, color: color || null, notas: notas || null })
			.run();
		return { ok: true };
	},

	/** Guardar los cambios de una prenda ya existente. */
	actualizar: async ({ request }) => {
		const datos = await request.formData();
		const id = Number(datos.get('id'));
		const nombre = String(datos.get('nombre') ?? '').trim();
		const icono = String(datos.get('icono') ?? '').trim();
		const color = String(datos.get('color') ?? '').trim();
		const notas = String(datos.get('notas') ?? '').trim();

		if (!Number.isInteger(id)) return fail(400, { error: 'Esa prenda no existe.' });
		if (!nombre) return fail(400, { error: 'La prenda necesita un nombre.' });

		const existe = db.select({ id: prendas.id }).from(prendas).where(eq(prendas.id, id)).get();
		if (!existe) return fail(404, { error: 'Esa prenda no existe.' });

		db.update(prendas)
			.set({
				nombre,
				// El ícono se guarda recortado: un emoji, no una frase.
				icono: icono ? [...icono].slice(0, 3).join('') : null,
				color: color || null,
				notas: notas || null
			})
			.where(eq(prendas.id, id))
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
