import { readFileSync } from "node:fs";
import path from "node:path";
import { Circle, Document, G, Image, Line, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import type { RiesgoPais } from "@/lib/argentinadatos/types";
import type { Dolar } from "@/lib/dolarapi/types";
import { formatPrice, formatVolumen } from "@/lib/format";
import type { BonoFila } from "@/lib/googlesheets/types";
import { ajustarCurva, evaluarCurva, media, r2, type Punto } from "@/lib/regresion";
import type { DatosReporte, Resultado } from "@/lib/reportes/datosReporte";
import type { ResumenIA } from "@/lib/reportes/resumenIA";
import type { FilaCotizacion } from "@/lib/types";

/**
 * Mismo archivo que usa `Logo.tsx` en el sitio. Se lee a un Buffer (en vez de
 * pasarle la ruta como string a `Image`) porque en Windows el resolver de
 * react-pdf no interpreta bien una ruta absoluta con backslashes.
 */
const LOGO = readFileSync(path.join(process.cwd(), "public", "logo.png"));

// Mismos tokens de color que `globals.css` del sitio (modo oscuro, el único
// que tiene): --background, --card, --foreground, --muted-foreground,
// --border, --accent, --accent-foreground. El reporte en PDF usa la misma
// paleta en vez de una versión "para papel blanco" — es, visualmente, una
// página más del sitio.
const BG = "#0A0A0A";
const CARD = "#171717";
const TEXT = "#F5F5F5";
const MUTED = "#A3A3A3";
const BORDER = "#2E2E2E";
const ACCENT = "#8ECAE6";
// Mismo tinte que usa el sitio en los estados hover (`bg-accent/5`): acento
// al ~10% sobre `--card`, precalculado a un hex sólido porque el color de
// fondo de react-pdf no soporta alfa de forma confiable.
const ZEBRA = "#23292C";

// Mismo par que `VariacionBadge` del sitio (emerald-400 / red-400 de
// Tailwind). El fondo es ese mismo verde/rojo al ~10% sobre `--card`
// (replica `bg-emerald-400/10` / `bg-red-400/10`), también precalculado.
const POSITIVO = "#34D399";
const POSITIVO_SOFT = "#1A2A24";
const NEGATIVO = "#F87171";
const NEGATIVO_SOFT = "#2E2020";

const styles = StyleSheet.create({
  page: {
    backgroundColor: BG,
    paddingTop: 46,
    paddingBottom: 22,
    paddingHorizontal: 22,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: TEXT,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: BG,
    borderBottomWidth: 1.5,
    borderBottomColor: ACCENT,
    paddingHorizontal: 22,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIzquierda: { flexDirection: "row", alignItems: "center", gap: 7 },
  logo: { width: 24, height: 14.4 },
  marca: { fontSize: 13, fontFamily: "Helvetica-Bold", color: TEXT },
  marcaPunto: { color: ACCENT },
  subMarca: { fontSize: 7, color: MUTED, marginTop: 1.5 },
  headerCentro: { alignItems: "center" },
  headerRiesgoLabel: { fontSize: 7, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5 },
  headerRiesgoValor: { fontSize: 13, fontFamily: "Helvetica-Bold", color: ACCENT, marginTop: 1.5 },
  headerDerecha: { alignItems: "flex-end" },
  headerTitulo: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: TEXT },
  headerFecha: { fontSize: 7, color: MUTED, marginTop: 1.5 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 9,
    borderTopWidth: 0.75,
    borderTopColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerTexto: { fontSize: 6.5, color: MUTED, maxWidth: 420 },
  seccion: { marginTop: 7 },
  tituloFila: { flexDirection: "row", alignItems: "center", gap: 4 },
  tituloBarra: { width: 3, height: 8, borderRadius: 1, backgroundColor: ACCENT },
  seccionTitulo: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  seccionSubtitulo: { fontSize: 7, color: MUTED, marginTop: 1, marginBottom: 3 },
  tabla: { borderWidth: 0.75, borderColor: BORDER, borderRadius: 3, overflow: "hidden" },
  filaEncabezado: { flexDirection: "row", paddingVertical: 3.5, paddingHorizontal: 8, backgroundColor: CARD },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3.25,
    paddingHorizontal: 8,
    fontSize: 7.5,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
  },
  encabezadoTexto: { fontSize: 6.25, fontFamily: "Helvetica-Bold", color: ACCENT, textTransform: "uppercase" },
  celdaSimbolo: { fontFamily: "Helvetica-Bold" },
  celdaDerecha: { textAlign: "right" },
  celdaMuted: { color: MUTED },
  celdaVariacionCont: { alignItems: "flex-end" },
  chip: { fontFamily: "Helvetica-Bold", borderRadius: 6, paddingHorizontal: 4, paddingVertical: 1.5 },
  sinDatos: { fontSize: 7.5, color: MUTED, fontStyle: "italic", paddingVertical: 4 },
  grid2: { flexDirection: "row", gap: 9 },
  grid2Col: { flex: 1, minWidth: 0 },
  resumenCaja: {
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
    backgroundColor: CARD,
    paddingVertical: 7,
    paddingHorizontal: 9,
    lineHeight: 1.32,
  },
  resumenParrafoSiguiente: { marginTop: 5 },
  resumenFuentes: { fontSize: 6.5, color: MUTED, marginTop: 4 },
  tarjetasFila: { flexDirection: "row", gap: 5 },
  tarjetaDolar: {
    flex: 1,
    minWidth: 0,
    borderRadius: 3,
    borderWidth: 0.75,
    borderColor: BORDER,
    borderTopWidth: 2,
    borderTopColor: ACCENT,
    backgroundColor: CARD,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tarjetaDolarNombre: { fontSize: 6, color: MUTED, textTransform: "uppercase", letterSpacing: 0.3 },
  tarjetaDolarCompra: { fontSize: 7, color: MUTED, marginTop: 2 },
  tarjetaDolarVenta: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: ACCENT, marginTop: 1 },
  tarjetaIndice: {
    flex: 1,
    minWidth: 0,
    borderRadius: 3,
    borderWidth: 0.75,
    borderColor: BORDER,
    borderTopWidth: 2,
    borderTopColor: ACCENT,
    backgroundColor: CARD,
    paddingVertical: 6,
    paddingHorizontal: 7,
  },
  tarjetaIndiceNombre: { fontSize: 7, color: MUTED, fontFamily: "Helvetica-Bold" },
  tarjetaIndiceValor: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: TEXT, marginTop: 2 },
  tarjetaIndiceVariacion: { alignSelf: "flex-start", fontSize: 7, marginTop: 3 },
  curvaColumna: { flex: 1, minWidth: 0 },
  curvaCaja: { borderWidth: 0.75, borderColor: BORDER, borderRadius: 3, backgroundColor: CARD, padding: 6 },
  curvaTitulo: { fontSize: 8, fontFamily: "Helvetica-Bold", color: ACCENT, marginBottom: 3 },
  curvaStats: { fontSize: 6.25, color: MUTED, marginTop: 3 },
  bonoTabla: { marginTop: 5, borderWidth: 0.75, borderColor: BORDER, borderRadius: 3, overflow: "hidden" },
  bonoFilaEncabezado: {
    flexDirection: "row",
    paddingVertical: 2.5,
    paddingHorizontal: 7,
    backgroundColor: BG,
  },
  bonoEncabezadoTexto: { fontSize: 5.5, fontFamily: "Helvetica-Bold", color: ACCENT, textTransform: "uppercase" },
  bonoFila: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2.25,
    paddingHorizontal: 7,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
  },
  bonoTickerFila: { flexDirection: "row", alignItems: "center", gap: 3 },
  bonoPunto: { width: 4, height: 4, borderRadius: 2 },
  bonoCeldaTicker: { fontSize: 6.25, fontFamily: "Helvetica-Bold" },
  bonoCelda: { fontSize: 6, textAlign: "right", color: MUTED },
  bonoCeldaTir: { fontSize: 6, textAlign: "right", fontFamily: "Helvetica-Bold", color: TEXT },
});

