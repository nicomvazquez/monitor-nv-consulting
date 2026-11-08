"use client";

import Script from "next/script";
import { useState } from "react";

type Fuente = "merval" | "todas" | "sp500";

/**
 * Valores reales de `data-source` para el widget Heatmap de TradingView —
 * verificados a mano en su constructor (tradingview.com/widget-docs), no
 * documentados en texto plano en ningún lado.
 */
const DATA_SOURCE: Record<Fuente, string> = {
  merval: "BCBAIMV",
  todas: "AllAR",
  sp500: "SPX500",
};

const NOMBRE_FUENTE: Record<Fuente, string> = {
  merval: "Merval",
  todas: "Todas las acciones",
  sp500: "S&P 500",
};

/**
 * Mapa de calor embebido de TradingView (Web Component): reemplaza al que
 * armábamos nosotros con ECharts a partir de datos de IOL. Trae su propia
 * data en vivo, agrupada por sector, tamaño por capitalización de mercado y
 * color por variación del día — no depende de ningún fetch propio.
 */
export function MapaCalorTradingView() {
  const [fuente, setFuente] = useState<Fuente>("merval");

  return (
    <div className="flex flex-col gap-3">
      <Script id="tv-heatmap-script" src="https://widgets.tradingview-widget.com/w/en/tv-heatmap.js" type="module" strategy="afterInteractive" />

      <div className="inline-flex w-fit gap-1 rounded-xl border border-border bg-card/40 p-1">
        {(["merval", "todas", "sp500"] as const).map((opcion) => (
          <button
            key={opcion}
            type="button"
            onClick={() => setFuente(opcion)}
            className={
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors " +
              (fuente === opcion ? "bg-accent/15 text-accent" : "text-muted-foreground hover:text-foreground")
            }
          >
            {NOMBRE_FUENTE[opcion]}
          </button>
        ))}
      </div>

      {/* `key={fuente}`: fuerza a remontar el custom element al cambiar la fuente, en vez de
          confiar en que reaccione solo a un cambio de atributo post-montaje. Altura en `vh`
          (con piso y techo): con el mapa como único contenido de la página, aprovecha el alto
          de pantalla disponible en vez de quedar achicado a un tamaño fijo chico. */}
      <div className="h-[88vh] min-h-[720px] max-h-[1200px] overflow-hidden rounded-lg border border-border/50">
        <tv-heatmap
          key={fuente}
          heatmap-type="stock"
          data-source={DATA_SOURCE[fuente]}
          grouping="sector"
          block-size="market_cap_basic"
          block-color="change"
          theme="dark"
        />
      </div>
    </div>
  );
}
