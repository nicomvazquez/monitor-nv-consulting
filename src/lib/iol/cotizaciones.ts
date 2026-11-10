import { iolFetch } from "./client";
import {
  ACCIONES_INTERNACIONALES_TOP_N,
  BONOS,
  CEDEARS,
  CEDEARS_TOP_N,
  LETRAS,
  PANEL_GENERAL,
  PANEL_LIDER,
  PESOS_ES_CER,
  PESOS_EXCLUYE_FX,
  PESOS_SOBERANO_PALABRAS_CLAVE,
  SOBERANOS_DOLARES_PREFIJOS,
  SUFIJO_DOLAR_MEP,
} from "./config";
import { isMercadoAbierto, revalidateSecondsPara } from "./market-hours";
import type { AccionCompleta, CotizacionesPanelResponse, CotizacionPanelItem } from "./types";
import type { FilaCotizacion, ModoPrecio } from "@/lib/types";

/**
 * "auto" (paneles en vivo de la home): mientras el mercado está operando,
 * "Último" muestra el precio recién operado (`ultimoPrecio`); cerrado el
 * mercado, se prefiere mostrar explícitamente el precio de cierre
 * (`ultimoCierre`) en vez de asumir que son el mismo valor.
 * "cierre" (reporte en PDF): siempre `ultimoCierre`, sin importar si el
 * mercado está operando — así el reporte refleja el último cierre real.
 *
 * Recibe `mercadoAbierto` ya resuelto (una sola vez por request, en el
 * getter) en vez de llamar a `isMercadoAbierto()` por cada fila: esa
 * función es async (consulta feriados), así que resolverla una vez afuera
 * del `.map()` evita N pedidos redundantes por el mismo resultado.
 */
function aFila(item: CotizacionPanelItem, modo: ModoPrecio, mercadoAbierto: boolean): FilaCotizacion {
  const mostrarCierre = modo === "cierre" || !mercadoAbierto;

  // La variación que da IOL es siempre "vs. el cierre anterior a HOY": solo
  // es coherente con el precio de cierre mostrado cuando ese precio ES el
  // cierre de hoy (mercado ya cerrado). Si se fuerza "cierre" con el
  // mercado todavía operando, `ultimoCierre` es el cierre de AYER, y esa
  // variación no le corresponde — se omite en vez de mostrar un dato
  // engañoso.
  const variacionValida = modo !== "cierre" || !mercadoAbierto;

  return {
    simbolo: item.simbolo,
    descripcion: item.descripcion,
    ultimoPrecio: mostrarCierre ? item.ultimoCierre : item.ultimoPrecio,
    variacionPorcentual: variacionValida ? item.variacionPorcentual : null,
    volumen: item.volumen,
    cantidadOperaciones: item.cantidadOperaciones,
  };
}

export async function getPanelLider(modo: ModoPrecio = "auto"): Promise<FilaCotizacion[]> {
  const mercadoAbierto = await isMercadoAbierto();
  const { instrumento, panel, pais } = PANEL_LIDER;
  const { titulos } = await iolFetch<CotizacionesPanelResponse>(
    `/api/v2/Cotizaciones/${instrumento}/${panel}/${pais}`,
    { revalidateSeconds: revalidateSecondsPara(mercadoAbierto) },
  );
  return titulos.map((item) => aFila(item, modo, mercadoAbierto));
}

/** Mismo criterio de cierre-vs-en-vivo que `aFila`, pero sin descartar ningún campo — ver `AccionCompleta`. */
function aAccionCompleta(item: CotizacionPanelItem, modo: ModoPrecio, mercadoAbierto: boolean): AccionCompleta {
  const mostrarCierre = modo === "cierre" || !mercadoAbierto;
  const variacionValida = modo !== "cierre" || !mercadoAbierto;

  return {
    simbolo: item.simbolo,
    descripcion: item.descripcion,
    ultimoPrecio: mostrarCierre ? item.ultimoCierre : item.ultimoPrecio,
    variacionPorcentual: variacionValida ? item.variacionPorcentual : null,
    apertura: item.apertura,
    maximo: item.maximo,
    minimo: item.minimo,
    ultimoCierre: item.ultimoCierre,
    volumen: item.volumen,
    cantidadOperaciones: item.cantidadOperaciones,
    moneda: item.moneda,
    fecha: item.fecha,
    puntas: item.puntas,
  };
}

