import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { BcraVariable } from "@/lib/bcra/types";
import type { Dolar } from "@/lib/dolarapi/types";
import { formatPercent, formatPrice } from "@/lib/format";
import type { DatosReporte, Resultado } from "@/lib/reportes/datosReporte";
import type { ResumenIA } from "@/lib/reportes/resumenIA";
import type { FilaCotizacion, FilaIndicador } from "@/lib/types";

// Versión más oscura del celeste del sitio (`--accent`, #8ECAE6): sobre fondo
// blanco impreso el tono original del sitio queda muy pálido para texto,
// así que acá se usa solo un acento más saturado, no la misma variable.
const ACCENT = "#1E6E8C";
const ACCENT_SOFT = "#EAF4F8";
const TEXT = "#171717";
const MUTED = "#6B6B6B";
const BORDER = "#DEDEDE";
const POSITIVO = "#0F7B4C";
const NEGATIVO = "#C0392B";

const styles = StyleSheet.create({
  page: {
    paddingTop: 64,
    paddingBottom: 44,
    paddingHorizontal: 32,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: TEXT,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderBottomWidth: 1.5,
    borderBottomColor: ACCENT,
  },
  marca: { fontSize: 15, fontFamily: "Helvetica-Bold" },
  marcaPunto: { color: ACCENT },
  subMarca: { fontSize: 8, color: MUTED, marginTop: 2 },
  headerDerecha: { alignItems: "flex-end" },
  headerTitulo: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  headerFecha: { fontSize: 8, color: MUTED, marginTop: 2 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingTop: 8,
    paddingBottom: 18,
    borderTopWidth: 0.75,
    borderTopColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerTexto: { fontSize: 7, color: MUTED, maxWidth: 420 },
  seccion: { marginTop: 14 },
  seccionTitulo: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  seccionSubtitulo: { fontSize: 8, color: MUTED, marginTop: 1, marginBottom: 6 },
  tabla: { borderWidth: 0.75, borderColor: BORDER, borderRadius: 3, overflow: "hidden" },
  filaEncabezado: { flexDirection: "row", backgroundColor: ACCENT_SOFT, paddingVertical: 4, paddingHorizontal: 6 },
  fila: {
    flexDirection: "row",
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
  },
  encabezadoTexto: { fontSize: 7, fontFamily: "Helvetica-Bold", color: ACCENT, textTransform: "uppercase" },
  celdaSimbolo: { fontFamily: "Helvetica-Bold" },
  celdaDerecha: { textAlign: "right" },
  celdaMuted: { color: MUTED },
  sinDatos: { fontSize: 8, color: MUTED, fontStyle: "italic", paddingVertical: 4 },
  destacada: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: ACCENT_SOFT,
    borderWidth: 0.75,
    borderColor: ACCENT,
    borderRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  destacadaLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: ACCENT, textTransform: "uppercase" },
  destacadaFecha: { fontSize: 7, color: MUTED, marginTop: 1 },
  destacadaValor: { fontSize: 13, fontFamily: "Helvetica-Bold", color: ACCENT },
  grid2: { flexDirection: "row", gap: 10 },
  grid2Col: { flex: 1 },
  banner: {
    marginTop: 4,
    backgroundColor: "#F5F5F5",
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: 7.5,
    color: MUTED,
  },
  bannerFuerte: { fontFamily: "Helvetica-Bold", color: TEXT },
  resumenCaja: {
    borderWidth: 0.75,
    borderColor: BORDER,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 9,
    lineHeight: 1.45,
  },
  resumenParrafoSiguiente: { marginTop: 6 },
  resumenFuentes: { fontSize: 7, color: MUTED, marginTop: 4 },
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

function formatFechaCorta(fechaISO: string): string {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
}

function formatValorMacro({ unidadExpresion, moneda, ultValorInformado }: BcraVariable): string {
  if (unidadExpresion.toLowerCase().includes("porcentaje")) return `${formatPrice(ultValorInformado)}%`;
  // Valor de índice (ej. UVA): no es ni un porcentaje ni un monto en pesos/dólares.
  if (unidadExpresion.toLowerCase().includes("índice")) return formatPrice(ultValorInformado);
  const prefijo = moneda === "ME" ? "US$" : "$";
  return `${prefijo} ${formatPrice(ultValorInformado)} M`;
}

function Encabezado({ generadoEn, fechaCierre }: { generadoEn: Date; fechaCierre: Date }) {
  return (
    <View style={styles.header} fixed>
      <View>
        <Text style={styles.marca}>
          Cotizaciones<Text style={styles.marcaPunto}>.</Text>
        </Text>
        <Text style={styles.subMarca}>Cierre del {formatFechaCierre(fechaCierre)}</Text>
      </View>
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
        Información con fines de referencia, no constituye asesoramiento financiero. Fuentes al pie del sitio.
      </Text>
      <Text
        style={styles.footerTexto}
        render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
      />
    </View>
  );
}

function ResumenRueda({ resumen }: { resumen: ResumenIA }) {
  const parrafos = resumen.texto.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  return (
    <View style={styles.seccion}>
      <Text style={styles.seccionTitulo}>Mini informe de la rueda</Text>
      <Text style={styles.seccionSubtitulo}>
        Redactado por IA ({resumen.modelo}) a partir de los datos de cierre{resumen.titulares > 0 ? ` y ${resumen.titulares} titulares de prensa del día` : ""}; puede contener errores.
      </Text>
      <View style={styles.resumenCaja}>
        {parrafos.map((parrafo, i) => (
          <Text key={i} style={i > 0 ? styles.resumenParrafoSiguiente : undefined}>
            {parrafo.trim()}
          </Text>
        ))}
      </View>
      {resumen.fuentes.length > 0 && (
        <Text style={styles.resumenFuentes}>Prensa consultada: {resumen.fuentes.join(", ")}.</Text>
      )}
    </View>
  );
}

function SinDatos({ error }: { error: string | null }) {
  return <Text style={styles.sinDatos}>{error ?? "Sin datos disponibles."}</Text>;
}

function Banner({ children }: { children: ReactNode }) {
  return (
    <View style={styles.banner}>
      <Text>{children}</Text>
    </View>
  );
}

function TablaCotizaciones({ resultado }: { resultado: Resultado<FilaCotizacion[]> }) {
  const { datos, error } = resultado;

  if (!datos || datos.length === 0) return <SinDatos error={error} />;

  return (
    <View style={styles.tabla}>
      <View style={styles.filaEncabezado}>
        <Text style={[styles.encabezadoTexto, { width: "16%" }]}>Símbolo</Text>
        <Text style={[styles.encabezadoTexto, { width: "54%" }]}>Descripción</Text>
        <Text style={[styles.encabezadoTexto, styles.celdaDerecha, { width: "15%" }]}>Cierre</Text>
        <Text style={[styles.encabezadoTexto, styles.celdaDerecha, { width: "15%" }]}>Var.</Text>
      </View>
      {datos.map((item) => (
        <View key={item.simbolo} style={styles.fila} wrap={false}>
          <Text style={[styles.celdaSimbolo, { width: "16%" }]}>{item.simbolo}</Text>
          <Text style={[styles.celdaMuted, { width: "54%" }]}>{item.descripcion}</Text>
          <Text style={[styles.celdaDerecha, { width: "15%" }]}>
            {item.ultimoPrecio !== null ? formatPrice(item.ultimoPrecio) : "-"}
          </Text>
          <Text
            style={[
              styles.celdaDerecha,
              { width: "15%" },
              item.variacionPorcentual === null
                ? styles.celdaMuted
                : item.variacionPorcentual > 0
                  ? { color: POSITIVO }
                  : item.variacionPorcentual < 0
                    ? { color: NEGATIVO }
                    : undefined,
            ]}
          >
            {item.variacionPorcentual !== null ? formatPercent(item.variacionPorcentual) : "-"}
          </Text>
        </View>
      ))}
    </View>
  );
}

function TablaCaucion({ resultado }: { resultado: Resultado<FilaCotizacion[]> }) {
  const { datos, error } = resultado;

  if (!datos || datos.length === 0) return <SinDatos error={error} />;

  return (
    <View style={styles.tabla}>
      <View style={styles.filaEncabezado}>
        <Text style={[styles.encabezadoTexto, { width: "22%" }]}>Plazo</Text>
        <Text style={[styles.encabezadoTexto, { width: "58%" }]}>Detalle</Text>
        <Text style={[styles.encabezadoTexto, styles.celdaDerecha, { width: "20%" }]}>Tasa (TNA)</Text>
      </View>
      {datos.map((item) => (
        <View key={item.simbolo} style={styles.fila} wrap={false}>
          <Text style={[styles.celdaSimbolo, { width: "22%" }]}>{item.simbolo}</Text>
          <Text style={[styles.celdaMuted, { width: "58%" }]}>{item.descripcion}</Text>
          <Text style={[styles.celdaDerecha, { width: "20%" }]}>
            {item.ultimoPrecio !== null ? `${formatPrice(item.ultimoPrecio)}%` : "-"}
          </Text>
        </View>
      ))}
    </View>
  );
}

function TablaDolares({ resultado }: { resultado: Resultado<Dolar[]> }) {
  const { datos, error } = resultado;

  if (!datos || datos.length === 0) return <SinDatos error={error} />;

  return (
    <View style={styles.tabla}>
      <View style={styles.filaEncabezado}>
        <Text style={[styles.encabezadoTexto, { width: "40%" }]}>Tipo</Text>
        <Text style={[styles.encabezadoTexto, styles.celdaDerecha, { width: "30%" }]}>Compra</Text>
        <Text style={[styles.encabezadoTexto, styles.celdaDerecha, { width: "30%" }]}>Venta</Text>
      </View>
      {datos.map((dolar) => (
        <View key={dolar.casa} style={styles.fila} wrap={false}>
          <Text style={[styles.celdaSimbolo, { width: "40%" }]}>{dolar.nombre}</Text>
          <Text style={[styles.celdaDerecha, { width: "30%" }]}>${formatPrice(dolar.compra)}</Text>
          <Text style={[styles.celdaDerecha, { width: "30%" }]}>${formatPrice(dolar.venta)}</Text>
        </View>
      ))}
    </View>
  );
}

function TablaIndicadoresMacro({ resultado }: { resultado: Resultado<BcraVariable[]> }) {
  const { datos, error } = resultado;

  if (!datos || datos.length === 0) return <SinDatos error={error} />;

  return (
    <View style={styles.tabla}>
      <View style={styles.filaEncabezado}>
        <Text style={[styles.encabezadoTexto, { width: "58%" }]}>Indicador</Text>
        <Text style={[styles.encabezadoTexto, { width: "17%" }]}>Fecha</Text>
        <Text style={[styles.encabezadoTexto, styles.celdaDerecha, { width: "25%" }]}>Valor</Text>
      </View>
      {datos.map((variable) => (
        <View key={variable.idVariable} style={styles.fila} wrap={false}>
          <Text style={{ width: "58%" }}>{variable.descripcion.replace(/\.$/, "")}</Text>
          <Text style={[styles.celdaMuted, { width: "17%" }]}>{formatFechaCorta(variable.ultFechaInformada)}</Text>
          <Text style={[styles.celdaDerecha, { width: "25%" }]}>{formatValorMacro(variable)}</Text>
        </View>
      ))}
    </View>
  );
}

function TablaIndicadores({ resultado }: { resultado: Resultado<FilaIndicador[]> }) {
  const { datos, error } = resultado;

  if (!datos || datos.length === 0) return <SinDatos error={error} />;

  return (
    <View style={styles.tabla}>
      <View style={styles.filaEncabezado}>
        <Text style={[styles.encabezadoTexto, { width: "58%" }]}>Indicador</Text>
        <Text style={[styles.encabezadoTexto, { width: "17%" }]}>Fecha</Text>
        <Text style={[styles.encabezadoTexto, styles.celdaDerecha, { width: "25%" }]}>Valor</Text>
      </View>
      {datos.map((indicador) => (
        <View key={indicador.nombre} style={styles.fila} wrap={false}>
          <Text style={{ width: "58%" }}>{indicador.nombre}</Text>
          <Text style={[styles.celdaMuted, { width: "17%" }]}>{indicador.fecha || "-"}</Text>
          <Text style={[styles.celdaDerecha, { width: "25%" }]}>{indicador.valor}</Text>
        </View>
      ))}
    </View>
  );
}

function Destacada({ label, valor, detalle }: { label: string; valor: string; detalle: string }) {
  return (
    <View style={styles.destacada}>
      <View>
        <Text style={styles.destacadaLabel}>{label}</Text>
        <Text style={styles.destacadaFecha}>{detalle}</Text>
      </View>
      <Text style={styles.destacadaValor}>{valor}</Text>
    </View>
  );
}

function Seccion({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.seccion}>
      <Text style={styles.seccionTitulo}>{titulo}</Text>
      {subtitulo && <Text style={styles.seccionSubtitulo}>{subtitulo}</Text>}
      {!subtitulo && <View style={{ marginBottom: 6 }} />}
      {children}
    </View>
  );
}

/**
 * Plantilla fija del reporte de cierre: mismo orden de secciones que la
 * home (dólares, caución + macro AR/EE.UU. primero, después el resto de los
 * paneles), para que sea un espejo en PDF de lo que ya se ve en el sitio.
 */
export function ReporteCierreDocument({ datos, resumen }: { datos: DatosReporte; resumen: ResumenIA | null }) {
  return (
    <Document
      title={`Reporte de cierre - ${datos.generadoEn.toLocaleDateString("es-AR")}`}
      author="Cotizaciones"
    >
      <Page size="A4" style={styles.page}>
        <Encabezado generadoEn={datos.generadoEn} fechaCierre={datos.fechaCierre} />
        <Pie />

        <Banner>
          <Text style={styles.bannerFuerte}>Todos los valores son de cierre</Text>, no cotizaciones en vivo: el
          panel líder, bonos, letras, CEDEARs, índices y commodities muestran el último cierre real de cada
          mercado, sin importar la hora a la que se generó este reporte.
        </Banner>

        {resumen && <ResumenRueda resumen={resumen} />}

        <Seccion titulo="Dólares" subtitulo="Última cotización disponible: el dólar no tiene un cierre formal.">
          <TablaDolares resultado={datos.dolares} />
        </Seccion>

        <View style={[styles.grid2, styles.seccion]}>
          <View style={styles.grid2Col}>
            <Text style={styles.seccionTitulo}>Indicadores macro Argentina</Text>
            <View style={{ marginBottom: 6 }} />
            {datos.riesgoPais.datos && (
              <Destacada
                label="Riesgo país"
                valor={`${datos.riesgoPais.datos.valor.toLocaleString("es-AR")} pb`}
                detalle={`Al ${formatFechaCorta(datos.riesgoPais.datos.fecha)}`}
              />
            )}
            <TablaIndicadoresMacro resultado={datos.macroAr} />
          </View>

          <View style={styles.grid2Col}>
            <Text style={styles.seccionTitulo}>Indicadores macro EE.UU.</Text>
            <View style={{ marginBottom: 6 }} />
            {datos.vix.datos && (
              <Destacada label={datos.vix.datos.nombre} valor={datos.vix.datos.valor} detalle="Volatilidad (VIX)" />
            )}
            <TablaIndicadores resultado={datos.macroUsa} />
          </View>
        </View>

        <Seccion titulo="Caución" subtitulo="Tasa promedio operada (TNA), en pesos y en dólares.">
          <TablaCaucion resultado={datos.caucion} />
        </Seccion>

        <Seccion titulo="Panel Líder" subtitulo="Acciones argentinas del Merval.">
          <TablaCotizaciones resultado={datos.panelLider} />
        </Seccion>

        <Seccion
          titulo="Bonos soberanos en dólares (MEP)"
          subtitulo="Bonares, Globales, Discount, Par y Bonos del Tesoro en USD, liquidación MEP."
        >
          <TablaCotizaciones resultado={datos.bonosMep} />
        </Seccion>

        <Seccion titulo="Letras" subtitulo="LECAPs y LECER del Tesoro Nacional en pesos.">
          <TablaCotizaciones resultado={datos.letras} />
        </Seccion>

        <Seccion titulo="Bonos CER" subtitulo="Deuda del Tesoro Nacional en pesos ajustada por CER.">
          <TablaCotizaciones resultado={datos.bonosCer} />
        </Seccion>

        <Seccion titulo="CEDEARs principales" subtitulo="Los CEDEARs más operados del día.">
          <TablaCotizaciones resultado={datos.cedears} />
        </Seccion>

        <Seccion titulo="Índices americanos" subtitulo="S&P 500, Dow Jones, Nasdaq y Russell 2000.">
          <TablaCotizaciones resultado={datos.indices} />
        </Seccion>

        <Seccion titulo="Commodities" subtitulo="Oro, petróleo WTI, soja, maíz y trigo.">
          <TablaCotizaciones resultado={datos.commodities} />
        </Seccion>

        <Seccion titulo="Criptomonedas" subtitulo="Precio en USD — mercado 24hs, sin cierre formal.">
          <TablaCotizaciones resultado={datos.criptos} />
        </Seccion>
      </Page>
    </Document>
  );
}
