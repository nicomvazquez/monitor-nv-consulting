export const IOL_BASE_URL = "https://api.invertironline.com";

export const IOL_TOKEN_URL = `${IOL_BASE_URL}/token`;

/**
 * Nombres de instrumento/panel/país tal como los espera
 * GET /api/v2/Cotizaciones/{instrumento}/{panel}/{pais}.
 *
 * Verificado a mano contra la API real: el Panel Líder de acciones
 * argentinas corresponde al valor de panel "merval" (no "Lideres").
 */
export const PANEL_LIDER = {
  instrumento: "acciones",
  panel: "merval",
  pais: "argentina",
} as const;

/**
 * La API de IOL ignora el segmento "panel" para bonos (siempre devuelve el
 * universo completo de títulos), así que "Soberanos" acá es solo un nombre
 * descriptivo: el filtro real por bono soberano en dólares se hace en
 * `getBonosSoberanosDolares` con `SOBERANOS_DOLARES_PREFIJOS`.
 */
export const BONOS = {
  instrumento: "Bonos",
  panel: "Soberanos",
  pais: "argentina",
} as const;

/**
 * Prefijos de símbolo de los bonos soberanos (Tesoro Nacional / Rep.
 * Argentina) más conocidos: Bonares (AL), Globales (GD), Discount (AE), Par
 * (PAY) y los Bonos del Tesoro en dólares emitidos en 2024/2025 (AN, AO).
 * Deja afuera deuda provincial, BOPREAL (es deuda del BCRA, no del Tesoro) y
 * fideicomisos privados. Si aparece un bono soberano nuevo que no matchea,
 * agregar su prefijo acá.
 */
export const SOBERANOS_DOLARES_PREFIJOS = ["AL", "GD", "AE", "PAY", "AN", "AO"] as const;

/**
 * Para deuda soberana en pesos (letras y bonos CER), a diferencia de en
 * dólares, los símbolos no comparten un puñado de prefijos reconocibles, así
 * que se filtra por palabras clave en la descripción en vez de por prefijo
 * de símbolo. Compartido entre `getLetras` y `getBonosCer`. Verificado a
 * mano: matchea "Tesoro Nacional", "Rep. Argentina", "Bonte" y los legacy
 * marcados "(Ley Arg)" (Par/Discount/Cuasipar/cupón PBI en pesos, que no
 * dicen "Tesoro" ni "Nación" en su descripción).
 */
export const PESOS_SOBERANO_PALABRAS_CLAVE = /REP\.?\s*ARG|NAC|BONTE|TESORO|\(Ley Arg\)/i;

/**
 * Deja afuera instrumentos "dollar-linked"/moneda dual (pagan en pesos pero
 * ajustan por USD, ej. TZV27, D10Y7) y las letras "Lelink" (cuyo nombre no
 * menciona USD en la descripción pero son dollar-linked igual): los paneles
 * quedan como pura exposición a pesos, mismo criterio simplificador que se
 * usó para dejar afuera el dólar cable del panel de bonos en dólares.
 */
export const PESOS_EXCLUYE_FX = /USD|US\$|U\$S|LELINK/i;

/** Filtro adicional para quedarse solo con los bonos ajustados por CER dentro de la deuda soberana en pesos. */
export const PESOS_ES_CER = /CER/i;

/**
 * IOL sufija cada símbolo en dólares con la liquidación: "D" = dólar MEP
 * (48hs, se liquida localmente) y "C" = dólar cable/CCL (contado con
 * liquidación, se liquida contra una cuenta en el exterior). Confirmado
 * contra la API real: la propia descripción de los tickers "D" dice "MEP"
 * (ej. "BONO TESORO NACIONAL TAMAR 26/02/27 $ USD MEP" para TMF7D, contra
 * "... $ USDC" para TMF7C).
 */
export const SUFIJO_DOLAR_MEP = "D";

/**
 * A diferencia de lo esperable, CEDEARs no es un instrumento propio sino un
 * panel dentro de "acciones" (verificado contra la API real: instrumento
 * "CEDEARs" solo devuelve 400). Trae 935 títulos: 395 en pesos y 540 en
 * dólares (misma variante de liquidación MEP que acciones/bonos, un símbolo
 * por cada uno con el mismo ticker base). Nos quedamos con la versión en
 * pesos de cada CEDEAR para no listar el mismo activo dos veces.
 */
export const CEDEARS = {
  instrumento: "acciones",
  panel: "CEDEARs",
  pais: "argentina",
} as const;

/**
 * Cuántos CEDEARs se muestran en el panel de "más importantes". Se ordenan
 * por `cantidadOperaciones` (cantidad de operaciones del día): verificado a
 * mano que el top real coincide con los CEDEARs más conocidos/líquidos
 * (NVDA, SPY, GOOGL, META, AAPL, MELI, KO, ...), así que no hace falta una
 * lista curada a mano como con los bonos.
 */
export const CEDEARS_TOP_N = 25;

/** Cada cuántos segundos se refrescan las cotizaciones mientras el mercado está operando. */
export const REVALIDATE_SECONDS_MERCADO_ABIERTO = 60;

/** Cada cuántos segundos se refrescan fuera de rueda (noches, fines de semana): los precios no cambian, así que alcanza con espaciar mucho los pedidos. */
export const REVALIDATE_SECONDS_MERCADO_CERRADO = 30 * 60;

/**
 * A diferencia de acciones/bonos, acá "panel" sí importa: "todas" trae la
 * tasa promedio ponderada operada en el día para cada plazo, agregando
 * pesos y dólares juntos en una sola lista (ver `esPesos` en
 * `lib/iol/caucion.ts` para cómo se separan). Encontrado navegando la propia
 * web de IOL (usa esta misma ruta pública) — no estaba en ninguna
 * combinación de instrumento/panel que se había probado antes.
 */
export const CAUCIONES = {
  instrumento: "cauciones",
  panel: "todas",
  pais: "argentina",
} as const;

/**
 * "Letras" es un instrumento propio, distinto de "Bonos" (verificado contra
 * la API real). Trae 154 títulos: LECAPs/LECER nacionales, pero también
 * pagarés y cheques privados (símbolos que arrancan con "#"/"*") y letras
 * provinciales — filtrados igual que el resto con `PESOS_SOBERANO_PALABRAS_CLAVE`.
 */
export const LETRAS = {
  instrumento: "Letras",
  panel: "Todas",
  pais: "argentina",
} as const;

/** Plazos (en días) que se muestran en los cuadritos de tasa de caución. */
export const CAUCION_PLAZOS_DIAS = [1, 7, 14] as const;

/**
 * Si el plazo pedido no tuvo operaciones en el día (pasa seguido con 1 y 2
 * días), hasta cuántos días para cada lado se busca el plazo operado más
 * cercano antes de mostrar "-".
 */
export const CAUCION_FALLBACK_RADIO_DIAS = 3;

/**
 * La respuesta de `CAUCIONES` no distingue moneda con un campo propio: se
 * infiere por la tasa. En el contexto macro actual de Argentina, cauciones
 * en pesos rinden un orden de magnitud más que en dólares (ej. ~19-21% vs
 * ~0.5-1% verificado a mano contra la API real), así que cualquier tasa por
 * encima de este umbral se toma como pesos. Si esa relación deja de
 * sostenerse, ajustar acá.
 */
export const CAUCION_UMBRAL_TASA_PESOS = 5;
