import { Minus, TrendDown, TrendUp } from "@phosphor-icons/react/dist/ssr";
import { formatPercent } from "@/lib/format";

/**
 * Antes era texto con apenas un 10% de fondo — casi invisible contra el
 * navy oscuro, leía como "texto de color" más que como un chip. Ahora el
 * fondo tiene opacidad real + borde a juego y una flecha de tendencia: la
 * forma del chip comunica subida/baja incluso antes de leer el número, y
 * la flecha es una segunda codificación además del color (igual criterio
 * que en el mapa de calor).
 */
export function VariacionBadge({ variacion }: { variacion: number | null }) {
  if (variacion === null) {
    return <span className="text-muted-foreground">-</span>;
  }

  const isPositive = variacion > 0;
  const isNegative = variacion < 0;
  const Icono = isPositive ? TrendUp : isNegative ? TrendDown : Minus;

  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-xs font-medium tabular-nums " +
        (isPositive
          ? "border-emerald-400/25 bg-emerald-400/15 text-emerald-400"
          : isNegative
            ? "border-red-400/25 bg-red-400/15 text-red-400"
            : "border-border bg-white/5 text-muted-foreground")
      }
    >
      <Icono size={11} weight="bold" aria-hidden="true" />
      {formatPercent(variacion)}
    </span>
  );
}
