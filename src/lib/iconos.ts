// Íconos de prenda dibujados a mano, en un solo lugar. Cada uno se dibuja en un
// lienzo de 32x32 y se parte en dos grupos de paths:
//
//   relleno — la silueta de la prenda. Se pinta con el color que le asignes.
//   trazo   — los detalles (costuras, bolsa, cordones). Se pintan en una versión
//             oscurecida de ese mismo color, para que se vean tanto sobre un
//             color pálido como sobre uno saturado.
//
// Los paths van en el orden en que se pintan: lo que va detrás, primero.
//
// Para agregar un ícono nuevo basta una entrada aquí: el selector del editor, el
// catálogo, los chips del calendario y el picker lo toman todos de esta lista.

export type Dibujo = {
	nombre: string;
	relleno: string[];
	trazo: string[];
};

export const ICONOS = {
	hoodie: {
		nombre: 'Hoodie',
		relleno: [
			// Capucha, detrás del cuerpo.
			'M11.5 10.5C11 4.6 13.2 2.8 16 2.8s5 1.8 4.5 7.7z',
			// Cuerpo y mangas, con el escote en curva entre los hombros.
			'M10 9L4 14l3 5.5 2.5-2V29h13V17.5l2.5 2L28 14 22 9h-3q-3 4.2-6 0z'
		],
		trazo: [
			// Bolsa canguro.
			'M11 20.5c0 3.5 1.6 4.3 5 4.3s5-.8 5-4.3',
			// Cordones.
			'M14.8 12.8 14.4 16.8M17.2 12.8 17.6 16.8',
			// Resorte del ruedo.
			'M9.5 26.5h13'
		]
	}
} satisfies Record<string, Dibujo>;

export type ClaveIcono = keyof typeof ICONOS;

export const CLAVES_ICONO = Object.keys(ICONOS) as ClaveIcono[];

export function esClaveIcono(valor: string): valor is ClaveIcono {
	return valor in ICONOS;
}

/** Color con el que se pinta un ícono al que no le asignaron uno. */
export const COLOR_ICONO_DEFAULT = '#a1a1aa';

/**
 * Colores a un clic para asignarle a una prenda. No es una lista cerrada: el
 * editor también trae el selector de color del navegador.
 */
export const COLORES_PRENDA = [
	{ nombre: 'Negro', hex: '#18181b' },
	{ nombre: 'Gris', hex: '#9ca3af' },
	{ nombre: 'Blanco', hex: '#ffffff' },
	{ nombre: 'Beige', hex: '#d6c7a1' },
	{ nombre: 'Café', hex: '#92400e' },
	{ nombre: 'Rojo', hex: '#dc2626' },
	{ nombre: 'Vino', hex: '#7f1d1d' },
	{ nombre: 'Naranja', hex: '#ea580c' },
	{ nombre: 'Amarillo', hex: '#eab308' },
	{ nombre: 'Verde', hex: '#16a34a' },
	{ nombre: 'Azul', hex: '#2563eb' },
	{ nombre: 'Mezclilla', hex: '#4a6fa5' },
	{ nombre: 'Marino', hex: '#1e3a8a' },
	{ nombre: 'Morado', hex: '#7c3aed' },
	{ nombre: 'Rosa', hex: '#ec4899' }
];

/** Un hex de 6 dígitos, que es lo que manda <input type="color">. */
export function esHex(valor: string): boolean {
	return /^#[0-9a-fA-F]{6}$/.test(valor);
}
