"use client";

import { useState } from "react";

/**
 * El PDF se genera al momento del click (pide `/api/reporte-cierre`, que
 * arma el documento con los datos más recientes vía los mismos fetchers que
 * usa la home), no es un archivo estático precalculado — por eso el botón
 * muestra un estado "Generando..." mientras espera la respuesta.
 */
export function DescargarReporteButton() {
  const [estado, setEstado] = useState<"idle" | "generando" | "error">("idle");

  async function handleClick() {
    setEstado("generando");
    try {
      const response = await fetch("/api/reporte-cierre");
      if (!response.ok) throw new Error(`Pedido del reporte falló (${response.status})`);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `reporte-cierre-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
      setEstado("idle");
    } catch (cause) {
      console.error("[descargar-reporte]", cause);
      setEstado("error");
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={estado === "generando"}
        className="flex items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/15 disabled:cursor-wait disabled:opacity-70"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="size-4 flex-none">
          <path d="M10 2a.75.75 0 0 1 .75.75v8.69l2.72-2.72a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 1 1 1.06-1.06l2.72 2.72V2.75A.75.75 0 0 1 10 2Z" />
          <path d="M3.5 12.75a.75.75 0 0 1 .75.75v2A.75.75 0 0 0 5 16.25h10a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 15 17.75H5a2.25 2.25 0 0 1-2.25-2.25v-2a.75.75 0 0 1 .75-.75Z" />
        </svg>
        {estado === "generando" ? "Generando..." : "Descargar reporte (PDF)"}
      </button>
      {estado === "error" && (
        <p className="text-[0.7rem] text-red-400">No se pudo generar el reporte. Probá de nuevo en unos minutos.</p>
      )}
    </div>
  );
}
