import { fail } from '@sveltejs/kit';
import { asc, between, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { entradas } from '$lib/server/db/schema';
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

	// Un solo query por mes: el grid pinta los indicadores y el panel del día
	// filtra de la misma lista, sin ir de nuevo a la base.
	const delMes = db
		.select()
		.from(entradas)
		.where(between(entradas.fecha, `${mes}-01`, `${mes}-31`))
		.orderBy(asc(entradas.fecha), asc(entradas.id))
		.all();

	return { mes, dia, hoy: isoHoy, entradas: delMes };
};

export const actions: Actions = {
	agregar: async ({ request }) => {
		const datos = await request.formData();
		const fecha = String(datos.get('fecha') ?? '');
		const titulo = String(datos.get('titulo') ?? '').trim();
		const nota = String(datos.get('nota') ?? '').trim();

		if (!esIsoDia(fecha)) return fail(400, { error: 'Esa fecha no existe.' });
		if (!titulo) return fail(400, { error: 'Ponle un título a la entrada.', nota });

		db.insert(entradas).values({ fecha, titulo, nota: nota || null }).run();
		return { ok: true };
	},

	eliminar: async ({ request }) => {
		const datos = await request.formData();
		const id = Number(datos.get('id'));

		if (!Number.isInteger(id)) return fail(400, { error: 'Esa entrada no existe.' });

		db.delete(entradas).where(eq(entradas.id, id)).run();
		return { ok: true };
	}
};