/** Para `/acciones-argentinas`: todos los campos que da IOL, no solo los que usan las tablas del resto del sitio. */
export async function getAccionesArgentinas(panel: "lider" | "general", modo: ModoPrecio = "auto"): Promise<AccionCompleta[]> {
  const mercadoAbierto = await isMercadoAbierto();
  const { instrumento, panel: nombrePanel, pais } = panel === "lider" ? PANEL_LIDER : PANEL_GENERAL;
  const { titulos } = await iolFetch<CotizacionesPanelResponse>(
    `/api/v2/Cotizaciones/${instrumento}/${encodeURIComponent(nombrePanel)}/${pais}`,
    { revalidateSeconds: revalidateSecondsPara(mercadoAbierto) },
  );
  return titulos
    .sort((a, b) => a.simbolo.localeCompare(b.simbolo))
    .map((item) => aAccionCompleta(item, modo, mercadoAbierto));
}

/**
 * Para `/acciones-internacionales`: todos los campos de `getAccionesArgentinas`,
 * pero sobre el panel de CEDEARs — "top20" son los más operados del día,
 * "general" son todos. Un solo fetch para los dos paneles (935 títulos,
 * ~670KB): pedirlo dos veces en paralelo —una por panel— duplicaba ese
 * pedido pesado sin necesidad, ya que ambos paneles salen del mismo panel
 * de IOL cortado distinto.
 */
export async function getAccionesInternacionales(modo: ModoPrecio = "auto"): Promise<{ top20: AccionCompleta[]; general: AccionCompleta[] }> {
  const mercadoAbierto = await isMercadoAbierto();
  const { instrumento, panel: nombrePanel, pais } = CEDEARS;
  const { titulos } = await iolFetch<CotizacionesPanelResponse>(
    `/api/v2/Cotizaciones/${instrumento}/${encodeURIComponent(nombrePanel)}/${pais}`,
    { revalidateSeconds: revalidateSecondsPara(mercadoAbierto) },
  );

  // Misma razón que `getCedearsPrincipales`: nos quedamos con la versión en pesos de cada CEDEAR.
  const enPesos = titulos.filter((titulo) => titulo.moneda === "AR$");
  const top20 = [...enPesos].sort((a, b) => b.cantidadOperaciones - a.cantidadOperaciones).slice(0, ACCIONES_INTERNACIONALES_TOP_N);

  const ordenar = (lista: typeof enPesos) => lista.sort((a, b) => a.simbolo.localeCompare(b.simbolo)).map((item) => aAccionCompleta(item, modo, mercadoAbierto));

  return { top20: ordenar(top20), general: ordenar(enPesos) };
}

export async function getBonosSoberanosDolaresMep(modo: ModoPrecio = "auto"): Promise<FilaCotizacion[]> {
  const mercadoAbierto = await isMercadoAbierto();
  const { instrumento, panel, pais } = BONOS;
  const { titulos } = await iolFetch<CotizacionesPanelResponse>(
    `/api/v2/Cotizaciones/${instrumento}/${panel}/${pais}`,
    { revalidateSeconds: revalidateSecondsPara(mercadoAbierto) },
  );

  return titulos
    .filter(
      (titulo) =>
        titulo.moneda === "US$" &&
        titulo.simbolo.endsWith(SUFIJO_DOLAR_MEP) &&
        SOBERANOS_DOLARES_PREFIJOS.some((prefijo) => titulo.simbolo.startsWith(prefijo)),
    )
    .sort((a, b) => a.simbolo.localeCompare(b.simbolo))
    .map((item) => aFila(item, modo, mercadoAbierto));
}

