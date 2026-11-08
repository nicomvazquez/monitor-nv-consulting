import type { Seccion } from "@/components/acciones/SeccionesFundamentals";
import { formatPercent, formatPrice, formatTasa, formatVolumen } from "@/lib/format";
import type { PerfilCripto } from "@/lib/coingecko/perfil";

function monto(valor: number): string {
  return `US$ ${formatVolumen(valor)}`;
}

/**
 * `timeZone: "UTC"` a propósito: `fechaGenesis` viene sin hora ("2009-01-03"),
 * que JS interpreta como medianoche UTC — sin forzar la zona acá, mostrarla
 * en hora Argentina (UTC-3) la corre un día para atrás (ej. Bitcoin pasaba a
 * "02/01/2009"). `fechaMaximoHistorico`/`fechaMinimoHistorico` sí traen hora,
 * así que no les cambia nada mostrarlas también en UTC.
 */
function fecha(valorIso: string | null): string {
  if (!valorIso) return "-";
  const d = new Date(valorIso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
}

/** Sin signo forzado a propósito: es una encuesta de sentimiento (0-100%), no una variación. */
function tasaONula(valor: number | null): string {
  return valor !== null ? formatTasa(valor) : "-";
}

/** Mismo formato (título + campos etiqueta/valor) que `construirSecciones` de Yahoo Finance, pero con los datos de mercado de CoinGecko. */
export function construirSeccionesCripto(perfil: PerfilCripto): Seccion[] {
  return [
    {
      titulo: "Mercado",
      campos: [
        { etiqueta: "Precio", valor: `US$ ${formatPrice(perfil.precioActual)}` },
        { etiqueta: "Ranking por market cap", valor: perfil.rankingMarketCap ? `#${perfil.rankingMarketCap}` : "-" },
        { etiqueta: "Market cap", valor: monto(perfil.marketCap) },
        { etiqueta: "Cambio de market cap (24hs)", valor: formatPercent(perfil.variacionMarketCap24h) },
        { etiqueta: "Valuación totalmente diluida", valor: monto(perfil.valuacionDiluida) },
        { etiqueta: "Volumen (24hs)", valor: monto(perfil.volumen24h) },
        { etiqueta: "Máximo (24hs)", valor: `US$ ${formatPrice(perfil.maximo24h)}` },
        { etiqueta: "Mínimo (24hs)", valor: `US$ ${formatPrice(perfil.minimo24h)}` },
      ],
    },
    {
      titulo: "Variación",
      campos: [
        { etiqueta: "24 horas", valor: formatPercent(perfil.variacion24h) },
        { etiqueta: "7 días", valor: formatPercent(perfil.variacion7d) },
        { etiqueta: "14 días", valor: formatPercent(perfil.variacion14d) },
        { etiqueta: "30 días", valor: formatPercent(perfil.variacion30d) },
        { etiqueta: "60 días", valor: formatPercent(perfil.variacion60d) },
        { etiqueta: "200 días", valor: formatPercent(perfil.variacion200d) },
        { etiqueta: "1 año", valor: formatPercent(perfil.variacion1y) },
      ],
    },
    {
      titulo: "Suministro",
      campos: [
        { etiqueta: "Circulante", valor: formatVolumen(perfil.supplyCirculante) },
        { etiqueta: "Total", valor: perfil.supplyTotal !== null ? formatVolumen(perfil.supplyTotal) : "-" },
        { etiqueta: "Máximo", valor: perfil.supplyMaximo !== null ? formatVolumen(perfil.supplyMaximo) : "Sin límite" },
      ],
    },
    {
      titulo: "Máximos y mínimos históricos",
      campos: [
        { etiqueta: "Máximo histórico (ATH)", valor: `US$ ${formatPrice(perfil.maximoHistorico)}` },
        { etiqueta: "Fecha del ATH", valor: fecha(perfil.fechaMaximoHistorico) },
        { etiqueta: "Variación desde el ATH", valor: formatPercent(perfil.variacionDesdeMaximo) },
        { etiqueta: "Mínimo histórico (ATL)", valor: `US$ ${formatPrice(perfil.minimoHistorico)}` },
        { etiqueta: "Fecha del ATL", valor: fecha(perfil.fechaMinimoHistorico) },
      ],
    },
    {
      titulo: "Comunidad",
      campos: [
        { etiqueta: "Sentimiento positivo", valor: tasaONula(perfil.sentimientoPositivo) },
        { etiqueta: "En watchlists de CoinGecko", valor: perfil.usuariosEnWatchlist !== null ? formatVolumen(perfil.usuariosEnWatchlist) : "-" },
      ],
    },
    {
      titulo: "Info del proyecto",
      campos: [
        { etiqueta: "Fecha de lanzamiento", valor: fecha(perfil.fechaGenesis) },
        { etiqueta: "Algoritmo", valor: perfil.algoritmo ?? "-" },
        { etiqueta: "Categorías", valor: perfil.categorias.length > 0 ? perfil.categorias.slice(0, 3).join(", ") : "-" },
      ],
    },
  ];
}
