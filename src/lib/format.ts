const numberFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "always",
});

export function formatPrice(value: number): string {
  return numberFormatter.format(value);
}

export function formatPercent(value: number): string {
  return `${percentFormatter.format(value)}%`;
}

/** Para valores porcentuales sin signo forzado (ej. tasas), a diferencia de `formatPercent`. */
export function formatTasa(value: number): string {
  return `${numberFormatter.format(value)}%`;
}

const volumenAbreviadoFormatter = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 });

/** Volumen abreviado (ej. "48,3M"): el número crudo tiene demasiados dígitos para una columna angosta. */
export function formatVolumen(value: number): string {
  if (value >= 1_000_000_000) return `${volumenAbreviadoFormatter.format(value / 1_000_000_000)}B`;
  if (value >= 1_000_000) return `${volumenAbreviadoFormatter.format(value / 1_000_000)}M`;
  if (value >= 1_000) return `${volumenAbreviadoFormatter.format(value / 1_000)}K`;
  return volumenAbreviadoFormatter.format(value);
}
