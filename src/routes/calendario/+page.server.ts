import { fail } from '@sveltejs/kit';
import { and, asc, between, eq, inArray, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { prendas, vestuarioPrendas, vestuarios, type Prenda } from '$lib/server/db/schema';
import { aIsoDia, aIsoMes, esIsoDia, esIsoMes, mesDelDia } from '$lib/fechas';
import { esPosicion, normaliza } from '$lib/prendas';
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
					icono: prendas.icono,
					posicion: prendas.posicion,
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
		.select({
			id: prendas.id,
			nombre: prendas.nombre,
			icono: prendas.icono,
			posicion: prendas.posicion
		})
		.from(prendas)
		.where(eq(prendas.activa, true))
		.orderBy(asc(prendas.posicion), asc(prendas.nombre))
		.all();

	// Qué renglón de qué vestuario está abierto para elegir prenda, como
	// '<vestuarioId>:<posicion>'. Vive en la URL igual que mes y día: sin estado de
	// cliente, con back button, y funciona sin JS.
	const ponerParam = url.searchParams.get('poner');
	let poner: string | null = null;
	if (ponerParam) {
		const [idTexto, pos] = ponerParam.split(':');
		const id = Number(idTexto);
		const abrible = delMes.some((v) => v.id === id && v.fecha === dia);
		if (Number.isInteger(id) && pos && esPosicion(pos) && abrible) poner = ponerParam;
	}

	return { mes, dia, hoy: isoHoy, poner, vestuarios: delMes, piezas, catalogo };
};

/**
 * Mete una prenda en un vestuario, encimándola sobre lo que ya haya en su slot.
 * Devuelve false si esa prenda ya estaba puesta: la misma prenda física no se
 * puede llevar dos veces en el mismo vestuario.
 */
function ponerEnVestuario(vestuarioId: number, prenda: Prenda): boolean {
	const yaPuesta = db
		.select({ id: vestuarioPrendas.id })
		.from(vestuarioPrendas)
		.where(
			and(eq(vestuarioPrendas.vestuarioId, vestuarioId), eq(vestuarioPrendas.prendaId, prenda.id))
		)
		.get();
	if (yaPuesta) return false;

	// La capa nueva va encima de lo que ya haya en esa misma posición: la posición es la
	// posición de la prenda, así que se cuenta cuántas de la misma trae el vestuario.
	const fila = db
		.select({ cuantas: sql<number>`count(*)` })
		.from(vestuarioPrendas)
		.innerJoin(prendas, eq(vestuarioPrendas.prendaId, prendas.id))
		.where(and(eq(vestuarioPrendas.vestuarioId, vestuarioId), eq(prendas.posicion, prenda.posicion)))
		.get();

	db.insert(vestuarioPrendas)
		.values({ vestuarioId, prendaId: prenda.id, capa: fila?.cuantas ?? 0 })
		.run();
	return true;
}

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

		if (!ponerEnVestuario(vestuarioId, prenda)) {
			return fail(409, { error: 'Ya traes puesta esa prenda.' });
		}
		return { ok: true };
	},

	/**
	 * Escribir el nombre en el renglón. Si ya existe una prenda en esa posición con ese
	 * nombre se usa esa (comparando normalizado, así "Polo roja" y "polo  ROJA" son
	 * la misma); si no existe, se da de alta y se pone, en un solo paso.
	 */
	ponerPorNombre: async ({ request }) => {
		const datos = await request.formData();
		const vestuarioId = Number(datos.get('vestuarioId'));
		const posicion = String(datos.get('posicion') ?? '');
		const nombre = String(datos.get('nombre') ?? '').trim();

		if (!Number.isInteger(vestuarioId)) return fail(400, { error: 'Ese vestuario no existe.' });
		if (!esPosicion(posicion)) return fail(400, { error: 'Esa posición no existe.' });
		if (!nombre) return fail(400, { error: 'Escribe el nombre de la prenda.' });

		const vestuario = db.select().from(vestuarios).where(eq(vestuarios.id, vestuarioId)).get();
		if (!vestuario) return fail(404, { error: 'Ese vestuario no existe.' });

		const enPosicion = db.select().from(prendas).where(eq(prendas.posicion, posicion)).all();
		let prenda = enPosicion.find((p) => normaliza(p.nombre) === normaliza(nombre));

		if (!prenda) {
			prenda = db.insert(prendas).values({ posicion, nombre }).returning().get();
		} else if (!prenda.activa) {
			// Estaba archivada: volver a usarla la revive, en vez de crear una duplicada.
			db.update(prendas).set({ activa: true }).where(eq(prendas.id, prenda.id)).run();
		}

		if (!ponerEnVestuario(vestuarioId, prenda)) {
			return fail(409, { error: 'Ya traes puesta esa prenda.' });
		}
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
