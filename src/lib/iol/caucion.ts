import { iolFetch } from "./client";
import {
  CAUCIONES,
  CAUCION_FALLBACK_RADIO_DIAS,
  CAUCION_PLAZOS_DIAS,
  CAUCION_UMBRAL_TASA_PESOS,
} from "./config";
import { isMercadoAbierto, revalidateSecondsPara } from "./market-hours";
import type { CaucionesResponse, CaucionTitulo } from "./types";
import type { FilaCotizacion } from "@/lib/types";

export interface TasaCaucionMoneda {
  /** Plazo del que realmente vino la tasa: null si no hubo ninguno dentro del radio de tolerancia. */
  plazoDias: number | null;
  tasa: number | null;
}

export interface FilaCaucion {
  /** Plazo que se le pidió mostrar (1, 7 o 14). */
  plazoSolicitado: number;
  pesos: TasaCaucionMoneda;
  dolares: TasaCaucionMoneda;
}

async function getCauciones(): Promise<CaucionTitulo[]> {
  const mercadoAbierto = await isMercadoAbierto();
  const { instrumento, panel, pais } = CAUCIONES;
  const { titulos } = await iolFetch<CaucionesResponse>(
    `/api/v2/Cotizaciones/${instrumento}/${panel}/${pais}`,
    { revalidateSeconds: revalidateSecondsPara(mercadoAbierto) },
  );
  return titulos;
}

function esPesos(titulo: CaucionTitulo): boolean {
  return titulo.tasaPromedio > CAUCION_UMBRAL_TASA_PESOS;
}

/** El plazo operado más cercano al pedido, dentro del radio de tolerancia. */
function masCercano(titulos: CaucionTitulo[], plazoSolicitado: number): CaucionTitulo | null {
  let mejor: CaucionTitulo | null = null;
  let mejorDistancia = Infinity;

  for (const titulo of titulos) {
    const distancia = Math.abs(titulo.plazo - plazoSolicitado);
    if (distancia <= CAUCION_FALLBACK_RADIO_DIAS && distancia < mejorDistancia) {
      mejor = titulo;
      mejorDistancia = distancia;
    }
  }

  return mejor;
}

function tasaParaPlazo(titulos: CaucionTitulo[], plazoSolicitado: number): TasaCaucionMoneda {
  const titulo = masCercano(titulos, plazoSolicitado);
  return { plazoDias: titulo?.plazo ?? null, tasa: titulo?.tasaPromedio ?? null };
}

/** Una fila por plazo (1, 7, 14 — en ese orden), con la tasa en pesos y en dólares. */
export async function getTasasCaucion(): Promise<FilaCaucion[]> {
  let titulos: CaucionTitulo[] = [];
  try {
    titulos = await getCauciones();
  } catch {
    // Cuadrito best-effort: si falla, se muestran "-" en vez de romper la página.
  }

  const pesos = titulos.filter(esPesos);
  const dolares = titulos.filter((titulo) => !esPesos(titulo));

  return CAUCION_PLAZOS_DIAS.map((plazoSolicitado) => ({
    plazoSolicitado,
    pesos: tasaParaPlazo(pesos, plazoSolicitado),
    dolares: tasaParaPlazo(dolares, plazoSolicitado),
  }));
}

function filaTabla(prefijo: string, plazoSolicitado: number, valor: TasaCaucionMoneda): FilaCotizacion {
  const etiquetaPlazo = `${plazoSolicitado} día${plazoSolicitado === 1 ? "" : "s"}`;
  const aproximado = valor.plazoDias !== null && valor.plazoDias !== plazoSolicitado;

  return {
    simbolo: `${prefijo} ${plazoSolicitado}D`,
    descripcion: aproximado
      ? `Caución a ${etiquetaPlazo} (más cercana operada: ${valor.plazoDias} días)`
      : `Caución a ${etiquetaPlazo}`,
    ultimoPrecio: valor.tasa,
    variacionPorcentual: null,
  };
}

/**
 * Las mismas tasas que `getTasasCaucion`, aplanadas a filas de tabla
 * (Símbolo/Último/Variación) para reusar `CotizacionesTable`. Ordenadas por
 * plazo (1, 7, 14), alternando pesos/dólares dentro de cada plazo.
 */
export async function getCaucionesTabla(): Promise<FilaCotizacion[]> {
  const filas = await getTasasCaucion();
  return filas.flatMap(({ plazoSolicitado, pesos, dolares }) => [
    filaTabla("Pesos", plazoSolicitado, pesos),
    filaTabla("Dólares", plazoSolicitado, dolares),
  ]);
}