const formateadorFechaHora = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

/** `fechaCierre` es una fecha "solo calendario" en UTC medianoche (ver `getFechaUltimoCierre`): se formatea con getters UTC para no correrla un día por la zona horaria del servidor. */
function formatFechaCierre(fechaCierre: Date): string {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeZone: "UTC" }).format(fechaCierre);
}

/**
 * Mismo criterio que `VariacionBadge` del sitio: positivo/negativo llevan un
 * "chip" con fondo verde/rojo suave que se achica al ancho del texto (no al
 * de la columna, para que sea una píldora y no un bloque de color pegado al
 * borde de la celda); sin dato o variación nula, texto plano sin chip.
 */
function VariacionChip({ variacion }: { variacion: number | null }) {
  if (variacion === null) return <Text style={styles.celdaMuted}>-</Text>;

  const positivo = variacion > 0;
  const negativo = variacion < 0;
  const estilo = positivo
    ? { color: POSITIVO, backgroundColor: POSITIVO_SOFT }
    : negativo
      ? { color: NEGATIVO, backgroundColor: NEGATIVO_SOFT }
      : { color: MUTED, backgroundColor: CARD };

  return <Text style={[styles.chip, estilo]}>{`${positivo ? "+" : ""}${formatPrice(variacion)}%`}</Text>;
}

