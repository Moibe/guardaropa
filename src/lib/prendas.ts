// Los slots que componen un vestuario. TODOS son opcionales: un vestuario puede
// tener uno solo, todos, o varias prendas en el mismo slot (capas).
//
// El orden del arreglo es el orden en que se pinta: de adentro hacia afuera y de
// arriba hacia abajo, o sea el orden en que uno se viste.
//
// Este archivo NO es server-only a propósito: el schema de drizzle lo importa por
// ruta relativa y la UI por $lib, así que la lista de tipos vive en un solo lugar.
export const TIPOS_PRENDA = [
	'interior_superior',
	'interior_inferior',
	'vestido',
	'overol',
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
	vestido: 'Vestido',
	overol: 'Overol',
	top: 'Top',
	bottom: 'Bottom',
	calcetines: 'Calcetines',
	zapatos: 'Zapatos',
	sombrero: 'Sombrero'
};

/**
 * Ícono de cada tipo. Son emoji y no SVG a propósito: el selector de tipo es un
 * <select> nativo, y un <option> solo admite texto — ahí un SVG no se pinta.
 * Usando emoji, el mismo ícono sirve en el selector, en el catálogo y en el
 * panel del día, en vez de tener dos juegos distintos.
 */
export const ICONO_TIPO: Record<TipoPrenda, string> = {
	interior_superior: '👙',
	interior_inferior: '🩲',
	vestido: '👗',
	overol: '🦺',
	top: '👕',
	bottom: '👖',
	calcetines: '🧦',
	zapatos: '👟',
	sombrero: '🎩'
};

/**
 * Prendas que con una sola pieza llenan más de un slot. Es propiedad del TIPO, no
 * de la prenda: todos los vestidos cubren top y bottom, así que vive aquí y no en
 * una columna de la base.
 *
 * Lo que no está en este mapa se cubre a sí mismo.
 *
 * Esto INFORMA, no restringe: vestido con leggings debajo es un outfit real, así
 * que nada impide llenar además el slot cubierto.
 */
export const CUBRE: Partial<Record<TipoPrenda, readonly TipoPrenda[]>> = {
	vestido: ['top', 'bottom'],
	overol: ['top', 'bottom']
};

/** ¿Este tipo existe para cubrir otros slots? */
export function esCobertor(tipo: TipoPrenda): boolean {
	return tipo in CUBRE;
}

/** Qué slots llena una prenda de este tipo (él mismo, si no cubre otros). */
export function slotsCubiertos(tipo: TipoPrenda): readonly TipoPrenda[] {
	return CUBRE[tipo] ?? [tipo];
}

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

export function esTipoPrenda(valor: string): valor is TipoPrenda {
	return (TIPOS_PRENDA as readonly string[]).includes(valor);
}
