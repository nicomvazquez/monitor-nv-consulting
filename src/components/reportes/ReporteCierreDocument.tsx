import { readFileSync } from "node:fs";
import path from "node:path";
import { Circle, Document, G, Image, Line, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import type { RiesgoPais } from "@/lib/argentinadatos/types";
import type { Dolar } from "@/lib/dolarapi/types";
import { formatPrice } from "@/lib/format";
import type { BonoFila } from "@/lib/googlesheets/types";
import { ajustarCurva, evaluarCurva, type Punto } from "@/lib/regresion";
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
const BG = "#020617";
const CARD = "#0E1424";
const TEXT = "#F8FAFC";
const MUTED = "#94A3B8";
const BORDER = "#243049";
const ACCENT = "#7DD3FC";
// Mismo tinte que usa el sitio en los estados hover (`bg-accent/5`): acento
// al ~10% sobre `--card`, precalculado a un hex sólido porque el color de
// fondo de react-pdf no soporta alfa de forma confiable.
const ZEBRA = "#19273A";

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
    fontSize: 9.75,
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
  seccion: { marginTop: 4 },
  tituloFila: { flexDirection: "row", alignItems: "center", gap: 4 },
  tituloBarra: { width: 3, height: 8.5, borderRadius: 1, backgroundColor: ACCENT },
  seccionTitulo: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tabla: { borderWidth: 0.75, borderColor: BORDER, borderRadius: 3, overflow: "hidden" },
  filaEncabezado: { flexDirection: "row", paddingVertical: 3.25, paddingHorizontal: 9.5, backgroundColor: CARD },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3.25,
    paddingHorizontal: 9.5,
    fontSize: 9,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
  },
  encabezadoTexto: { fontSize: 7.25, fontFamily: "Helvetica-Bold", color: ACCENT, textTransform: "uppercase" },
  celdaSimbolo: { fontFamily: "Helvetica-Bold" },
  celdaDerecha: { textAlign: "right" },
  celdaMuted: { color: MUTED },
  celdaVariacionCont: { alignItems: "flex-end" },
  chip: { fontFamily: "Helvetica-Bold", borderRadius: 6, paddingHorizontal: 4.75, paddingVertical: 1.85 },
  sinDatos: { fontSize: 8.25, color: MUTED, fontStyle: "italic", paddingVertical: 4 },
  grid2: { flexDirection: "row", gap: 9.5 },
  grid2Col: { flex: 1, minWidth: 0 },
  resumenCaja: {
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
    backgroundColor: CARD,
    paddingVertical: 5.25,
    paddingHorizontal: 9.5,
    lineHeight: 1.33,
  },
  resumenParrafoSiguiente: { marginTop: 5 },
  tarjetasFila: { flexDirection: "row", gap: 5.5 },
  tarjetaDolar: {
    flex: 1,
    minWidth: 0,
    borderRadius: 3,
    borderWidth: 0.75,
    borderColor: BORDER,
    borderTopWidth: 2,
    borderTopColor: ACCENT,
    backgroundColor: CARD,
    paddingVertical: 4,
    paddingHorizontal: 6.5,
  },
  tarjetaDolarNombre: { fontSize: 6.75, color: MUTED, textTransform: "uppercase", letterSpacing: 0.3 },
  tarjetaDolarCompra: { fontSize: 7.75, color: MUTED, marginTop: 2 },
  tarjetaDolarVenta: { fontSize: 10, fontFamily: "Helvetica-Bold", color: ACCENT, marginTop: 1 },
  tarjetaIndice: {
    flex: 1,
    minWidth: 0,
    borderRadius: 3,
    borderWidth: 0.75,
    borderColor: BORDER,
    borderTopWidth: 2,
    borderTopColor: ACCENT,
    backgroundColor: CARD,
    paddingVertical: 4.5,
    paddingHorizontal: 7.5,
  },
  tarjetaIndiceNombre: { fontSize: 7.75, color: MUTED, fontFamily: "Helvetica-Bold" },
  tarjetaIndiceValor: { fontSize: 11, fontFamily: "Helvetica-Bold", color: TEXT, marginTop: 2 },
  tarjetaIndiceVariacion: { alignSelf: "flex-start", fontSize: 7.75, marginTop: 3 },
  curvaColumna: { flex: 1, minWidth: 0 },
  curvaCaja: { borderWidth: 0.75, borderColor: BORDER, borderRadius: 3, backgroundColor: CARD, padding: 5 },
  curvaTitulo: { fontSize: 10, fontFamily: "Helvetica-Bold", color: ACCENT, marginBottom: 4 },
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
            Monitor<Text style={styles.marcaPunto}>.</Text>
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
function TituloSeccion({ titulo }: { titulo: string }) {
  return (
    <View style={{ marginBottom: 4 }}>
      <View style={styles.tituloFila}>
        <View style={styles.tituloBarra} />
        <Text style={styles.seccionTitulo}>{titulo}</Text>
      </View>
    </View>
  );
}