/**
 * Precio de un bono puntual por ticker (ej. "AL30D"), buscado dentro del
 * universo completo que trae el endpoint de bonos de IOL (soberanos y
 * obligaciones negociables juntos — ver el comentario de `BONOS` en
 * `config.ts`). `null` si IOL no tiene ese ticker cotizando (puede pasar con
 * algunas ONs poco líquidas). Usa "cierre" por defecto (no el precio en
 * vivo): así el precio sugerido se mantiene estable durante toda la rueda,
 * lo que le permite a esa consulta cachear por todo el día en vez de
 * recalcularse en cada visita (ver `getDatosCalculadoraTir` en
 * `lib/docta/calculadoraTir.ts`).
 */
export async function getPrecioBono(simbolo: string, modo: ModoPrecio = "cierre"): Promise<FilaCotizacion | null> {
  const mercadoAbierto = await isMercadoAbierto();
  const { instrumento, panel, pais } = BONOS;
  const { titulos } = await iolFetch<CotizacionesPanelResponse>(
    `/api/v2/Cotizaciones/${instrumento}/${panel}/${pais}`,
    { revalidateSeconds: revalidateSecondsPara(mercadoAbierto) },
  );

  const item = titulos.find((titulo) => titulo.simbolo === simbolo);
  return item ? aFila(item, modo, mercadoAbierto) : null;
}

export async function getLetras(modo: ModoPrecio = "auto"): Promise<FilaCotizacion[]> {
  const mercadoAbierto = await isMercadoAbierto();
  const { instrumento, panel, pais } = LETRAS;
  const { titulos } = await iolFetch<CotizacionesPanelResponse>(
    `/api/v2/Cotizaciones/${instrumento}/${panel}/${pais}`,
    { revalidateSeconds: revalidateSecondsPara(mercadoAbierto) },
  );

  return titulos
    .filter(
      (titulo) =>
        titulo.moneda === "AR$" &&
        PESOS_SOBERANO_PALABRAS_CLAVE.test(titulo.descripcion) &&
        !PESOS_EXCLUYE_FX.test(titulo.descripcion),
    )
    .sort((a, b) => a.simbolo.localeCompare(b.simbolo))
    .map((item) => aFila(item, modo, mercadoAbierto));
}

export async function getBonosCer(modo: ModoPrecio = "auto"): Promise<FilaCotizacion[]> {
  const mercadoAbierto = await isMercadoAbierto();
  const { instrumento, panel, pais } = BONOS;
  const { titulos } = await iolFetch<CotizacionesPanelResponse>(
    `/api/v2/Cotizaciones/${instrumento}/${panel}/${pais}`,
    { revalidateSeconds: revalidateSecondsPara(mercadoAbierto) },
  );

  return titulos
    .filter(
      (titulo) =>
        titulo.moneda === "AR$" &&
        PESOS_SOBERANO_PALABRAS_CLAVE.test(titulo.descripcion) &&
        PESOS_ES_CER.test(titulo.descripcion) &&
        !PESOS_EXCLUYE_FX.test(titulo.descripcion),
    )
    .sort((a, b) => a.simbolo.localeCompare(b.simbolo))
    .map((item) => aFila(item, modo, mercadoAbierto));
}

export async function getCedearsPrincipales(modo: ModoPrecio = "auto"): Promise<FilaCotizacion[]> {
  const mercadoAbierto = await isMercadoAbierto();
  const { instrumento, panel, pais } = CEDEARS;
  const { titulos } = await iolFetch<CotizacionesPanelResponse>(
    `/api/v2/Cotizaciones/${instrumento}/${panel}/${pais}`,
    { revalidateSeconds: revalidateSecondsPara(mercadoAbierto) },
  );

  return titulos
    .filter((titulo) => titulo.moneda === "AR$")
    .sort((a, b) => b.cantidadOperaciones - a.cantidadOperaciones)
    .slice(0, CEDEARS_TOP_N)
    .map((item) => aFila(item, modo, mercadoAbierto));
}
