import type { DatosReporte } from "./datosReporte";
import { getTitulares, type Titular } from "./noticias";
import type { FilaCotizacion } from "@/lib/types";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";
// Primero el modelo que "piensa" (redacta un análisis bastante mejor, pero tarda 10-25 s); si falla o se pasa del
// tiempo, el liviano (~2 s). Los timeouts suman menos que el maxDuration de 60 s de las rutas que lo usan.
const MODELOS = process.env.GEMINI_MODEL
  ? [{ modelo: process.env.GEMINI_MODEL, timeoutMs: 40_000 }]
  : [
      { modelo: "gemini-3.5-flash", timeoutMs: 30_000 },
      { modelo: "gemini-3.5-flash-lite", timeoutMs: 15_000 },
    ];

export interface ResumenIA {
  texto: string;
  modelo: string;
  /** Cantidad de titulares de prensa que se le dieron al modelo como contexto. */
  titulares: number;
  /** Medios de esos titulares, para citarlos en el PDF. */
  fuentes: string[];
}

function lineas(filas: FilaCotizacion[] | null, max: number): string {
  if (!filas) return "sin datos";
  return filas
    .slice(0, max)
    .map((f) => {
      const precio = f.ultimoPrecio ?? "s/d";
      const variacion = f.variacionPorcentual !== null ? ` (${f.variacionPorcentual}%)` : "";
      return `${f.simbolo}: ${precio}${variacion}`;
    })
    .join("; ");
}

const formateadorDiaMes = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", timeZone: "America/Argentina/Buenos_Aires" });

function lineaTitular(t: Titular): string {
  const cobertura = t.cobertura > 1 ? ` [cubierto por ${t.cobertura} medios]` : "";
  return `${formateadorDiaMes.format(t.fecha)} — ${t.titulo}${t.medio ? ` (${t.medio})` : ""}${cobertura}`;
}

function armarDatos(datos: DatosReporte, titulares: Titular[]): string {
  const fecha = datos.fechaCierre.toISOString().slice(0, 10);
  const dolares = datos.dolares.datos?.map((d) => `${d.nombre}: compra ${d.compra} / venta ${d.venta}`).join("; ") ?? "sin datos";

  return [
    `Fecha del último cierre de mercado: ${fecha}.`,
    `Dólares: ${dolares}`,
    `Riesgo país: ${datos.riesgoPais.datos ? `${datos.riesgoPais.datos.valor} pb` : "sin datos"}. VIX: ${datos.vix.datos?.valor ?? "sin datos"}.`,
    `Panel Líder (cierre): ${lineas(datos.panelLider.datos, 20)}`,
    `Bonos en dólares MEP (cierre): ${lineas(datos.bonosMep.datos, 16)}`,
    `CEDEARs más operados (cierre): ${lineas(datos.cedears.datos, 10)}`,
    `Índices EE.UU.: ${lineas(datos.indices.datos, 4)}`,
    `Commodities: ${lineas(datos.commodities.datos, 5)}`,
    `Cripto: ${lineas(datos.criptos.datos, 6)}`,
    "",
    `TITULARES DE PRENSA PUBLICADOS EL ${datos.fechaCierre.toISOString().slice(0, 10)} (dd/mm — titular (medio)):`,
    titulares.length > 0 ? titulares.map(lineaTitular).join("\n") : "(no hay titulares de ese día disponibles)",
  ].join("\n");
}

