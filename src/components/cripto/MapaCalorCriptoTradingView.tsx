"use client";

import Script from "next/script";

/**
 * Mapa de calor de criptomonedas embebido de TradingView (mismo Web Component
 * que `MapaCalorTradingView`, de acciones, pero con `heatmap-type="crypto-coins"`
 * — valores verificados a mano en el constructor del widget, tradingview.com/widget-docs):
 * agrupado por categoría (DeFi, Layer 1, ...), tamaño por market cap, color por
 * variación de 24hs. Trae su propia data en vivo — no depende de ningún fetch propio.
 */
export function MapaCalorCriptoTradingView() {
  return (
    <div className="h-[75vh] min-h-[560px] max-h-[900px] overflow-hidden rounded-lg border border-border/50">
      <Script id="tv-heatmap-script" src="https://widgets.tradingview-widget.com/w/en/tv-heatmap.js" type="module" strategy="afterInteractive" />
      <tv-heatmap
        heatmap-type="crypto-coins"
        data-source="Crypto"
        grouping="sector"
        block-size="market_cap_calc"
        block-color="24h_close_change|5"
        theme="dark"
      />
    </div>
  );
}
