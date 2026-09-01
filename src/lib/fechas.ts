// Helpers de fecha sin dependencias. Todo se maneja como texto ISO 'YYYY-MM-DD' y
// 'YYYY-MM' construido a partir de las partes LOCALES de la fecha: nunca uses
// toISOString() aquí, porque convierte a UTC y de noche te recorre el día.

const MESES = [
	'enero',
	'febrero',
	'marzo',
	'abril',
	'mayo',
	'junio',
	'julio',
	'agosto',
	'septiembre',
	'octubre',
	'noviembre',
	'diciembre'
];

const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

/** Encabezados del grid, empezando en lunes. */
export const INICIALES_SEMANA = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export type CeldaDia = { dia: number; iso: string };

function pad2(n: number) {
	return String(n).padStart(2, '0');
}

export function aIsoDia(d: Date): string {
	return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function aIsoMes(d: Date): string {
	return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

export function esIsoMes(s: string): boolean {
	if (!/^\d{4}-\d{2}$/.test(s)) return false;
	const mes = Number(s.slice(5, 7));
	return mes >= 1 && mes <= 12;
}

/** Valida forma Y existencia: '2026-02-31' es forma válida pero no es un día real. */
export function esIsoDia(s: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
	const [y, m, d] = s.split('-').map(Number);
	const fecha = new Date(y, m - 1, d);
	return fecha.getFullYear() === y && fecha.getMonth() === m - 1 && fecha.getDate() === d;
}

/** El mes de un día: '2026-09-08' → '2026-09'. */
export function mesDelDia(iso: string): string {
	return iso.slice(0, 7);
}

/** Mes anterior/siguiente: mesVecino('2026-01', -1) → '2025-12'. */
export function mesVecino(mes: string, delta: number): string {
	const [y, m] = mes.split('-').map(Number);
	return aIsoMes(new Date(y, m - 1 + delta, 1));
}

/** '2026-09' → 'septiembre 2026'. */
export function nombreMes(mes: string): string {
	const [y, m] = mes.split('-').map(Number);
	return `${MESES[m - 1]} ${y}`;
}

/** '2026-09-08' → 'martes 8 de septiembre de 2026'. */
export function formatoLargo(iso: string): string {
	const [y, m, d] = iso.split('-').map(Number);
	const semana = DIAS_SEMANA[(new Date(y, m - 1, d).getDay() + 6) % 7];
	return `${semana} ${d} de ${MESES[m - 1]} de ${y}`;
}

/**
 * Las celdas del grid del mes, empezando en lunes. Los `null` son los huecos de
 * relleno al inicio y al final para que la cuadrícula cierre en semanas completas.
 */
export function celdasDelMes(mes: string): (CeldaDia | null)[] {
	const [y, m] = mes.split('-').map(Number);
	const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7;
	const total = new Date(y, m, 0).getDate();

	const celdas: (CeldaDia | null)[] = Array(offset).fill(null);
	for (let dia = 1; dia <= total; dia++) {
		celdas.push({ dia, iso: `${mes}-${pad2(dia)}` });
	}
	while (celdas.length % 7 !== 0) celdas.push(null);
	return celdas;
}
