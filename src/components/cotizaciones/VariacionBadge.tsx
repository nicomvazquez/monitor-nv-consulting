import { formatPercent } from "@/lib/format";

export function VariacionBadge({ variacion }: { variacion: number | null }) {
  if (variacion === null) {
    return <span className="text-muted-foreground">-</span>;
  }

  const isPositive = variacion > 0;
  const isNegative = variacion < 0;

  return (
    <span
      className={
        "inline-flex rounded-full px-2 py-0.5 font-mono text-xs font-medium tabular-nums " +
        (isPositive
          ? "bg-emerald-400/10 text-emerald-400"
          : isNegative
            ? "bg-red-400/10 text-red-400"
            : "bg-white/5 text-muted-foreground")
      }
    >
      {formatPercent(variacion)}
    </span>
  );
}
