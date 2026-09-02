// Las POSICIONES que componen un vestuario: dónde va puesta una prenda, no qué
// prenda es. Un vestido y un overol NO son posiciones — son prendas que ocupan
// una posición (y, si hiciera falta, más de una).
//
// Todas son opcionales: un vestuario puede llenar una sola, todas, o varias
// prendas en la misma posición (capas).
//
// El orden del arreglo es el orden en que se pinta, y NO es el orden en que uno se
// viste: arriba lo que se decide a diario (top, bottom, chamarra, zapatos), luego interiores
// y calcetines, y al final sombrero y accesorios.
//
// `accesorios` es la posición de varios por definición (aretes, reloj, cinturón),
// pero no necesita nada especial: cualquier posición admite varias prendas — es el
// mismo mecanismo que las capas, solo que aquí `capa` es orden de captura y no
// una prenda encima de otra.
//
// Este archivo NO es server-only a propósito: el schema de drizzle lo importa por
// ruta relativa y la UI por $lib, así que la lista vive en un solo lugar.
export const POSICIONES = [
	'top',
	'bottom',
	'chamarra',
	'zapatos',
	'interior_superior',
	'interior_inferior',
	'calcetines',
	'sombrero',
	'accesorios'
] as const;

export type Posicion = (typeof POSICIONES)[number];

export const ETIQUETA_POSICION: Record<Posicion, string> = {
	interior_superior: 'Interior superior',
	interior_inferior: 'Interior inferior',
	top: 'Top',
	bottom: 'Bottom',
	chamarra: 'Chamarra',
	calcetines: 'Calcetines',
	zapatos: 'Zapatos',
	sombrero: 'Sombrero',
	accesorios: 'Accesorios'
};

/**
 * Ícono de cada posición. Son emoji y no SVG a propósito: el selector es un
 * <select> nativo, y un <option> solo admite texto — ahí un SVG no se pinta. Con
 * emoji el mismo ícono sirve en el selector, en el catálogo y en el panel del día.
 */
export const ICONO_POSICION: Record<Posicion, string> = {
	interior_superior: '👙',
	interior_inferior: '🩲',
	top: '👕',
	bottom: '👖',
	chamarra: '🧥',
	calcetines: '🧦',
	zapatos: '👟',
	sombrero: '🎩',
	accesorios: '💍'
};

/**
 * Para comparar y buscar nombres de prendas: sin acentos, sin mayúsculas, sin
 * espacios de sobra. Así "Playera Polo Roja" y "playera polo roja" son la misma,
 * y buscar "polo" la encuentra. Lo usan el buscador del picker y el servidor al
 * decidir si una prenda ya existe o hay que darla de alta — deben coincidir.
 */
export function normaliza(texto: string): string {
	return texto
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim()
		.replace(/\s+/g, ' ')
		.toLowerCase();
}

export function esPosicion(valor: string): valor is Posicion {
	return (POSICIONES as readonly string[]).includes(valor);
}
