import type { FilaCotizacion } from "@/lib/types";

/**
 * El Panel Líder son 20 símbolos fijos (ver `PANEL_LIDER` en `lib/iol/config.ts`)
 * y IOL no informa el sector de cada uno, así que va a mano acá. Separa
 * "Servicios públicos" de "Petróleo y gas" dentro de energía porque, si no,
 * un solo sector concentraría casi la mitad del panel — así queda más útil
 * para ver qué parte del mercado empujó la rueda.
 */
export const SECTOR_POR_SIMBOLO: Record<string, string> = {
  YPFD: "Petróleo y gas",
  PAMP: "Petróleo y gas",

  CEPU: "Servicios públicos",
  TRAN: "Servicios públicos",
  EDN: "Servicios públicos",
  TGNO4: "Servicios públicos",
  TGSU2: "Servicios públicos",
  METR: "Servicios públicos",
  ECOG: "Servicios públicos",

  BBAR: "Bancos",
  BMA: "Bancos",
  GGAL: "Bancos",
  SUPV: "Bancos",

  IRSA: "Real estate y agro",
  CRES: "Real estate y agro",

  ALUA: "Industria y materiales",
  TXAR: "Industria y materiales",

  TECO2: "Telecomunicaciones",
  BYMA: "Mercado de capitales",
  COME: "Otros",
};

/** Para un símbolo fuera del Panel Líder (no debería pasar, pero por las dudas) en vez de romper la tabla. */
export const SECTOR_DESCONOCIDO = "Otros";

export function sectorDe(simbolo: string): string {
  return SECTOR_POR_SIMBOLO[simbolo] ?? SECTOR_DESCONOCIDO;
}

export interface FilaSector {
  sector: string;
  /** Promedio de variación ponderado por cantidad de operaciones — un banco muy operado pesa más que uno casi sin volumen, mismo criterio que el tamaño de los tiles del mapa de calor. */
  variacionPonderada: number | null;
  cantidadAcciones: number;
  mejor: FilaCotizacion | null;
  peor: FilaCotizacion | null;
  filas: FilaCotizacion[];
}

/** Agrupa el Panel Líder por sector y ordena de mejor a peor variación ponderada. */
export function agruparPorSector(datos: FilaCotizacion[]): FilaSector[] {
  const porSector = new Map<string, FilaCotizacion[]>();
  for (const fila of datos) {
    const sector = sectorDe(fila.simbolo);
    const grupo = porSector.get(sector);
    if (grupo) grupo.push(fila);
    else porSector.set(sector, [fila]);
  }

  return [...porSector.entries()]
    .map(([sector, filas]): FilaSector => {
      const conVariacion = filas.filter((f): f is FilaCotizacion & { variacionPorcentual: number } => f.variacionPorcentual !== null);

      const pesoTotal = conVariacion.reduce((suma, f) => suma + Math.max(f.cantidadOperaciones ?? 0, 1), 0);
      const variacionPonderada =
        conVariacion.length === 0
          ? null
          : conVariacion.reduce((suma, f) => suma + f.variacionPorcentual * Math.max(f.cantidadOperaciones ?? 0, 1), 0) / pesoTotal;

      const mejor = conVariacion.reduce<FilaCotizacion | null>(
        (actual, f) => (!actual || f.variacionPorcentual! > actual.variacionPorcentual!) ? f : actual,
        null,
      );
      const peor = conVariacion.reduce<FilaCotizacion | null>(
        (actual, f) => (!actual || f.variacionPorcentual! < actual.variacionPorcentual!) ? f : actual,
        null,
      );

      return { sector, variacionPonderada, cantidadAcciones: filas.length, mejor, peor, filas };
    })
    .sort((a, b) => (b.variacionPonderada ?? -Infinity) - (a.variacionPonderada ?? -Infinity));
}