/**
 * El resumen apunta a 200-240 palabras (~1300-1600 caracteres): con eso entra
 * con letra grande, aprovechando el espacio que deja el resto de la página.
 * Los umbrales de más arriba son solo un resguardo por si el modelo se
 * extiende de más, para que igual entre en una sola página.
 */
function tamañoAdaptativo(longitud: number): { fontSize: number; lineHeight: number } {
  if (longitud > 2200) return { fontSize: 8.25, lineHeight: 1.31 };
  if (longitud > 1700) return { fontSize: 9, lineHeight: 1.33 };
  if (longitud > 1200) return { fontSize: 10, lineHeight: 1.36 };
  return { fontSize: 10.75, lineHeight: 1.41 };
}

function ResumenDia({ resumen }: { resumen: ResumenIA }) {
  const parrafos = resumen.texto.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const tamaño = tamañoAdaptativo(resumen.texto.length);

  return (
    <View style={styles.seccion}>
      <TituloSeccion titulo="Resumen del día" />
      <View style={[styles.resumenCaja, tamaño]}>
        {parrafos.map((parrafo, i) => (
          <Text key={i} style={i > 0 ? styles.resumenParrafoSiguiente : undefined}>
            {parrafo.trim()}
          </Text>
        ))}
      </View>
    </View>
  );
}

function SinDatos({ error }: { error: string | null }) {
  return <Text style={styles.sinDatos}>{error ?? "Sin datos disponibles."}</Text>;
}

