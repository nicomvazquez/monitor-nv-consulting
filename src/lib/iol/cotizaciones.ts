import { iolFetch } from "./client";
import {
  BONOS,
  CEDEARS,
  CEDEARS_TOP_N,
  LETRAS,
  PANEL_LIDER,
  PESOS_ES_CER,
  PESOS_EXCLUYE_FX,
  PESOS_SOBERANO_PALABRAS_CLAVE,
  SOBERANOS_DOLARES_PREFIJOS,
  SUFIJO_DOLAR_MEP,
} from "./config";
import { isMercadoAbierto, revalidateSecondsPara } from "./market-hours";
import type { CotizacionesPanelResponse, CotizacionPanelItem } from "./types";
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
