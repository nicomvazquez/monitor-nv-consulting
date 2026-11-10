"use client";

import { useEffect, useState } from "react";
import { CurrencyBtc } from "@phosphor-icons/react/dist/ssr";
import { VariacionBadge } from "@/components/cotizaciones/VariacionBadge";
import { BINANCE_WS_URL } from "@/lib/binance/config";
import type { BinanceTickerStreamMessage } from "@/lib/binance/types";
import { formatPrice } from "@/lib/format";
import type { FilaCotizacion } from "@/lib/types";

const RECONEXION_MS = 3000;
const wsUrl = `${BINANCE_WS_URL}?streams=btcusdt@ticker`;

const SIN_DATOS: FilaCotizacion = { simbolo: "BTC", descripcion: "Bitcoin", ultimoPrecio: null, variacionPorcentual: null, volumen: null };

/**
 * Precio de Bitcoin al lado del logo: el dato de mercado que más se mira de
 * arrancada, visible en todo el sitio (no solo en la home). Antes se pintaba
 * una sola vez con el dato del layout raíz (que no vuelve a pedirse al
 * navegar entre páginas) y se quedaba pegado a ese valor — ahora se actualiza
 * en vivo por WebSocket, mismo mecanismo que usa `CryptoLivePanel`.
 */
export function BtcChip({ btc: inicial }: { btc: FilaCotizacion | null }) {
  const [btc, setBtc] = useState(inicial ?? SIN_DATOS);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reintento: ReturnType<typeof setTimeout> | null = null;
    let desmontado = false;

    function conectar() {
      socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        const { data } = JSON.parse(event.data) as BinanceTickerStreamMessage;
        setBtc((prev) => ({ ...prev, ultimoPrecio: Number(data.c), variacionPorcentual: Number(data.P) }));
      };

      socket.onerror = () => socket?.close();

      socket.onclose = () => {
        if (!desmontado) reintento = setTimeout(conectar, RECONEXION_MS);
      };
    }

    conectar();

    return () => {
      desmontado = true;
      if (reintento) clearTimeout(reintento);
      socket?.close();
    };
  }, []);

  if (btc.ultimoPrecio === null) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-border bg-card/60 py-1 pr-2.5 pl-2 max-sm:hidden">
      <CurrencyBtc size={16} weight="bold" className="flex-none text-accent" aria-hidden="true" />
      <span className="font-mono text-sm font-semibold tabular-nums text-foreground">US${formatPrice(btc.ultimoPrecio)}</span>
      <VariacionBadge variacion={btc.variacionPorcentual} />
    </div>
  );
}
