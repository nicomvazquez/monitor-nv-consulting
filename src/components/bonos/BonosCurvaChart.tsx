import type { BonoFila } from "@/lib/googlesheets/types";
import { formatPrice } from "@/lib/format";
import { ajustarCurva, desvioEstandar, evaluarCurva, media, r2, type Punto } from "@/lib/regresion";

interface PuntoBono extends Punto {
  ticker: string;
}

const ANCHO = 640;
const ALTO = 340;
const PADDING_IZQ = 48;
const PADDING_DER = 24;
const PADDING_ARRIBA = 24;
const PADDING_ABAJO = 40;
const CANTIDAD_GRIDLINES = 4;
const MUESTRAS_CURVA = 48;

function escalar(valor: number, min: number, max: number, destinoMin: number, destinoMax: number): number {
  if (max === min) return (destinoMin + destinoMax) / 2;
  return destinoMin + ((valor - min) / (max - min)) * (destinoMax - destinoMin);
}

/**
 * Curva de rendimientos de una sección de la hoja de bonos (`seccion`, ej.
 * "ley local"): marca cada bono (TIR vs. duration) y traza la curva de
 * regresión ajustada por mínimos cuadrados (`lib/regresion.ts`) en vez de
 * solo unir los puntos — así se puede leer qué bonos rinden por encima o por
 * debajo de lo que "debería" rendir un bono con esa duration (relativamente
 * baratos/caros), que es la lectura habitual de este tipo de gráfico. SVG a
 * mano, sin librería de gráficos: son un puñado de puntos.
 */
export function BonosCurvaChart({ filas, seccion }: { filas: BonoFila[]; seccion: string }) {
  const puntos: PuntoBono[] = filas
    .filter(
      (fila) => fila.seccion.toLowerCase() === seccion.toLowerCase() && fila.duration !== null && fila.tir !== null,
    )
    .map((fila) => ({ ticker: fila.ticker, x: fila.duration as number, y: fila.tir as number }))
    .sort((a, b) => a.x - b.x);

  if (puntos.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border/60 p-8">
        <p className="text-sm text-muted-foreground">No hay datos para graficar la curva.</p>
      </div>
    );
  }

  const coeficientes = ajustarCurva(puntos);
  const bondadAjuste = r2(puntos, coeficientes);
  const tirPromedio = media(puntos.map((p) => p.y));
  const dispersion = desvioEstandar(puntos.map((p) => p.y));
  const baratos = puntos.filter((p) => p.y > evaluarCurva(coeficientes, p.x)).length;
  const caros = puntos.length - baratos;

  const duraciones = puntos.map((p) => p.x);
  const tires = puntos.map((p) => p.y);
  const minDuration = Math.min(...duraciones);
  const maxDuration = Math.max(...duraciones);
  const minTir = Math.min(...tires);
  const maxTir = Math.max(...tires);
  // Margen para que los puntos extremos no queden pegados al borde del gráfico.
  const margenTir = (maxTir - minTir) * 0.15 || 1;
  const tirDesde = minTir - margenTir;
  const tirHasta = maxTir + margenTir;

  const escalarX = (x: number) => escalar(x, minDuration, maxDuration, PADDING_IZQ, ANCHO - PADDING_DER);
  const escalarY = (y: number) => escalar(y, tirDesde, tirHasta, ALTO - PADDING_ABAJO, PADDING_ARRIBA);

  const coords = puntos.map((p) => ({
    ...p,
    cx: escalarX(p.x),
    cy: escalarY(p.y),
    curvaY: escalarY(evaluarCurva(coeficientes, p.x)),
    barato: p.y > evaluarCurva(coeficientes, p.x),
  }));

  const curvaPath = Array.from({ length: MUESTRAS_CURVA + 1 }, (_, i) => {
    const x = minDuration + ((maxDuration - minDuration) * i) / MUESTRAS_CURVA;
    return `${i === 0 ? "M" : "L"}${escalarX(x)},${escalarY(evaluarCurva(coeficientes, x))}`;
  }).join(" ");

  const gridY = Array.from({ length: CANTIDAD_GRIDLINES + 1 }, (_, i) => {
    const valor = tirDesde + ((tirHasta - tirDesde) * i) / CANTIDAD_GRIDLINES;
    return { valor, y: escalarY(valor) };
  });

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/60 p-4">
      <svg
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Curva de rendimientos (TIR vs. duration) de bonos ${seccion}, con curva de regresión y bonos marcados`}
      >
        {gridY.map(({ valor, y }) => (
          <g key={valor}>
            <line x1={PADDING_IZQ} y1={y} x2={ANCHO - PADDING_DER} y2={y} className="stroke-border" strokeWidth={1} />
            <text
              x={PADDING_IZQ - 8}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[0.6rem]"
            >
              {valor.toFixed(1)}%
            </text>
          </g>
        ))}

        <line
          x1={PADDING_IZQ}
          y1={ALTO - PADDING_ABAJO}
          x2={ANCHO - PADDING_DER}
          y2={ALTO - PADDING_ABAJO}
          className="stroke-border"
          strokeWidth={1}
        />

        {/* curva de regresión */}
        <path
          d={curvaPath}
          fill="none"
          className="stroke-accent"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* bonos: línea punteada hasta la curva (residuo) + punto coloreado según barato/caro + etiquetas */}
        {coords.map((c) => (
          <g key={c.ticker}>
            <line
              x1={c.cx}
              y1={c.cy}
              x2={c.cx}
              y2={c.curvaY}
              className="stroke-border"
              strokeWidth={1}
              strokeDasharray="2,2"
            />
            <circle
              cx={c.cx}
              cy={c.cy}
              r={4.5}
              className={c.barato ? "fill-foreground stroke-background" : "fill-muted-foreground stroke-background"}
              strokeWidth={1.5}
            />
            <text x={c.cx} y={c.cy - 11} textAnchor="middle" className="fill-foreground text-[0.65rem] font-semibold">
              {c.ticker}
            </text>
            <text
              x={c.cx}
              y={ALTO - PADDING_ABAJO + 16}
              textAnchor="middle"
              className="fill-muted-foreground text-[0.6rem]"
            >
              {c.x.toFixed(1)}
            </text>
          </g>
        ))}

        <text
          x={(PADDING_IZQ + ANCHO - PADDING_DER) / 2}
          y={ALTO - 6}
          textAnchor="middle"
          className="fill-muted-foreground text-[0.6rem]"
        >
          Duration (años)
        </text>
      </svg>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.7rem] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-foreground" /> Rinde sobre la curva (relativamente barato)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-muted-foreground" /> Rinde bajo la curva (relativamente caro)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-accent" /> Curva de regresión
        </span>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border/40 pt-3">
        <div>
          <p className="text-[0.7rem] text-muted-foreground">R² del ajuste</p>
          <p className="font-mono text-sm font-semibold text-foreground">{formatPrice(bondadAjuste * 100)}%</p>
        </div>
        <div>
          <p className="text-[0.7rem] text-muted-foreground">TIR promedio</p>
          <p className="font-mono text-sm font-semibold text-foreground">{formatPrice(tirPromedio)}%</p>
        </div>
        <div>
          <p className="text-[0.7rem] text-muted-foreground">Desvío estándar</p>
          <p className="font-mono text-sm font-semibold text-foreground">{formatPrice(dispersion)} pp</p>
        </div>
        <div>
          <p className="text-[0.7rem] text-muted-foreground">Baratos / caros</p>
          <p className="font-mono text-sm font-semibold text-foreground">
            {baratos} / {caros}
          </p>
        </div>
      </div>
    </div>
  );
}
