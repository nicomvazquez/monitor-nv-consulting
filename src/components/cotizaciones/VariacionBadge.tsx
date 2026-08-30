import { formatPercent } from "@/lib/format";

export function VariacionBadge({ variacion }: { variacion: number | null }) {
  if (variacion === null) {
    return <span className="text-gray-400">-</span>;
  }

  const isPositive = variacion > 0;
  const isNegative = variacion < 0;

  return (
    <span
      className={
        "inline-flex rounded-full px-2 py-0.5 text-sm font-medium tabular-nums " +
        (isPositive
          ? "bg-emerald-100 text-emerald-700"
          : isNegative
            ? "bg-red-100 text-red-700"
            : "bg-gray-100 text-gray-600")
      }
    >
      {formatPercent(variacion)}
    </span>
  );
}
