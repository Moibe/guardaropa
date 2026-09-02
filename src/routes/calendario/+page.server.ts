import { fail } from '@sveltejs/kit';
import { and, asc, between, eq, inArray, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { prendas, vestuarioPrendas, vestuarios } from '$lib/server/db/schema';
import { aIsoDia, aIsoMes, esIsoDia, esIsoMes, mesDelDia } from '$lib/fechas';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	const hoy = new Date();
	const isoHoy = aIsoDia(hoy);

	// Mes y día vienen del querystring para que navegar sea un link normal
	// (funciona sin JS y cada día es una URL que se puede compartir).
	const mesParam = url.searchParams.get('mes');
	const mes = mesParam && esIsoMes(mesParam) ? mesParam : aIsoMes(hoy);

	const diaParam = url.searchParams.get('dia');
	const diaValido = diaParam && esIsoDia(diaParam) && mesDelDia(diaParam) === mes;
	const dia = diaValido ? diaParam : mesDelDia(isoHoy) === mes ? isoHoy : `${mes}-01`;

	// Un solo par de queries por mes: el grid pinta los indicadores y el panel del
	// día filtra de la misma lista, sin volver a la base.
	const delMes = db
		.select()
		.from(vestuarios)
		.where(between(vestuarios.fecha, `${mes}-01`, `${mes}-31`))
		.orderBy(asc(vestuarios.fecha), asc(vestuarios.id))
		.all();

	const ids = delMes.map((v) => v.id);
	const piezas = ids.length
		? db
				.select({
					id: vestuarioPrendas.id,
					vestuarioId: vestuarioPrendas.vestuarioId,
					capa: vestuarioPrendas.capa,
					prendaId: prendas.id,
					nombre: prendas.nombre,
					tipo: prendas.tipo,
					color: prendas.color
				})
				.from(vestuarioPrendas)
				.innerJoin(prendas, eq(vestuarioPrendas.prendaId, prendas.id))
				.where(inArray(vestuarioPrendas.vestuarioId, ids))
				.orderBy(asc(vestuarioPrendas.capa), asc(vestuarioPrendas.id))
				.all()
		: [];

	// Solo las prendas activas se ofrecen en el selector; las archivadas siguen
	// apareciendo en los vestuarios donde ya estaban.
	const catalogo = db
		.select({ id: prendas.id, nombre: prendas.nombre, tipo: prendas.tipo })
		.from(prendas)
		.where(eq(prendas.activa, true))
		.orderBy(asc(prendas.tipo), asc(prendas.nombre))
		.all();

	return { mes, dia, hoy: isoHoy, vestuarios: delMes, piezas, catalogo };
};

export const actions: Actions = {
	crearVestuario: async ({ request }) => {
		const datos = await request.formData();
		const fecha = String(datos.get('fecha') ?? '');
		const etiqueta = String(datos.get('etiqueta') ?? '').trim();

		if (!esIsoDia(fecha)) return fail(400, { error: 'Esa fecha no existe.' });

		db.insert(vestuarios)
			.values({ fecha, etiqueta: etiqueta || null })
			.run();
		return { ok: true };
	},

	eliminarVestuario: async ({ request }) => {
		const datos = await request.formData();
		const id = Number(datos.get('id'));
		if (!Number.isInteger(id)) return fail(400, { error: 'Ese vestuario no existe.' });

		// Las piezas se van solas: la FK de vestuario_prendas es ON DELETE CASCADE.
		db.delete(vestuarios).where(eq(vestuarios.id, id)).run();
		return { ok: true };
	},

	agregarPrenda: async ({ request }) => {
		const datos = await request.formData();
		const vestuarioId = Number(datos.get('vestuarioId'));
		const prendaId = Number(datos.get('prendaId'));

		if (!Number.isInteger(vestuarioId)) return fail(400, { error: 'Ese vestuario no existe.' });
		if (!Number.isInteger(prendaId)) return fail(400, { error: 'Elige una prenda.' });

		const vestuario = db.select().from(vestuarios).where(eq(vestuarios.id, vestuarioId)).get();
		if (!vestuario) return fail(404, { error: 'Ese vestuario no existe.' });

		const prenda = db.select().from(prendas).where(eq(prendas.id, prendaId)).get();
		if (!prenda) return fail(404, { error: 'Esa prenda no existe.' });

		// La capa nueva va encima de lo que ya haya en ese mismo slot: el slot es el
		// tipo de la prenda, así que se cuenta cuántas del mismo tipo trae el vestuario.
		const fila = db
			.select({ cuantas: sql<number>`count(*)` })
			.from(vestuarioPrendas)
			.innerJoin(prendas, eq(vestuarioPrendas.prendaId, prendas.id))
			.where(and(eq(vestuarioPrendas.vestuarioId, vestuarioId), eq(prendas.tipo, prenda.tipo)))
			.get();

		db.insert(vestuarioPrendas)
			.values({ vestuarioId, prendaId, capa: fila?.cuantas ?? 0 })
			.run();
		return { ok: true };
	},

	quitarPrenda: async ({ request }) => {
		const datos = await request.formData();
		const id = Number(datos.get('id'));
		if (!Number.isInteger(id)) return fail(400, { error: 'Esa pieza no existe.' });

		db.delete(vestuarioPrendas).where(eq(vestuarioPrendas.id, id)).run();
		return { ok: true };
	}
};
