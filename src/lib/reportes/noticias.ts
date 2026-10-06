const TIMEOUT_MS = 8_000;
const POR_TEMA = 8;
const MAX_TITULARES = 40;
const ZONA = "America/Argentina/Buenos_Aires";

/** Temas que mueven la rueda; cada uno es una búsqueda en Google Noticias (RSS gratuito, sin clave). */
const TEMAS = [
  "Merval acciones argentinas",
  "riesgo país bonos argentinos",
  "dólar hoy Argentina",
  "BCRA tasas inflación",
  "reservas Banco Central compra de dólares",
  "Caputo Milei anuncio economía",
  "FMI deuda vencimientos bonos",
  "Wall Street S&P 500 Nasdaq",
  "Fed tasas de interés Estados Unidos",
  "petróleo oro commodities precio",
];

// Las búsquedas de Google Noticias traen ruido (deportes, espectáculos) que comparte alguna palabra con el tema:
// solo pasan los titulares que hablan de mercados, economía o política económica.
const ES_FINANCIERO =
  /riesgo pa[ií]s|bono|acci[oó]n|acciones|merval|d[oó]lar|bolsa|wall street|mercado|tasa|bcra|banco central|inflaci[oó]n|reservas|caputo|s&p|nasdaq|dow jones|petr[oó]leo|cedear|econom|fmi|deuda|plazo fijo|cauci[oó]n|d[eé]ficit|super[aá]vit|fiscal|inversor|cotiza|cripto|bitcoin|oro\b|soja|trigo|fed\b|treasury|rendimiento|peso\b|devaluaci[oó]n|brecha/i;

export interface Titular {
  titulo: string;
  medio: string;
  fecha: Date;
  /** Cuántos titulares del día cuentan el mismo hecho (incluido este): más cobertura = hecho más relevante. */
  cobertura: number;
}

const ENTIDADES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'" };

function decodificar(texto: string): string {
  return texto
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&(?:amp|lt|gt|quot|apos|#39);/g, (e) => ENTIDADES[e] ?? e)
    .trim();
}

function parsearRss(xml: string): Titular[] {
  const titulares: Titular[] = [];

  for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const bruto = decodificar(item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
    const fecha = new Date(item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "");
    if (!bruto || Number.isNaN(fecha.getTime())) continue;

    // Google Noticias agrega el medio al final del título: "Titular - Medio".
    const corte = bruto.lastIndexOf(" - ");
    const titulo = corte > 0 ? bruto.slice(0, corte) : bruto;
    const medio = corte > 0 ? bruto.slice(corte + 3) : "";
    titulares.push({ titulo, medio, fecha, cobertura: 1 });
  }

  return titulares;
}

/** "AAAA-MM-DD" de un instante, en hora Argentina (la fecha de cierre es un día calendario argentino). */
function diaArgentino(fecha: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(fecha);
}

function sumarDias(fechaISO: string, dias: number): string {
  const fecha = new Date(`${fechaISO}T00:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

async function titularesDeTema(tema: string, dia: string): Promise<Titular[]> {
  // after:/before: acotan la búsqueda a la fecha (con un día de margen a cada lado, porque
  // Google los interpreta en UTC); el filtro exacto por día argentino se hace acá abajo.
  const consulta = `${tema} after:${sumarDias(dia, -1)} before:${sumarDias(dia, 1)}`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(consulta)}&hl=es-419&gl=AR&ceid=AR:es-419`;
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Google Noticias respondió ${response.status} para "${tema}"`);

  return parsearRss(await response.text())
    .filter((titular) => diaArgentino(titular.fecha) === dia && ES_FINANCIERO.test(titular.titulo))
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
    .slice(0, POR_TEMA);
}

/**
 * Titulares de prensa publicados el día de la fecha de cierre (día calendario
 * argentino), nada de días anteriores. Best-effort: un tema que falla no tira
 * abajo a los demás, y si no hay ninguno devuelve [] (el resumen se redacta
 * igual, solo con los datos).
 */
const PALABRAS_VACIAS = new Set(["para","como","desde","hasta","sobre","entre","tras","este","esta","estos","estas","pero","porque","cuando","donde","cual","tiene","hace","hoy","ayer","mientras","luego","segun","ante","cada","todo","todos","mas","muy","sus","los","las","del","por","que","con","una","uno","fue","son","ser"]);

function palabrasClave(titulo: string): Set<string> {
  return new Set(
    titulo
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .split(/[^a-z0-9$%]+/)
      .filter((p) => p.length > 3 && !PALABRAS_VACIAS.has(p)),
  );
}

/** Dos titulares hablan del mismo hecho si comparten varias palabras clave respecto del más corto. */
function mismoHecho(a: Set<string>, b: Set<string>): boolean {
  let comunes = 0;
  for (const palabra of a) if (b.has(palabra)) comunes++;
  return comunes >= 3 && comunes / Math.min(a.size, b.size) >= 0.45;
}

function calcularCobertura(titulares: Titular[]): void {
  const claves = titulares.map((t) => palabrasClave(t.titulo));
  titulares.forEach((titular, i) => {
    titular.cobertura = claves.reduce((n, otra, j) => n + (i === j || mismoHecho(claves[i], otra) ? 1 : 0), 0);
  });
}

export async function getTitulares(fechaCierre: Date): Promise<Titular[]> {
  const dia = fechaCierre.toISOString().slice(0, 10);
  const resultados = await Promise.allSettled(TEMAS.map((tema) => titularesDeTema(tema, dia)));

  const vistos = new Set<string>();
  const titulares: Titular[] = [];

  for (const resultado of resultados) {
    if (resultado.status === "rejected") {
      console.error("[reporte-cierre:noticias]", resultado.reason);
      continue;
    }
    for (const titular of resultado.value) {
      const clave = titular.titulo.toLowerCase().slice(0, 60);
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      titulares.push(titular);
    }
  }

  calcularCobertura(titulares);

  // Primero los hechos más cubiertos (los más relevantes del día); a igual cobertura, los más recientes.
  return titulares
    .sort((a, b) => b.cobertura - a.cobertura || b.fecha.getTime() - a.fecha.getTime())
    .slice(0, MAX_TITULARES);
}
