/**
 * TIR/TEA/TNA/duration/convexidad de un bono a partir de su cronograma de
 * pagos crudo (de Docta) y un precio — fórmulas estándar de renta fija,
 * sin llamar a ningún endpoint. Por eso este módulo no importa nada de
 * `lib/docta` ni `lib/iol`: es matemática pura, se puede correr tanto en el
 * servidor como en el cliente (`CalculadoraTirSection` la corre en el
 * cliente, así que recalcular con un precio nuevo no cuesta ni un pedido de
 * red, mucho menos cuota de Docta).
 */

export interface FlujoBono {
  /** "YYYY-MM-DD". */
  fecha: string;
  capital: number;
  interes: number;
  flujo: number;
  /** Valor residual que QUEDA después de pagar `capital` ese día (no antes) — ver `DoctaCashflowEntry`. */
  valorResidualDespues: number;
}

export interface ResultadoCalculoTir {
  tir: number;
  tea: number;
  tem: number;
  tna: number;
  /** Macaulay, en años. */
  duration: number;
  durationModificada: number;
  /** En años². */
  convexidad: number;
  interesCorrido: number;
  precioLimpio: number;
  /** Valor residual vigente a la fecha de liquidación (antes del próximo pago). */
  valorResidual: number;
  diasAlVencimiento: number;
}

const DIAS_ANIO = 365;
const TIR_MIN = -0.99;
const TIR_MAX = 10;
const ITERACIONES_BISECCION = 100;
const TOLERANCIA_VAN = 1e-9;

function aFechaUTC(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

function diasEntre(desde: Date, hasta: Date): number {
  return (hasta.getTime() - desde.getTime()) / 86_400_000;
}

function valorPresente(flujos: { dias: number; flujo: number }[], tir: number): number {
  return flujos.reduce((suma, f) => suma + f.flujo / (1 + tir) ** (f.dias / DIAS_ANIO), 0);
}

/**
 * TIR efectiva anual (convención XIRR: descuento día a día desde la fecha de
 * liquidación, no por período de cupón fijo) tal que el valor presente de
 * los flujos futuros iguale el precio sucio pagado. Bisección en vez de
 * Newton-Raphson: el precio de un bono es monótonamente decreciente en la
 * tasa (todo flujo es positivo), así que converge siempre sin depender de
 * una buena semilla inicial ni de calcular una derivada.
 */
function resolverTir(flujos: { dias: number; flujo: number }[], precioSucio: number): number {
  let lo = TIR_MIN;
  let hi = TIR_MAX;

  for (let i = 0; i < ITERACIONES_BISECCION; i++) {
    const medio = (lo + hi) / 2;
    const diferencia = valorPresente(flujos, medio) - precioSucio;
    if (Math.abs(diferencia) < TOLERANCIA_VAN) return medio;
    // El VAN cae a medida que sube la tasa: si todavía es positivo a `medio`, la tasa real es mayor.
    if (diferencia > 0) lo = medio;
    else hi = medio;
  }

  return (lo + hi) / 2;
}

/**
 * `null` si a `fechaLiquidacionIso` ya no queda ningún pago futuro en
 * `cashflow` (bono vencido a esa fecha).
 */
export function calcularTirDesdeCashflow(
  cashflow: FlujoBono[],
  fechaLiquidacionIso: string,
  precioSucio: number,
): ResultadoCalculoTir | null {
  const fechaLiquidacion = aFechaUTC(fechaLiquidacionIso);

  const pasados = cashflow
    .filter((f) => aFechaUTC(f.fecha).getTime() <= fechaLiquidacion.getTime())
    .sort((a, b) => aFechaUTC(b.fecha).getTime() - aFechaUTC(a.fecha).getTime());
  const futuros = cashflow
    .filter((f) => aFechaUTC(f.fecha).getTime() > fechaLiquidacion.getTime())
    .sort((a, b) => aFechaUTC(a.fecha).getTime() - aFechaUTC(b.fecha).getTime());

  if (futuros.length === 0) return null;

  const flujosDescuento = futuros.map((f) => ({ dias: diasEntre(fechaLiquidacion, aFechaUTC(f.fecha)), flujo: f.flujo }));
  const tir = resolverTir(flujosDescuento, precioSucio);
  const pvs = flujosDescuento.map((f) => ({ ...f, pv: f.flujo / (1 + tir) ** (f.dias / DIAS_ANIO) }));

  const duration = pvs.reduce((suma, f) => suma + (f.dias / DIAS_ANIO) * f.pv, 0) / precioSucio;
  const durationModificada = duration / (1 + tir);
  const convexidad =
    pvs.reduce((suma, f) => {
      const t = f.dias / DIAS_ANIO;
      return suma + t * (t + 1) * f.pv;
    }, 0) /
    (precioSucio * (1 + tir) ** 2);

  const proximoFlujo = futuros[0];
  const ultimoCupon = pasados[0] ?? null;
  const valorResidual = proximoFlujo.valorResidualDespues + proximoFlujo.capital;

  let interesCorrido = 0;
  if (ultimoCupon) {
    const fechaUltimoCupon = aFechaUTC(ultimoCupon.fecha);
    const diasPeriodo = diasEntre(fechaUltimoCupon, aFechaUTC(proximoFlujo.fecha));
    const diasCorridos = diasEntre(fechaUltimoCupon, fechaLiquidacion);
    if (diasPeriodo > 0) interesCorrido = proximoFlujo.interes * (diasCorridos / diasPeriodo);
  }

  return {
    tir,
    tea: tir,
    tem: (1 + tir) ** (1 / 12) - 1,
    tna: ((1 + tir) ** (1 / 12) - 1) * 12,
    duration,
    durationModificada,
    convexidad,
    interesCorrido,
    precioLimpio: precioSucio - interesCorrido,
    valorResidual,
    diasAlVencimiento: Math.round(diasEntre(fechaLiquidacion, aFechaUTC(futuros[futuros.length - 1].fecha))),
  };
}

export interface ResumenInversion {
  montoInvertido: number;
  totalACobrar: number;
  gananciaNeta: number;
  /** Retorno total del período (no anualizado) — distinto de la TIR, que sí lo está. */
  gananciaPorcentual: number;
}

/**
 * Precio y cashflow vienen cotizados "por cada 100 de valor nominal" (misma
 * convención en todo el mercado argentino de bonos) — esto solo escala esos
 * montos a `nominales` reales. No depende de la TIR ni de la fecha de
 * liquidación, por eso recibe los flujos futuros ya filtrados (los mismos
 * que arma `calcularTirDesdeCashflow` internamente) en vez de recalcularlos.
 */
export function calcularInversion(flujosFuturos: FlujoBono[], nominales: number, precioSucio: number): ResumenInversion {
  const factor = nominales / 100;
  const montoInvertido = precioSucio * factor;
  const totalACobrar = flujosFuturos.reduce((suma, f) => suma + f.flujo, 0) * factor;
  const gananciaNeta = totalACobrar - montoInvertido;

  return {
    montoInvertido,
    totalACobrar,
    gananciaNeta,
    gananciaPorcentual: montoInvertido > 0 ? (gananciaNeta / montoInvertido) * 100 : 0,
  };
}