function Encabezado({
  generadoEn,
  fechaCierre,
  riesgoPais,
}: {
  generadoEn: Date;
  fechaCierre: Date;
  riesgoPais: RiesgoPais | null;
}) {
  return (
    <View style={styles.header} fixed>
      <View style={styles.headerIzquierda}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- `Image` acá es el componente de @react-pdf/renderer (dibuja en el PDF), no un <img> de HTML: no tiene prop `alt`. */}
        <Image src={LOGO} style={styles.logo} />
        <View>
          <Text style={styles.marca}>
            Cotizaciones<Text style={styles.marcaPunto}>.</Text>
          </Text>
          <Text style={styles.subMarca}>Cierre del {formatFechaCierre(fechaCierre)}</Text>
        </View>
      </View>
      {riesgoPais && (
        <View style={styles.headerCentro}>
          <Text style={styles.headerRiesgoLabel}>Riesgo país</Text>
          <Text style={styles.headerRiesgoValor}>
            {riesgoPais.valor.toLocaleString("es-AR")} <Text style={styles.headerFecha}>pb</Text>
          </Text>
        </View>
      )}
      <View style={styles.headerDerecha}>
        <Text style={styles.headerTitulo}>Reporte de cierre de mercado</Text>
        <Text style={styles.headerFecha}>Generado el {formateadorFechaHora.format(generadoEn)} (Arg.)</Text>
      </View>
    </View>
  );
}

function Pie() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerTexto}>
        Información con fines de referencia, no constituye asesoramiento financiero. Valores de cierre, no en vivo.
      </Text>
      <Text
        style={styles.footerTexto}
        render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
      />
    </View>
  );
}

/** Título de sección con una pequeña barra de acento: todas las secciones comparten el mismo color (ver `ACCENT`). */
function TituloSeccion({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <View style={{ marginBottom: subtitulo ? 3 : 5 }}>
      <View style={styles.tituloFila}>
        <View style={styles.tituloBarra} />
        <Text style={styles.seccionTitulo}>{titulo}</Text>
      </View>
      {subtitulo && <Text style={styles.seccionSubtitulo}>{subtitulo}</Text>}
    </View>
  );
}

/** Más párrafos o más caracteres de los habituales (el texto lo redacta un modelo, su largo varía) → letra algo más chica para que siga entrando en una sola página. */
function tamañoAdaptativo(longitud: number): { fontSize: number; lineHeight: number } {
  if (longitud > 2200) return { fontSize: 7.5, lineHeight: 1.3 };
  if (longitud > 1800) return { fontSize: 8, lineHeight: 1.32 };
  return { fontSize: 8.5, lineHeight: 1.35 };
}

