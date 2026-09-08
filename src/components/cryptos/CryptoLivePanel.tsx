"use client";

import { useEffect, useState } from "react";
import { CotizacionesTable } from "@/components/cotizaciones/CotizacionesTable";
import { BINANCE_WS_URL, CRYPTOS_SIMBOLOS } from "@/lib/binance/config";
import type { BinanceTickerStreamMessage } from "@/lib/binance/types";
import type { FilaCotizacion } from "@/lib/types";

const RECONEXION_MS = 3000;

const streams = CRYPTOS_SIMBOLOS.map((simbolo) => `${simbolo.toLowerCase()}usdt@ticker`).join("/");
const wsUrl = `${BINANCE_WS_URL}?streams=${streams}`;

export function CryptoLivePanel({ inicial }: { inicial: FilaCotizacion[] }) {
  const [items, setItems] = useState(inicial);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reintento: ReturnType<typeof setTimeout> | null = null;
    let desmontado = false;

    function conectar() {
      socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        const { data } = JSON.parse(event.data) as BinanceTickerStreamMessage;
        const simbolo = data.s.replace("USDT", "");

        setItems((prev) =>
          prev.map((item) =>
            item.simbolo === simbolo
              ? { ...item, ultimoPrecio: Number(data.c), variacionPorcentual: Number(data.P) }
              : item,
          ),
        );
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

  return (
    <section className="flex flex-col gap-3">
      <header>
        <h2 className="text-base font-semibold text-foreground">Criptomonedas</h2>
        <p className="text-xs text-muted-foreground">Precio en vivo (USD) vía WebSocket de Binance.</p>
      </header>
      <CotizacionesTable items={items} />
    </section>
  );
}
