// Los slots que componen un vestuario. TODOS son opcionales: un vestuario puede
// tener uno solo, los siete, o varias prendas en el mismo slot (capas).
//
// El orden del arreglo es el orden en que se pinta: de adentro hacia afuera y de
// arriba hacia abajo, o sea el orden en que uno se viste.
//
// Este archivo NO es server-only a propósito: el schema de drizzle lo importa por
// ruta relativa y la UI por $lib, así que la lista de tipos vive en un solo lugar.
export const TIPOS_PRENDA = [
	'interior_superior',
	'interior_inferior',
	'top',
	'bottom',
	'calcetines',
	'zapatos',
	'sombrero'
] as const;

export type TipoPrenda = (typeof TIPOS_PRENDA)[number];

export const ETIQUETA_TIPO: Record<TipoPrenda, string> = {
	interior_superior: 'Interior superior',
	interior_inferior: 'Interior inferior',
	top: 'Top',
	bottom: 'Bottom',
	calcetines: 'Calcetines',
	zapatos: 'Zapatos',
	sombrero: 'Sombrero'
};

export function esTipoPrenda(valor: string): valor is TipoPrenda {
	return (TIPOS_PRENDA as readonly string[]).includes(valor);
}