function ResumenDia({ resumen }: { resumen: ResumenIA }) {
  const parrafos = resumen.texto.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const tamaño = tamañoAdaptativo(resumen.texto.length);

  return (
    <View style={styles.seccion}>
      <TituloSeccion titulo="Resumen del día" subtitulo={`Redactado por IA (${resumen.modelo}); puede contener errores.`} />
      <View style={[styles.resumenCaja, tamaño]}>
        {parrafos.map((parrafo, i) => (
          <Text key={i} style={i > 0 ? styles.resumenParrafoSiguiente : undefined}>
            {parrafo.trim()}
          </Text>
        ))}
      </View>
      {resumen.fuentes.length > 0 && (
        <Text style={styles.resumenFuentes}>Fuentes: {resumen.fuentes.join(", ")}.</Text>
      )}
    </View>
  );
}

function SinDatos({ error }: { error: string | null }) {
  return <Text style={styles.sinDatos}>{error ?? "Sin datos disponibles."}</Text>;
}

function TablaCotizaciones({ resultado }: { resultado: Resultado<FilaCotizacion[]> }) {
  const { datos, error } = resultado;

  if (!datos || datos.length === 0) return <SinDatos error={error} />;

  return (
    <View style={styles.tabla}>
      <View style={styles.filaEncabezado}>
        <Text style={[styles.encabezadoTexto, { width: "15%" }]}>Símbolo</Text>
        <Text style={[styles.encabezadoTexto, { width: "36%" }]}>Descripción</Text>
        <Text style={[styles.encabezadoTexto, styles.celdaDerecha, { width: "15%" }]}>Cierre</Text>
        <Text style={[styles.encabezadoTexto, styles.celdaDerecha, { width: "17%" }]}>Oper.</Text>
        <Text style={[styles.encabezadoTexto, styles.celdaDerecha, { width: "17%" }]}>Var.</Text>
      </View>
      {datos.map((item, i) => (
        <View key={item.simbolo} style={[styles.fila, i % 2 === 1 ? { backgroundColor: ZEBRA } : undefined]} wrap={false}>
          <Text style={[styles.celdaSimbolo, { width: "15%" }]}>{item.simbolo}</Text>
          <Text style={[styles.celdaMuted, { width: "36%" }]}>{item.descripcion}</Text>
          <Text style={[styles.celdaDerecha, { width: "15%" }]}>
            {item.ultimoPrecio !== null ? formatPrice(item.ultimoPrecio) : "-"}
          </Text>
          <Text style={[styles.celdaMuted, styles.celdaDerecha, { width: "17%" }]}>
            {item.cantidadOperaciones ? formatVolumen(item.cantidadOperaciones) : "-"}
          </Text>
          <View style={[styles.celdaVariacionCont, { width: "17%" }]}>
            <VariacionChip variacion={item.variacionPorcentual} />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Los 5 más operados (mayor cantidad de operaciones) de un panel; `null` si
 * no hay datos. Se ordena por `cantidadOperaciones`, no por `volumen`: IOL
 * solo informa el volumen operado en vivo y lo vuelve 0 con el mercado
 * cerrado, mientras que la cantidad de operaciones del día sigue reflejando
 * el total real después del cierre (que es cuando corre el reporte).
 */
function top5PorVolumen(datos: FilaCotizacion[] | null): FilaCotizacion[] | null {
  if (!datos) return null;
  return [...datos]
    .filter((item) => item.cantidadOperaciones !== null && item.cantidadOperaciones !== undefined)
    .sort((a, b) => (b.cantidadOperaciones as number) - (a.cantidadOperaciones as number))
    .slice(0, 5);
}

/** Nombres cortos para que entren en una tarjeta angosta sin partirse en 3 líneas; el resto de los nombres de dolarapi.com ya son cortos. */
const NOMBRE_DOLAR_CORTO: Record<string, string> = {
  bolsa: "MEP",
  contadoconliqui: "CCL",
};

function TarjetasDolares({ resultado }: { resultado: Resultado<Dolar[]> }) {
  const { datos, error } = resultado;

  if (!datos || datos.length === 0) return <SinDatos error={error} />;

  return (
    <View style={styles.tarjetasFila}>
      {datos.map((dolar) => (
        <View key={dolar.casa} style={styles.tarjetaDolar}>
          <Text style={styles.tarjetaDolarNombre}>{NOMBRE_DOLAR_CORTO[dolar.casa] ?? dolar.nombre}</Text>
          <Text style={styles.tarjetaDolarCompra}>${formatPrice(dolar.compra)}</Text>
          <Text style={styles.tarjetaDolarVenta}>${formatPrice(dolar.venta)}</Text>
        </View>
      ))}
    </View>
  );
}

function TarjetasIndices({ resultado }: { resultado: Resultado<FilaCotizacion[]> }) {
  const { datos, error } = resultado;

  if (!datos || datos.length === 0) return <SinDatos error={error} />;

  return (
    <View style={styles.tarjetasFila}>
      {datos.map((item) => (
        <View key={item.simbolo} style={styles.tarjetaIndice}>
          {/* `simbolo` es el nombre corto de la config (ej. "Dow Jones"); `descripcion` es el nombre largo de Yahoo y no entra en una tarjeta angosta. */}
          <Text style={styles.tarjetaIndiceNombre}>{item.simbolo}</Text>
          <Text style={styles.tarjetaIndiceValor}>
            {item.ultimoPrecio !== null ? formatPrice(item.ultimoPrecio) : "-"}
          </Text>
          <View style={styles.tarjetaIndiceVariacion}>
            <VariacionChip variacion={item.variacionPorcentual} />
          </View>
        </View>
      ))}
    </View>
  );
}

const CURVA_ANCHO = 250;
const CURVA_ALTO = 84;
const CURVA_PAD_IZQ = 24;
const CURVA_PAD_DER = 6;
const CURVA_PAD_ARRIBA = 8;
const CURVA_PAD_ABAJO = 15;
const CURVA_GRIDLINES = 3;
const CURVA_MUESTRAS = 24;

interface PuntoBono extends Punto {
  ticker: string;
}

function escalar(valor: number, min: number, max: number, destinoMin: number, destinoMax: number): number {
  if (max === min) return (destinoMin + destinoMax) / 2;
  return destinoMin + ((valor - min) / (max - min)) * (destinoMax - destinoMin);
}

/**
 * Versión del gráfico de `BonosCurvaChart` (TIR vs. duration, con curva de
 * regresión) dibujada con las primitivas SVG de `@react-pdf/renderer` en vez
 * de `<svg>` de HTML — react-pdf no renderiza DOM, necesita sus propios
 * componentes `Svg`/`Path`/`Line`/`Circle`. Mismo criterio de color que
 * `BonosCurvaChart` del sitio: la curva y "barato" van en el color de texto
 * principal (más visibles), "caro" en el muted — el verde/rojo del reporte
 * se reserva para variaciones de precio reales, no para esta señal de
 * valuación relativa. Debajo va una tabla con el detalle de cada bono
 * (precio, TIR y duration exactos): el gráfico da una lectura visual, la
 * tabla complementa con los números concretos.
 */
function CurvaBonosPdf({ filas, seccion, titulo }: { filas: BonoFila[]; seccion: string; titulo: string }) {
  const bonos = filas
    .filter(
      (fila) => fila.seccion.toLowerCase() === seccion.toLowerCase() && fila.duration !== null && fila.tir !== null,
    )
    .sort((a, b) => (a.duration as number) - (b.duration as number));
  const puntos: PuntoBono[] = bonos.map((fila) => ({ ticker: fila.ticker, x: fila.duration as number, y: fila.tir as number }));

  if (puntos.length === 0) {
    return (
      <View style={styles.curvaColumna}>
        <View style={styles.curvaCaja}>
          <Text style={styles.curvaTitulo}>{titulo}</Text>
          <Text style={styles.sinDatos}>No hay datos para graficar la curva.</Text>
        </View>
      </View>
    );
  }

  const coeficientes = ajustarCurva(puntos);
  const bondadAjuste = r2(puntos, coeficientes);
  const tirPromedio = media(puntos.map((p) => p.y));
  const baratos = puntos.filter((p) => p.y > evaluarCurva(coeficientes, p.x)).length;
  const caros = puntos.length - baratos;

  const duraciones = puntos.map((p) => p.x);
  const tires = puntos.map((p) => p.y);
  const minDuration = Math.min(...duraciones);
  const maxDuration = Math.max(...duraciones);
  const minTir = Math.min(...tires);
  const maxTir = Math.max(...tires);
  const margenTir = (maxTir - minTir) * 0.15 || 1;
  const tirDesde = minTir - margenTir;
  const tirHasta = maxTir + margenTir;

  const escalarX = (x: number) => escalar(x, minDuration, maxDuration, CURVA_PAD_IZQ, CURVA_ANCHO - CURVA_PAD_DER);
  const escalarY = (y: number) => escalar(y, tirDesde, tirHasta, CURVA_ALTO - CURVA_PAD_ABAJO, CURVA_PAD_ARRIBA);

  const coords = puntos.map((p) => ({
    ...p,
    cx: escalarX(p.x),
    cy: escalarY(p.y),
    barato: p.y > evaluarCurva(coeficientes, p.x),
  }));

  const curvaPath = Array.from({ length: CURVA_MUESTRAS + 1 }, (_, i) => {
    const x = minDuration + ((maxDuration - minDuration) * i) / CURVA_MUESTRAS;
    return `${i === 0 ? "M" : "L"}${escalarX(x)},${escalarY(evaluarCurva(coeficientes, x))}`;
  }).join(" ");

  const gridY = Array.from({ length: CURVA_GRIDLINES + 1 }, (_, i) => {
    const valor = tirDesde + ((tirHasta - tirDesde) * i) / CURVA_GRIDLINES;
    return { valor, y: escalarY(valor) };
  });

  return (
    <View style={styles.curvaColumna}>
      <View style={styles.curvaCaja}>
        <Text style={styles.curvaTitulo}>{titulo}</Text>
        <Svg viewBox={`0 0 ${CURVA_ANCHO} ${CURVA_ALTO}`} style={{ width: "100%", height: CURVA_ALTO }}>
          {gridY.map(({ valor, y }) => (
            <G key={valor}>
              <Line
                x1={CURVA_PAD_IZQ}
                y1={y}
                x2={CURVA_ANCHO - CURVA_PAD_DER}
                y2={y}
                stroke={BORDER}
                strokeWidth={0.75}
              />
              <Text x={CURVA_PAD_IZQ - 4} y={y + 2} textAnchor="end" style={{ fontSize: 5.5, fill: MUTED }}>
                {valor.toFixed(1)}%
              </Text>
            </G>
          ))}

          <Path d={curvaPath} fill="none" stroke={ACCENT} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />

          {coords.map((c) => (
            <G key={c.ticker}>
              <Circle cx={c.cx} cy={c.cy} r={3} fill={c.barato ? TEXT : MUTED} stroke={BG} strokeWidth={1} />
              <Text x={c.cx} y={c.cy - 6} textAnchor="middle" style={{ fontSize: 5.5, fill: TEXT, fontFamily: "Helvetica-Bold" }}>
                {c.ticker}
              </Text>
            </G>
          ))}
        </Svg>
        <Text style={styles.curvaStats}>
          R² {formatPrice(bondadAjuste * 100)}% · TIR prom. {formatPrice(tirPromedio)}% · {baratos} baratos / {caros} caros
        </Text>
      </View>

      <View style={styles.bonoTabla}>
        <View style={styles.bonoFilaEncabezado}>
          <Text style={[styles.bonoEncabezadoTexto, { width: "26%" }]}>Ticker</Text>
          <Text style={[styles.bonoEncabezadoTexto, styles.celdaDerecha, { width: "26%" }]}>Precio</Text>
          <Text style={[styles.bonoEncabezadoTexto, styles.celdaDerecha, { width: "24%" }]}>TIR</Text>
          <Text style={[styles.bonoEncabezadoTexto, styles.celdaDerecha, { width: "24%" }]}>Dur.</Text>
        </View>
        {bonos.map((bono, i) => {
          const barato = (bono.tir as number) > evaluarCurva(coeficientes, bono.duration as number);
          return (
            <View
              key={bono.ticker}
              style={[styles.bonoFila, i % 2 === 1 ? { backgroundColor: ZEBRA } : undefined]}
              wrap={false}
            >
              <View style={[styles.bonoTickerFila, { width: "26%" }]}>
                <View style={[styles.bonoPunto, { backgroundColor: barato ? TEXT : MUTED }]} />
                <Text style={styles.bonoCeldaTicker}>{bono.ticker}</Text>
              </View>
              <Text style={[styles.bonoCelda, { width: "26%" }]}>
                {bono.precioUsd !== null ? formatPrice(bono.precioUsd) : "-"}
              </Text>
              <Text style={[styles.bonoCeldaTir, { width: "24%" }]}>{formatPrice(bono.tir as number)}%</Text>
              <Text style={[styles.bonoCelda, { width: "24%" }]}>{formatPrice(bono.duration as number)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Reporte de cierre en una sola página: dólares (tarjetas) → resumen del día
 * con IA (noticias + rueda) → índices (tarjetas) → top 5 movimientos de
 * Panel Líder y CEDEARs → curvas de rendimiento de bonos. Riesgo país va en
 * el encabezado, no acá (ver `Encabezado`). El resto de los paneles de la
 * home (caución, letras, commodities, etc.) no entran en este formato
 * compacto. Misma paleta e identidad visual que el sitio (fondo negro,
 * acento celeste, verde/rojo solo para variaciones de precio) en vez de un
 * esquema propio "para papel".
 */
export function ReporteCierreDocument({ datos, resumen }: { datos: DatosReporte; resumen: ResumenIA | null }) {
  const bonosSheet = datos.bonosSheet.datos ?? [];

  return (
    <Document
      title={`Reporte de cierre - ${datos.generadoEn.toLocaleDateString("es-AR")}`}
      author="Cotizaciones"
    >
      <Page size="A4" style={styles.page}>
        <Encabezado
          generadoEn={datos.generadoEn}
          fechaCierre={datos.fechaCierre}
          riesgoPais={datos.riesgoPais.datos}
        />
        <Pie />

        <View style={styles.seccion}>
          <TituloSeccion titulo="Dólares" />
          <TarjetasDolares resultado={datos.dolares} />
        </View>

        {resumen && <ResumenDia resumen={resumen} />}

        <View style={styles.seccion}>
          <TituloSeccion titulo="Índices" />
          <TarjetasIndices resultado={datos.indices} />
        </View>

        <View style={styles.seccion}>
          <View style={styles.grid2}>
            <View style={styles.grid2Col}>
              <TituloSeccion titulo="Top 5 — Panel Líder" />
              <TablaCotizaciones
                resultado={{ datos: top5PorVolumen(datos.panelLider.datos), error: datos.panelLider.error }}
              />
            </View>
            <View style={styles.grid2Col}>
              <TituloSeccion titulo="Top 5 — CEDEARs" />
              <TablaCotizaciones
                resultado={{ datos: top5PorVolumen(datos.cedears.datos), error: datos.cedears.error }}
              />
            </View>
          </View>
        </View>

        <View style={styles.seccion}>
          <View style={styles.grid2}>
            <CurvaBonosPdf filas={bonosSheet} seccion="ley local" titulo="Curva de rendimientos — Ley local" />
            <CurvaBonosPdf filas={bonosSheet} seccion="ley new york" titulo="Curva de rendimientos — Ley extranjera" />
          </View>
        </View>
      </Page>
    </Document>
  );
}