const SISTEMA =
  "Sos un analista de mercados argentino y redactás el informe de cierre de la rueda para inversores. Español " +
  "rioplatense, tono profesional, claro y directo, sin markdown, sin listas con símbolos, sin tablas. Tenés dos " +
  "fuentes: los DATOS de cierre y los TITULARES DE PRENSA publicados el día del cierre. Los titulares vienen " +
  "ordenados por relevancia: los marcados como [cubierto por N medios] son los hechos que dominaron la jornada. " +
  "Tu trabajo es EXPLICAR qué pasó y por qué, no solo describir los números: identificá los eventos más relevantes " +
  "del día, decí qué ocurrió, por qué le importa al mercado y cómo se reflejó en los precios de los datos (qué " +
  "activos se movieron y cuánto). " +
  "Reglas: usá SOLO los titulares del día provistos: no agregues hechos, cifras ni noticias de días anteriores ni " +
  "de tu conocimiento previo; nunca inventes cifras; si un titular contradice a los datos, prevalecen los datos; " +
  "no atribuyas causalidad más fuerte que la que sugieren los titulares (usá 'en un contexto de', 'en línea con', " +
  "'presionado por'); no cites medios ni copies titulares textualmente; si no hay titulares relevantes, limitate " +
  "a los datos. " +
  "Formato exacto, cuatro párrafos separados por una línea en blanco: " +
  "(1) Panorama: cómo cerró la rueda, con cifras concretas de acciones, bonos, riesgo país y dólar (3 a 4 oraciones). " +
  "(2) Empezá con 'Eventos relevantes:' y desarrollá los 3 o 4 hechos más importantes del día, cada uno con qué " +
  "pasó, por qué importa y su efecto en el mercado (5 a 7 oraciones en total). " +
  "(3) Empezá con 'Contexto internacional:' y explicá qué pasó afuera (Wall Street, tasas, petróleo, etc.) y cómo " +
  "impactó localmente (2 a 3 oraciones). " +
  "(4) Empezá con 'Conclusión:' y diga qué dejó la rueda y qué conviene monitorear en la próxima (2 a 3 oraciones). " +
  "Máximo 330 palabras en total.";

function limpiar(texto: string): string {
  // Marcas de cita que dejan los modelos al buscar: 【2†L6-L10】 o [1], [2, 3].
  return texto
    .replace(/【[^】]*】/g, "")
    .replace(/\[\d+(?:\s*,\s*\d+)*\]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

interface GeminiBloque {
  text?: unknown;
  content?: unknown;
}

/** Junta el texto de la respuesta sin depender de una forma exacta: recorre el JSON y toma los `text` del/los pasos de salida del modelo. */
function textoDeGemini(json: unknown): string {
  const partes: string[] = [];

  const recorrer = (nodo: unknown, dentroDeSalida: boolean) => {
    if (Array.isArray(nodo)) return nodo.forEach((n) => recorrer(n, dentroDeSalida));
    if (!nodo || typeof nodo !== "object") return;

    const obj = nodo as Record<string, unknown> & GeminiBloque;
    const tipo = typeof obj.type === "string" ? obj.type : "";
    const esSalida = dentroDeSalida || tipo === "model_output";

    if (esSalida && typeof obj.text === "string") partes.push(obj.text);
    for (const [clave, valor] of Object.entries(obj)) {
      if (clave === "annotations" || clave === "google_search_result") continue;
      recorrer(valor, esSalida);
    }
  };

  recorrer(json, false);

  // Si la forma fuera la clásica de generateContent (candidates[].content.parts[].text):
  if (partes.length === 0) {
    const candidatos = (json as { candidates?: { content?: { parts?: { text?: string }[] } }[] })?.candidates;
    for (const parte of candidatos?.[0]?.content?.parts ?? []) if (parte.text) partes.push(parte.text);
  }

  return partes.join("").trim();
}

async function pedirGemini(datos: DatosReporte, titulares: Titular[], modelo: string, timeoutMs: number): Promise<ResumenIA> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Falta GEMINI_API_KEY");

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      model: modelo,
      input: `${SISTEMA}

DATOS DE LA RUEDA:
${armarDatos(datos, titulares)}`,
    }),
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Gemini respondió ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }

  const texto = limpiar(textoDeGemini(await response.json()));
  if (!texto) throw new Error("Gemini devolvió una respuesta vacía");

  const fuentes = [...new Set(titulares.map((t) => t.medio).filter(Boolean))].slice(0, 8);
  return { texto, modelo, titulares: titulares.length, fuentes };
}

/**
 * Best-effort: nunca tira. Trae titulares de prensa (Google Noticias) y le
 * pide a Gemini un mini informe a partir de los datos de cierre más esas
 * noticias — Gemini no busca por su cuenta: la búsqueda integrada da 429 en
 * el plan gratuito, así que el contexto extra lo trae el servidor. Sin clave
 * o si falla, devuelve null y el PDF se arma sin esta sección.
 */
export async function getResumenIA(datos: DatosReporte): Promise<ResumenIA | null> {
  if (!process.env.GEMINI_API_KEY) return null;

  const titulares = await getTitulares(datos.fechaCierre);

  for (const { modelo, timeoutMs } of MODELOS) {
    try {
      return await pedirGemini(datos, titulares, modelo, timeoutMs);
    } catch (cause) {
      console.error(`[reporte-cierre:resumen-ia] ${modelo} falló:`, cause);
    }
  }

  return null;
}
