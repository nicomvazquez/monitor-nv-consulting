import type { DetailedHTMLProps, HTMLAttributes } from "react";

/**
 * Web Component de TradingView para el mapa de calor
 * (https://www.tradingview.com/widget-docs/widgets/heatmaps/heatmap/). No
 * tiene tipos propios (se carga como script externo, no como paquete npm),
 * así que se declara acá a mano para poder usar `<tv-heatmap>` en JSX.
 */
// React 19 + jsx-runtime resuelve los tipos de JSX vía `declare module "react" { namespace JSX }`,
// no vía el namespace global `JSX` (que ya no alcanza con esta config) — por eso se amplía acá.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "tv-heatmap": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        "heatmap-type"?: string;
        "data-source"?: string;
        grouping?: string;
        "block-size"?: string;
        "block-color"?: string;
        theme?: string;
      };
    }
  }
}
