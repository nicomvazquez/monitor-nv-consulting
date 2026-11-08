import { formatPrice, formatVolumen } from "@/lib/format";
import type { Fundamentals } from "@/lib/yahoofinance/fundamentals";

function monto(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "-";
  return `$${formatVolumen(valor)}`;
}

function numero(valor: number | null | undefined, decimales = 2): string {
  if (valor === null || valor === undefined) return "-";
  return valor.toLocaleString("es-AR", { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
}

function porcentaje(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "-";
  return `${(valor * 100).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

function fecha(valor: Date | string | null | undefined): string {
  if (!valor) return "-";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export interface Campo {
  etiqueta: string;
  valor: string;
}

export interface Seccion {
  titulo: string;
  campos: Campo[];
}

export function construirSecciones(datos: Fundamentals): Seccion[] {
  const sd = datos.summaryDetail;
  const dks = datos.defaultKeyStatistics;
  const fd = datos.financialData;
  const rt = datos.recommendationTrend?.trend?.[0];

  return [
    {
      titulo: "Valuación",
      campos: [
        { etiqueta: "Market cap", valor: monto(sd?.marketCap) },
        { etiqueta: "P/E (trailing)", valor: numero(sd?.trailingPE) },
        { etiqueta: "P/E (forward)", valor: numero(sd?.forwardPE) },
        { etiqueta: "Precio / valor libro", valor: numero(dks?.priceToBook) },
        { etiqueta: "PEG ratio", valor: numero(dks?.pegRatio) },
        { etiqueta: "Beta", valor: numero(sd?.beta) },
        { etiqueta: "Enterprise value", valor: monto(dks?.enterpriseValue) },
      ],
    },
    {
      titulo: "Precio y volumen",
      campos: [
        { etiqueta: "Máximo 52 sem.", valor: sd?.fiftyTwoWeekHigh !== undefined ? formatPrice(sd.fiftyTwoWeekHigh) : "-" },
        { etiqueta: "Mínimo 52 sem.", valor: sd?.fiftyTwoWeekLow ? formatPrice(sd.fiftyTwoWeekLow) : "-" },
        { etiqueta: "Volumen promedio", valor: sd?.averageVolume ? formatVolumen(sd.averageVolume) : "-" },
        { etiqueta: "Acciones en circulación", valor: dks?.sharesOutstanding ? formatVolumen(dks.sharesOutstanding) : "-" },
        { etiqueta: "Free float", valor: dks?.floatShares ? formatVolumen(dks.floatShares) : "-" },
      ],
    },
    {
      titulo: "Rentabilidad y márgenes",
      campos: [
        { etiqueta: "ROE", valor: porcentaje(fd?.returnOnEquity) },
        { etiqueta: "ROA", valor: porcentaje(fd?.returnOnAssets) },
        { etiqueta: "Margen bruto", valor: porcentaje(fd?.grossMargins) },
        { etiqueta: "Margen operativo", valor: porcentaje(fd?.operatingMargins) },
        { etiqueta: "Margen neto", valor: porcentaje(fd?.profitMargins) },
        { etiqueta: "Margen EBITDA", valor: porcentaje(fd?.ebitdaMargins) },
      ],
    },
    {
      titulo: "Resultados",
      campos: [
        { etiqueta: "Ingresos (TTM)", valor: monto(fd?.totalRevenue) },
        { etiqueta: "Crecimiento de ingresos", valor: porcentaje(fd?.revenueGrowth) },
        { etiqueta: "EBITDA", valor: monto(fd?.ebitda) },
        { etiqueta: "Ganancia por acción (EPS)", valor: dks?.trailingEps !== undefined ? formatPrice(dks.trailingEps) : "-" },
        { etiqueta: "EPS proyectada", valor: dks?.forwardEps !== undefined ? formatPrice(dks.forwardEps) : "-" },
        { etiqueta: "Crecimiento de ganancias", valor: porcentaje(fd?.earningsGrowth) },
      ],
    },
    {
      titulo: "Balance y caja",
      campos: [
        { etiqueta: "Caja total", valor: monto(fd?.totalCash) },
        { etiqueta: "Deuda total", valor: monto(fd?.totalDebt) },
        { etiqueta: "Deuda / patrimonio", valor: numero(fd?.debtToEquity) },
        { etiqueta: "Ratio corriente", valor: numero(fd?.currentRatio) },
        { etiqueta: "Flujo de caja libre", valor: monto(fd?.freeCashflow) },
        { etiqueta: "Flujo de caja operativo", valor: monto(fd?.operatingCashflow) },
      ],
    },
    {
      titulo: "Dividendos",
      campos: [
        { etiqueta: "Dividendo por acción", valor: sd?.dividendRate !== undefined ? formatPrice(sd.dividendRate) : "-" },
        { etiqueta: "Dividend yield", valor: porcentaje(sd?.dividendYield) },
        { etiqueta: "Payout ratio", valor: porcentaje(sd?.payoutRatio) },
        { etiqueta: "Próxima fecha ex-dividendo", valor: fecha(sd?.exDividendDate) },
      ],
    },
    {
      titulo: "Tenencia",
      campos: [
        { etiqueta: "% en manos de insiders", valor: porcentaje(dks?.heldPercentInsiders) },
        { etiqueta: "% en manos institucionales", valor: porcentaje(dks?.heldPercentInstitutions) },
      ],
    },
    {
      titulo: "Analistas",
      campos: [
        { etiqueta: "Recomendación", valor: fd?.recommendationKey ?? "-" },
        { etiqueta: "Cantidad de analistas", valor: fd?.numberOfAnalystOpinions ? String(fd.numberOfAnalystOpinions) : "-" },
        { etiqueta: "Precio objetivo (promedio)", valor: fd?.targetMeanPrice !== undefined ? formatPrice(fd.targetMeanPrice) : "-" },
        { etiqueta: "Precio objetivo (máximo)", valor: fd?.targetHighPrice !== undefined ? formatPrice(fd.targetHighPrice) : "-" },
        { etiqueta: "Precio objetivo (mínimo)", valor: fd?.targetLowPrice !== undefined ? formatPrice(fd.targetLowPrice) : "-" },
        ...(rt
          ? [
              { etiqueta: "Compra fuerte / compra", valor: `${rt.strongBuy ?? 0} / ${rt.buy ?? 0}` },
              { etiqueta: "Mantener", valor: String(rt.hold ?? 0) },
              { etiqueta: "Venta / venta fuerte", valor: `${rt.sell ?? 0} / ${rt.strongSell ?? 0}` },
            ]
          : []),
      ],
    },
  ];
}

/** Sin título propio: vive adentro de un `Modulo`, que ya muestra el título de la sección en su header. */
export function SeccionFundamentals({ seccion }: { seccion: Seccion }) {
  return (
    <dl className="flex flex-col gap-1">
      {seccion.campos.map((campo) => (
        <div key={campo.etiqueta} className="flex items-baseline justify-between gap-3 border-b border-border/30 py-1 last:border-b-0">
          <dt className="text-xs text-muted-foreground">{campo.etiqueta}</dt>
          <dd className="font-mono text-sm tabular-nums text-foreground">{campo.valor}</dd>
        </div>
      ))}
    </dl>
  );
}
