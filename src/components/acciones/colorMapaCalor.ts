/**
 * Rampa divergente para el mapa de calor: mismo par verde/rojo que usa
 * `VariacionBadge` en todo el sitio (emerald-400 / red-400) — no el
 * azul/rojo "seguro para daltonismo" que sugeriría una paleta nueva desde
 * cero, para no romper la convención ya establecida en toda la app. La
 * separación CVD de ese par da "WARN" (zona 6-8), que el método de diseño
 * permite siempre que haya una codificación secundaria — acá la hay: cada
 * tile muestra el símbolo y el % como texto, no solo color.
 */
const NEUTRO = { r: 0x3a, g: 0x3a, b: 0x3a };
const POSITIVO = { r: 0x34, g: 0xd3, b: 0x99 };
const NEGATIVO = { r: 0xf8, g: 0x71, b: 0x71 };

/** A partir de esta variación (en valor absoluto) el color ya está en su tono más saturado. */
const TOPE_VARIACION = 6;

interface RGB {
  r: number;
  g: number;
  b: number;
}

function mezclar(a: RGB, b: RGB, t: number): RGB {
  return { r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t };
}

function aHex({ r, g, b }: RGB): string {
  const canal = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0");
  return `#${canal(r)}${canal(g)}${canal(b)}`;
}

/** Luminancia perceptual aproximada (0-1): suficiente para elegir texto blanco/oscuro, no hace falta la fórmula WCAG exacta acá. */
function luminancia({ r, g, b }: RGB): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function rgbParaVariacion(variacion: number | null): RGB {
  if (variacion === null || variacion === 0) return NEUTRO;
  const t = Math.min(Math.abs(variacion), TOPE_VARIACION) / TOPE_VARIACION;
  return mezclar(NEUTRO, variacion > 0 ? POSITIVO : NEGATIVO, t);
}

/**
 * Color de fondo del tile y el color de texto que mejor contrasta sobre él
 * (blanco o casi negro, según la luminancia del relleno — mismo criterio que
 * pide el método de diseño para una etiqueta dentro de un fill de color).
 */
export function coloresTile(variacion: number | null): { fondo: string; texto: string } {
  const rgb = rgbParaVariacion(variacion);
  return { fondo: aHex(rgb), texto: luminancia(rgb) > 0.6 ? "#020617" : "#f8fafc" };
}
