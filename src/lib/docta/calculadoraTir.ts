import { getCashflowBono } from "./cashflow";
import { getBondInstruments } from "./instrumentos";
import type { FlujoBono } from "@/lib/bonos/calculoTir";
import { getPrecioBono } from "@/lib/iol/cotizaciones";
import { proximaFechaLiquidacion } from "@/lib/iol/market-hours";

export interface BonoSeleccionable {
  ticker: string;
  nombre: string;
  subAssetClass: string;
}

/** Universo completo para el selector (soberanos + ONs) — mismo fetch cacheado que usa `getBondInstruments` en todo el resto del módulo de bonos, sin costo extra de cuota. */
export async function getUniversoBonosCalculadora(): Promise<BonoSeleccionable[]> {
  const instrumentos = await getBondInstruments();
  return instrumentos
    .filter((instrumento) => instrumento.asset_class === "BOND")
    .map((instrumento) => ({
      ticker: instrumento.ticker,
      nombre: instrumento.name ?? instrumento.ticker,
      subAssetClass: instrumento.sub_asset_class,
    }))
    .sort((a, b) => a.ticker.localeCompare(b.ticker));
}

export interface DatosCalculadoraTir {
  ticker: string;
  cashflow: FlujoBono[];
  /** Precio de cierre de IOL, solo como valor inicial sugerido del formulario — el usuario lo puede pisar con cualquier precio. `null` si IOL no tiene este ticker cotizando. */
  precioMercadoSugerido: number | null;
  /** "YYYY-MM-DD": liquidación 24hs desde hoy, contra la que se descuenta el cashflow. */
  fechaLiquidacion: string;
}

/**
 * Trae, una sola vez por bono por día (cacheado — ver `getCashflowBono`), el
 * cronograma de pagos completo. El cálculo de TIR/duration para el precio
 * que tipee el usuario se hace después en el cliente con
 * `calcularTirDesdeCashflow`, no acá: por eso esta función no recibe ningún
 * precio como parámetro.
 */
export async function getDatosCalculadoraTir(ticker: string): Promise<{ datos: DatosCalculadoraTir | null; error: string | null }> {
  try {
    const [cashflowRaw, precio, fechaLiquidacion] = await Promise.all([
      getCashflowBono(ticker),
      getPrecioBono(ticker).catch(() => null),
      proximaFechaLiquidacion(),
    ]);

    if (cashflowRaw.length === 0) {
      return { datos: null, error: "Docta no tiene el cronograma de pagos de este bono." };
    }

    const cashflow: FlujoBono[] = cashflowRaw.map((entrada) => ({
      fecha: entrada.payment_date,
      capital: entrada.capital,
      interes: entrada.interest_amount,
      flujo: entrada.cash_flow,
      valorResidualDespues: entrada.residual_value,
    }));

    return {
      datos: { ticker, cashflow, precioMercadoSugerido: precio?.ultimoPrecio ?? null, fechaLiquidacion },
      error: null,
    };
  } catch (cause) {
    console.error(`[calculadora-tir] ${ticker}`, cause);
    return { datos: null, error: "No se pudo cargar el cronograma de pagos de este bono. Probá de nuevo más tarde." };
  }
}