/** Simplificada a propósito: solo símbolo/cierre/variación — la descripción y la cantidad de operaciones no entraban en letra grande sin apretar la fila. */
function TablaCotizaciones({ resultado }: { resultado: Resultado<FilaCotizacion[]> }) {
  const { datos, error } = resultado;

  if (!datos || datos.length === 0) return <SinDatos error={error} />;

  return (
    <View style={styles.tabla}>
      <View style={styles.filaEncabezado}>
        <Text style={[styles.encabezadoTexto, { width: "34%" }]}>Símbolo</Text>
        <Text style={[styles.encabezadoTexto, styles.celdaDerecha, { width: "33%" }]}>Cierre</Text>
        <Text style={[styles.encabezadoTexto, styles.celdaDerecha, { width: "33%" }]}>Var.</Text>
      </View>
      {datos.map((item, i) => (
        <View key={item.simbolo} style={[styles.fila, i % 2 === 1 ? { backgroundColor: ZEBRA } : undefined]} wrap={false}>
          <Text style={[styles.celdaSimbolo, { width: "34%" }]}>{item.simbolo}</Text>
          <Text style={[styles.celdaDerecha, { width: "33%" }]}>
            {item.ultimoPrecio !== null ? formatPrice(item.ultimoPrecio) : "-"}
          </Text>
          <View style={[styles.celdaVariacionCont, { width: "33%" }]}>
            <VariacionChip variacion={item.variacionPorcentual} />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Los 5 más operados (mayor cantidad de operaciones) de un panel de IOL;
 * `null` si no hay datos. Se ordena por `cantidadOperaciones`, no por
 * `volumen`: IOL solo informa el volumen operado en vivo y lo vuelve 0 con
 * el mercado cerrado, mientras que la cantidad de operaciones del día sigue
 * reflejando el total real después del cierre (que es cuando corre el
 * reporte).
 */
function top5PorOperaciones(datos: FilaCotizacion[] | null): FilaCotizacion[] | null {
  if (!datos) return null;
  return [...datos]
    .filter((item) => item.cantidadOperaciones !== null && item.cantidadOperaciones !== undefined)
    .sort((a, b) => (b.cantidadOperaciones as number) - (a.cantidadOperaciones as number))
    .slice(0, 5);
}

/** Las 5 más operadas por volumen en USDT (Binance no informa cantidad de operaciones del día, a diferencia de IOL — ver `top5PorOperaciones`). */
function top5PorVolumen(datos: FilaCotizacion[] | null): FilaCotizacion[] | null {
  if (!datos) return null;
  return [...datos]
    .filter((item) => item.volumen !== null && item.volumen !== undefined)
    .sort((a, b) => (b.volumen as number) - (a.volumen as number))
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

/** Cards compactas de símbolo/valor/variación, una fila a lo ancho de la página — hoy solo las usa Índices. */
function TarjetasCotizacion({ resultado }: { resultado: Resultado<FilaCotizacion[]> }) {
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
const CURVA_ALTO = 102;
const CURVA_PAD_IZQ = 29;
const CURVA_PAD_DER = 10;
const CURVA_PAD_ARRIBA = 13;
const CURVA_PAD_ABAJO = 12.5;
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
 * valuación relativa. Sin tabla de detalle ni leyenda de stats debajo (a
 * propósito): el reporte queda solo con la lectura visual, cada punto ya
 * lleva su ticker.
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
              <Text x={CURVA_PAD_IZQ - 5} y={y + 2.65} textAnchor="end" style={{ fontSize: 7.25, fill: MUTED }}>
                {valor.toFixed(1)}%
              </Text>
            </G>
          ))}

          <Path d={curvaPath} fill="none" stroke={ACCENT} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

          {coords.map((c) => (
            <G key={c.ticker}>
              <Circle cx={c.cx} cy={c.cy} r={4.15} fill={c.barato ? TEXT : MUTED} stroke={BG} strokeWidth={1.35} />
              <Text x={c.cx} y={c.cy - 8.75} textAnchor="middle" style={{ fontSize: 7.25, fill: TEXT, fontFamily: "Helvetica-Bold" }}>
                {c.ticker}
              </Text>
            </G>
          ))}
        </Svg>
      </View>
    </View>
  );
}

/**
 * Reporte de cierre en una sola página: dólares (tarjetas) → resumen del día
 * con IA (noticias + rueda) → índices (tarjetas) → top 5 de Panel Líder y
 * CEDEARs (tablas, por cantidad de operaciones) → curvas de rendimiento de
 * bonos (sin leyenda de stats abajo, ver `CurvaBonosPdf`) → top 5 de
 * criptomonedas (por volumen) y commodities completo, mismo formato
 * simplificado (símbolo/cierre/variación) en todas las tablas. Riesgo país
 * va en el encabezado, no acá (ver `Encabezado`). El resto de los paneles de
 * la home (caución, letras, bonos CER, etc.) no entran en este formato
 * compacto.
 * Misma paleta e identidad visual que el sitio (fondo negro, acento celeste,
 * verde/rojo solo para variaciones de precio) en vez de un esquema propio
 * "para papel".
 */
export function ReporteCierreDocument({ datos, resumen }: { datos: DatosReporte; resumen: ResumenIA | null }) {
  const bonosSheet = datos.bonosSheet.datos ?? [];

  return (
    <Document
      title={`Reporte de cierre - ${datos.generadoEn.toLocaleDateString("es-AR")}`}
      author="Monitor"
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
          <TarjetasCotizacion resultado={datos.indices} />
        </View>

        <View style={styles.seccion}>
          <View style={styles.grid2}>
            <View style={styles.grid2Col}>
              <TituloSeccion titulo="Top 5 — Panel Líder" />
              <TablaCotizaciones
                resultado={{ datos: top5PorOperaciones(datos.panelLider.datos), error: datos.panelLider.error }}
              />
            </View>
            <View style={styles.grid2Col}>
              <TituloSeccion titulo="Top 5 — CEDEARs" />
              <TablaCotizaciones
                resultado={{ datos: top5PorOperaciones(datos.cedears.datos), error: datos.cedears.error }}
              />
            </View>
          </View>
        </View>

        <View style={styles.seccion}>
          <View style={styles.grid2}>
            <CurvaBonosPdf filas={bonosSheet} seccion="ley local" titulo="Curva de bonos — Ley local" />
            <CurvaBonosPdf filas={bonosSheet} seccion="ley new york" titulo="Curva de bonos — Ley extranjera" />
          </View>
        </View>

        <View style={styles.seccion}>
          <View style={styles.grid2}>
            <View style={styles.grid2Col}>
              <TituloSeccion titulo="Top 5 — Criptomonedas" />
              <TablaCotizaciones resultado={{ datos: top5PorVolumen(datos.criptos.datos), error: datos.criptos.error }} />
            </View>
            <View style={styles.grid2Col}>
              <TituloSeccion titulo="Commodities" />
              <TablaCotizaciones resultado={datos.commodities} />
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
