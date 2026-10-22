import { COMMODITIES } from "./config";
import { getCotizacionesYahoo } from "./cotizacion";
import type { FilaCotizacion, ModoPrecio } from "@/lib/types";

export async function getCommodities(modo: ModoPrecio = "auto"): Promise<FilaCotizacion[]> {
  const filas = await getCotizacionesYahoo(COMMODITIES, "commodity", modo);
  // Para futuros, el nombre de Yahoo (ej. "Chicago SRW Wheat Futures,Dec-2026", a veces ya
  // truncado por Yahoo mismo) no aporta nada que `simbolo` no diga mejor ("Trigo") — se
  // vacía en vez de mostrar ese texto en la columna "Descripción" del reporte en PDF.
  return filas.map((fila) => ({ ...fila, descripcion: "" }));
}
