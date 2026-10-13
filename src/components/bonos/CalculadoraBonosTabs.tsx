"use client";

import { useState } from "react";
import type { BonoFila, LecapFila } from "@/lib/googlesheets/types";
import { BonosCurvaSection } from "./BonosCurvaSection";
import { BonosSheetSection } from "./BonosSheetSection";
import { CarryTradeSection } from "./CarryTradeSection";
import { LecapsCurvaSection } from "./LecapsCurvaSection";
import { LecapsSection } from "./LecapsSection";

type Instrumento = "soberanos" | "lecaps";

const claseTab = (activo: boolean) =>
  `inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors sm:min-h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
    activo
      ? "border-accent bg-accent/15 text-accent"
      : "border-border/60 text-muted-foreground hover:border-accent/50 hover:text-foreground"
  }`;

interface CalculadoraBonosTabsProps {
  bonos: { filas: BonoFila[] | null; error: string | null };
  lecaps: { filas: LecapFila[] | null; error: string | null };
  dolarMep: { compra: number; venta: number } | null;
}

/** Mini navbar para elegir entre bonos soberanos (en dólares) y LECAPs (en pesos): son instrumentos con métricas distintas, mezclarlos en una sola tabla no tendría sentido. */
export function CalculadoraBonosTabs({ bonos, lecaps, dolarMep }: CalculadoraBonosTabsProps) {
  const [instrumento, setInstrumento] = useState<Instrumento>("soberanos");

  return (
    <div className="flex flex-col gap-5 max-sm:gap-4">
      <nav aria-label="Tipo de instrumento" className="flex gap-2">
        <button
          type="button"
          aria-pressed={instrumento === "soberanos"}
          onClick={() => setInstrumento("soberanos")}
          className={claseTab(instrumento === "soberanos")}
        >
          Bonos soberanos
        </button>
        <button
          type="button"
          aria-pressed={instrumento === "lecaps"}
          onClick={() => setInstrumento("lecaps")}
          className={claseTab(instrumento === "lecaps")}
        >
          LECAPs
        </button>
      </nav>

      {instrumento === "soberanos" ? (
        <div className="flex flex-col gap-5 max-sm:gap-4">
          <BonosSheetSection {...bonos} />
          <div className="grid grid-cols-1 items-start gap-5 max-sm:gap-4 md:grid-cols-2">
            <BonosCurvaSection {...bonos} seccion="ley local" titulo="Curva de rendimientos — Ley local" />
            <BonosCurvaSection {...bonos} seccion="ley new york" titulo="Curva de rendimientos — Ley extranjera" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5 max-sm:gap-4">
          <LecapsSection {...lecaps} />
          <div className="grid grid-cols-1 items-start gap-5 max-sm:gap-4 md:grid-cols-2">
            <LecapsCurvaSection {...lecaps} />
            <CarryTradeSection {...lecaps} dolarMep={dolarMep} />
          </div>
        </div>
      )}
    </div>
  );
}
