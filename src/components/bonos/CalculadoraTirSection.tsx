"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { calcularInversion, calcularTirDesdeCashflow } from "@/lib/bonos/calculoTir";
import type { DatosCalculadoraTir, BonoSeleccionable } from "@/lib/docta/calculadoraTir";
import { formatPercent, formatPrice, formatTasa } from "@/lib/format";
import { Spinner } from "@/components/ui/Spinner";

const claseCampo =
  "min-h-11 w-full rounded-xl border border-border/60 bg-card/40 shadow-sm shadow-black/40 bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:min-h-9";

function fechaAr(iso: string): string {
  const [anio, mes, dia] = iso.split("-");
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : iso;
}

function Metrica({ etiqueta, valor, destacada = false }: { etiqueta: string; valor: string; destacada?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border/50 px-3 py-2">
      <span className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">{etiqueta}</span>
      <span className={`font-mono text-sm font-semibold tabular-nums ${destacada ? "text-accent" : "text-foreground"}`}>{valor}</span>
    </div>
  );
}

/**
 * Las clases variables/indexadas (CER, UVA, dollar-linked, BADLAR/TAMAR)
 * ajustan los pagos futuros por un índice que el cashflow de Docta no trae
 * incorporado (solo el cronograma nominal) — mostrarlo es igual de útil,
 * pero la TIR calculada acá no refleja esa indexación. Se avisa en vez de
 * ocultar el resultado: sigue siendo la mejor aproximación gratis que hay.
 */
function esClaseIndexadaOVariable(subAssetClass: string): boolean {
  return /CER|UVA|DOLLAR_LINKED|TAMAR|BADLAR/i.test(subAssetClass);
}

