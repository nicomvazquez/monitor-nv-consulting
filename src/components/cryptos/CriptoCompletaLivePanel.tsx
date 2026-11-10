"use client";

import { useEffect, useState } from "react";
import { TablaCriptoCompleta } from "@/components/cryptos/TablaCriptoCompleta";
import { BINANCE_WS_URL, CRYPTOS_SIMBOLOS } from "@/lib/binance/config";
import type { BinanceTickerStreamMessage, CriptoCompleta } from "@/lib/binance/types";

const RECONEXION_MS = 3000;

const streams = CRYPTOS_SIMBOLOS.map((simbolo) => `${simbolo.toLowerCase()}usdt@ticker`).join("/");
const wsUrl = `${BINANCE_WS_URL}?streams=${streams}`;

/** Elemento propio de `/criptomonedas`: la tabla completa (todas las columnas), a diferencia del panel chico de la home (`CryptoLivePanel`). */
export function CriptoCompletaLivePanel({ inicial }: { inicial: CriptoCompleta[] }) {
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
              ? {
                  ...item,
                  ultimoPrecio: Number(data.c),
                  variacionPorcentual: Number(data.P),
                  apertura: Number(data.o),
                  maximo: Number(data.h),
                  minimo: Number(data.l),
                  cierreAnterior: Number(data.x),
                  volumen: Number(data.q),
                  cantidadOperaciones: data.n,
                  puntas: {
                    precioCompra: Number(data.b),
                    cantidadCompra: Number(data.B),
                    precioVenta: Number(data.a),
                    cantidadVenta: Number(data.A),
                  },
                }
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

  return <TablaCriptoCompleta datos={items} rutaBase="/cripto" />;
}
