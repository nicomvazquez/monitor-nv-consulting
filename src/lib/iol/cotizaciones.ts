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
import { getRevalidateSeconds, isMercadoAbierto } from "./market-hours";
import type { CotizacionesPanelResponse, CotizacionPanelItem, FilaCotizacion } from "./types";

/**
 * Mientras el mercado está operando, "Último" muestra el precio recién
 * operado (`ultimoPrecio`, que va cambiando). Cerrado el mercado, ese campo
 * queda fijo en el último precio de la rueda, pero se prefiere mostrar
 * explícitamente el precio de cierre (`ultimoCierre`) en vez de asumir que
 * son el mismo valor.
 */
function aFila(item: CotizacionPanelItem): FilaCotizacion {
  return {
    simbolo: item.simbolo,
    descripcion: item.descripcion,
    ultimoPrecio: isMercadoAbierto() ? item.ultimoPrecio : item.ultimoCierre,
    variacionPorcentual: item.variacionPorcentual,
  };
}

export async function getPanelLider(): Promise<FilaCotizacion[]> {
  const { instrumento, panel, pais } = PANEL_LIDER;
  const { titulos } = await iolFetch<CotizacionesPanelResponse>(
    `/api/v2/Cotizaciones/${instrumento}/${panel}/${pais}`,
    { revalidateSeconds: getRevalidateSeconds() },
  );
  return titulos.map(aFila);
}

export async function getBonosSoberanosDolaresMep(): Promise<FilaCotizacion[]> {
  const { instrumento, panel, pais } = BONOS;
  const { titulos } = await iolFetch<CotizacionesPanelResponse>(
    `/api/v2/Cotizaciones/${instrumento}/${panel}/${pais}`,
    { revalidateSeconds: getRevalidateSeconds() },
  );

  return titulos
    .filter(
      (titulo) =>
        titulo.moneda === "US$" &&
        titulo.simbolo.endsWith(SUFIJO_DOLAR_MEP) &&
        SOBERANOS_DOLARES_PREFIJOS.some((prefijo) => titulo.simbolo.startsWith(prefijo)),
    )
    .sort((a, b) => a.simbolo.localeCompare(b.simbolo))
    .map(aFila);
}

export async function getLetras(): Promise<FilaCotizacion[]> {
  const { instrumento, panel, pais } = LETRAS;
  const { titulos } = await iolFetch<CotizacionesPanelResponse>(
    `/api/v2/Cotizaciones/${instrumento}/${panel}/${pais}`,
    { revalidateSeconds: getRevalidateSeconds() },
  );

  return titulos
    .filter(
      (titulo) =>
        titulo.moneda === "AR$" &&
        PESOS_SOBERANO_PALABRAS_CLAVE.test(titulo.descripcion) &&
        !PESOS_EXCLUYE_FX.test(titulo.descripcion),
    )
    .sort((a, b) => a.simbolo.localeCompare(b.simbolo))
    .map(aFila);
}

export async function getBonosCer(): Promise<FilaCotizacion[]> {
  const { instrumento, panel, pais } = BONOS;
  const { titulos } = await iolFetch<CotizacionesPanelResponse>(
    `/api/v2/Cotizaciones/${instrumento}/${panel}/${pais}`,
    { revalidateSeconds: getRevalidateSeconds() },
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
    .map(aFila);
}

export async function getCedearsPrincipales(): Promise<FilaCotizacion[]> {
  const { instrumento, panel, pais } = CEDEARS;
  const { titulos } = await iolFetch<CotizacionesPanelResponse>(
    `/api/v2/Cotizaciones/${instrumento}/${panel}/${pais}`,
    { revalidateSeconds: getRevalidateSeconds() },
  );

  return titulos
    .filter((titulo) => titulo.moneda === "AR$")
    .sort((a, b) => b.cantidadOperaciones - a.cantidadOperaciones)
    .slice(0, CEDEARS_TOP_N)
    .map(aFila);
}