/** Formulario de precio + resultados, clave por ticker: al cambiar de bono se remonta entero, así el precio sugerido de cada bono arranca de cero en vez de arrastrar el que había tipeado para el anterior. */
function FormularioTir({ bono, datos }: { bono: BonoSeleccionable; datos: DatosCalculadoraTir }) {
  const [precioTexto, setPrecioTexto] = useState(datos.precioMercadoSugerido !== null ? String(datos.precioMercadoSugerido) : "");
  const [nominalesTexto, setNominalesTexto] = useState("100");

  const precio = Number(precioTexto.replace(",", "."));
  const precioValido = precioTexto.trim() !== "" && Number.isFinite(precio) && precio > 0;

  const nominales = Number(nominalesTexto.replace(",", "."));
  const nominalesValidos = nominalesTexto.trim() !== "" && Number.isFinite(nominales) && nominales > 0;

  const resultado = useMemo(
    () => (precioValido ? calcularTirDesdeCashflow(datos.cashflow, datos.fechaLiquidacion, precio) : null),
    [datos, precioValido, precio],
  );

  const flujosFuturos = useMemo(
    () => datos.cashflow.filter((f) => f.fecha > datos.fechaLiquidacion).sort((a, b) => a.fecha.localeCompare(b.fecha)),
    [datos],
  );

  const factorNominales = nominalesValidos ? nominales / 100 : 0;
  const inversion = useMemo(
    () => (precioValido && nominalesValidos && flujosFuturos.length > 0 ? calcularInversion(flujosFuturos, nominales, precio) : null),
    [flujosFuturos, nominales, nominalesValidos, precio, precioValido],
  );

  return (
    <div className="flex flex-col gap-4">
      {esClaseIndexadaOVariable(bono.subAssetClass) && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
          Este bono ajusta por índice o tasa variable (CER, UVA, dollar-linked, BADLAR/TAMAR). El cronograma de abajo es el nominal —
          la TIR calculada no reproyecta ese ajuste, así que puede diferir del rendimiento real.
        </p>
      )}

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1.5 sm:w-56">
          <label htmlFor="precio-tir" className="text-xs font-medium text-muted-foreground">
            Precio (sucio, con interés corrido)
          </label>
          <input
            id="precio-tir"
            type="text"
            inputMode="decimal"
            value={precioTexto}
            onChange={(e) => setPrecioTexto(e.target.value)}
            placeholder="Ej: 51,30"
            className={claseCampo}
          />
          {datos.precioMercadoSugerido !== null && (
            <span className="text-[0.7rem] text-muted-foreground">Precio de cierre de IOL hoy: {formatPrice(datos.precioMercadoSugerido)}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5 sm:w-56">
          <label htmlFor="nominales-tir" className="text-xs font-medium text-muted-foreground">
            Cantidad de nominales
          </label>
          <input
            id="nominales-tir"
            type="text"
            inputMode="decimal"
            value={nominalesTexto}
            onChange={(e) => setNominalesTexto(e.target.value)}
            placeholder="Ej: 1000"
            className={claseCampo}
          />
          <span className="text-[0.7rem] text-muted-foreground">Precio y cashflow cotizan cada 100 nominales — esto los escala a tu posición.</span>
        </div>
      </div>

      {!precioValido && <p className="text-sm text-muted-foreground">Ingresá un precio para calcular la TIR.</p>}

      {precioValido && resultado === null && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Este bono ya no tiene pagos futuros a partir de la fecha de liquidación — no se puede calcular una TIR.
        </p>
      )}

      {resultado && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metrica etiqueta="TIR" valor={formatTasa(resultado.tir * 100)} destacada />
          <Metrica etiqueta="TEA" valor={formatTasa(resultado.tea * 100)} />
          <Metrica etiqueta="TNA" valor={formatTasa(resultado.tna * 100)} />
          <Metrica etiqueta="TEM" valor={formatTasa(resultado.tem * 100)} />
          <Metrica etiqueta="Duration" valor={formatPrice(resultado.duration)} />
          <Metrica etiqueta="Dur. modificada" valor={formatPrice(resultado.durationModificada)} />
          <Metrica etiqueta="Convexidad" valor={formatPrice(resultado.convexidad)} />
          <Metrica etiqueta="Días al vto." valor={resultado.diasAlVencimiento.toLocaleString("es-AR")} />
          <Metrica etiqueta="Valor residual" valor={formatPrice(resultado.valorResidual)} />
          <Metrica etiqueta="Precio limpio" valor={formatPrice(resultado.precioLimpio)} />
          <Metrica etiqueta="Interés corrido" valor={formatPrice(resultado.interesCorrido)} />
          <Metrica etiqueta="Liquidación" valor={fechaAr(datos.fechaLiquidacion)} />
        </div>
      )}

      {inversion && (
        <div className="flex flex-col gap-1.5">
          <h4 className="text-sm font-semibold text-foreground">Tu inversión ({nominales.toLocaleString("es-AR")} nominales)</h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Metrica etiqueta="Monto a invertir" valor={formatPrice(inversion.montoInvertido)} />
            <Metrica etiqueta="Total a cobrar" valor={formatPrice(inversion.totalACobrar)} />
            <Metrica etiqueta="Ganancia neta" valor={formatPrice(inversion.gananciaNeta)} destacada={inversion.gananciaNeta >= 0} />
            <Metrica etiqueta="Ganancia del período" valor={formatPercent(inversion.gananciaPorcentual)} destacada={inversion.gananciaPorcentual >= 0} />
          </div>
          <p className="text-[0.7rem] text-muted-foreground">
            &ldquo;Ganancia del período&rdquo; es el retorno total hasta el vencimiento, no anualizado — para eso está la TIR de arriba.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <h4 className="text-sm font-semibold text-foreground">Cashflow (desde la liquidación)</h4>
        {flujosFuturos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No quedan pagos futuros.</p>
        ) : (
          <div className="scrollbar-accent overflow-x-auto rounded-lg border border-border/50">
            <table className="min-w-full divide-y divide-border/50 text-left text-xs sm:text-sm">
              <thead className="bg-card">
                <tr>
                  <th scope="col" className="px-2.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-accent">
                    Fecha
                  </th>
                  <th scope="col" className="px-2.5 py-1.5 text-right text-[0.7rem] font-semibold uppercase tracking-wide text-accent">
                    Amortización
                  </th>
                  <th scope="col" className="px-2.5 py-1.5 text-right text-[0.7rem] font-semibold uppercase tracking-wide text-accent">
                    Interés
                  </th>
                  <th scope="col" className="px-2.5 py-1.5 text-right text-[0.7rem] font-semibold uppercase tracking-wide text-accent">
                    Flujo total
                  </th>
                  <th scope="col" className="px-2.5 py-1.5 text-right text-[0.7rem] font-semibold uppercase tracking-wide text-accent">
                    VR remanente
                  </th>
                  {nominalesValidos && (
                    <th scope="col" className="px-2.5 py-1.5 text-right text-[0.7rem] font-semibold uppercase tracking-wide text-accent">
                      A cobrar
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {flujosFuturos.map((flujo) => (
                  <tr key={flujo.fecha} className="transition-colors hover:bg-accent/5">
                    <td className="px-2.5 py-1.5 font-medium text-foreground">{fechaAr(flujo.fecha)}</td>
                    <td className="px-2.5 py-1.5 text-right font-mono tabular-nums text-foreground/90">{formatPrice(flujo.capital)}</td>
                    <td className="px-2.5 py-1.5 text-right font-mono tabular-nums text-foreground/90">{formatPrice(flujo.interes)}</td>
                    <td className="px-2.5 py-1.5 text-right font-mono font-semibold tabular-nums text-accent">{formatPrice(flujo.flujo)}</td>
                    <td className="px-2.5 py-1.5 text-right font-mono tabular-nums text-muted-foreground">
                      {formatPrice(flujo.valorResidualDespues)}
                    </td>
                    {nominalesValidos && (
                      <td className="px-2.5 py-1.5 text-right font-mono font-semibold tabular-nums text-foreground">
                        {formatPrice(flujo.flujo * factorNominales)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

interface CalculadoraTirSectionProps {
  instrumentos: BonoSeleccionable[];
  tickerSeleccionado: string | null;
  datos: DatosCalculadoraTir | null;
  error: string | null;
}

/**
 * Elegir un bono navega con `?ticker=...` sobre la misma página: el
 * servidor trae el cronograma de pagos (necesita el token de Docta, no se
 * puede exponer al cliente) una sola vez por bono por día — ver
 * `lib/docta/calculadoraTir.ts`. A partir de ahí, cambiar el precio en el
 * formulario NO vuelve a navegar ni a pedir nada: `FormularioTir` recalcula
 * todo en el cliente con `calcularTirDesdeCashflow`.
 */
export function CalculadoraTirSection({ instrumentos, tickerSeleccionado, datos, error }: CalculadoraTirSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pendiente, startTransition] = useTransition();

  const bono = instrumentos.find((b) => b.ticker === tickerSeleccionado) ?? null;

  function elegir(ticker: string) {
    startTransition(() => {
      router.replace(ticker ? `${pathname}?ticker=${encodeURIComponent(ticker)}` : pathname, { scroll: false });
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        Cronograma de pagos de Docta Capital (cacheado una vez por día por bono) + la fórmula estándar de TIR, calculada acá mismo —
        así podés probar cualquier precio las veces que quieras sin depender de ninguna cuota.
      </p>

      <div className="flex flex-col gap-1.5 sm:w-96">
        <label htmlFor="selector-bono-tir" className="text-xs font-medium text-muted-foreground">
          Bono
        </label>
        <select id="selector-bono-tir" value={tickerSeleccionado ?? ""} onChange={(e) => elegir(e.target.value)} className={claseCampo}>
          <option value="">– Elegí un bono –</option>
          {instrumentos.map((b) => (
            <option key={b.ticker} value={b.ticker}>
              {b.ticker} — {b.nombre}
            </option>
          ))}
        </select>
      </div>

      {pendiente && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-4 text-accent" />
          Cargando cronograma de pagos…
        </p>
      )}

      {!pendiente && error && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {!pendiente && !error && bono && datos && <FormularioTir key={bono.ticker} bono={bono} datos={datos} />}

      {!pendiente && !error && !datos && <p className="text-sm text-muted-foreground">Elegí un bono para ver su cashflow y calcular su TIR.</p>}
    </div>
  );
}
