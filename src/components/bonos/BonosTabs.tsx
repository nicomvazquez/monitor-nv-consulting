"use client";

import { Calculator } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import type { BonoFila, LecapFila } from "@/lib/googlesheets/types";
import { Modulo } from "@/components/ui/Modulo";
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

interface BonosTabsProps {
  bonos: { filas: BonoFila[] | null; error: string | null };
  lecaps: { filas: LecapFila[] | null; error: string | null };
  dolarMep: { compra: number; venta: number } | null;
}

/** Mini navbar para elegir entre bonos soberanos (en dólares) y LECAPs (en pesos): son cuadros con datos y métricas distintas, mezclarlos en uno solo no tendría sentido. */
export function BonosTabs({ bonos, lecaps, dolarMep }: BonosTabsProps) {
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
        <Modulo titulo="Bonos soberanos" descripcion="Precio, TIR, duration y convexidad en dólares" Icono={Calculator}>
          <div className="flex flex-col gap-6">
            <BonosSheetSection {...bonos} />
            <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
              <BonosCurvaSection {...bonos} seccion="ley local" titulo="Curva de rendimientos — Ley local" />
              <BonosCurvaSection {...bonos} seccion="ley new york" titulo="Curva de rendimientos — Ley extranjera" />
            </div>
          </div>
        </Modulo>
      ) : (
        <Modulo titulo="LECAPs" descripcion="Precio, TEM/TNA y carry trade en pesos" Icono={Calculator}>
          <div className="flex flex-col gap-6">
            <LecapsSection {...lecaps} />
            <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
              <LecapsCurvaSection {...lecaps} />
              <CarryTradeSection {...lecaps} dolarMep={dolarMep} />
            </div>
          </div>
        </Modulo>
      )}
    </div>
  );
}
