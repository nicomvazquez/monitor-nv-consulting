## Cotizaciones IOL

App Next.js que consulta la API de [IOL invertirOnline](https://api.invertironline.com) desde el servidor y muestra, en un dashboard blanco y negro con detalles en celeste (ver [Paleta de colores](#paleta-de-colores)), distintos paneles de mercado — todos con la misma tabla (Símbolo / Último / Variación) — dispuestos en grilla para ver la mayor cantidad posible juntas. Header y footer viven en el layout raíz, así que son compartidos por todas las páginas del sitio (hoy: la home y `/calculadora-bonos`).

La home se divide en una barra lateral izquierda (caución + indicadores macro de Argentina y de EE.UU.) y el contenido principal a la derecha (el resto de las tablas), en un orden fijo: Panel Líder, Bonos MEP, Letras, Bonos CER, CEDEARs, Índices americanos, Commodities y Criptomonedas. Para cambiar el orden alcanza con reordenar los bloques en `app/page.tsx` — no hay drag-and-drop ni persistencia en `localStorage` (se probó y se sacó; ver Notas de diseño).

Secciones disponibles en la home:

- **Header**: sticky, con el logo, el título, la navegación a las demás páginas y el carrusel de dólares integrado (no es una sección más de la página, vive en el layout raíz).
- **Dólares**: carrusel de tarjetas con compra/venta de cada tipo de dólar (oficial, blue, bolsa/MEP, CCL, mayorista, cripto, tarjeta), vía [dolarapi.com](https://dolarapi.com) — no es parte de la API de IOL. Gira solo, sin JS (animación CSS), y se pausa al pasar el mouse.
- **Indicadores macro** *(barra lateral)*: riesgo país (tarjeta resaltada, vía [ArgentinaDatos](https://api.argentinadatos.com)) más reservas internacionales, inflación mensual e interanual, tasa de política monetaria, tasa BADLAR de bancos privados y base monetaria, vía la [API del BCRA](https://api.bcra.gob.ar), y UVA (también de ArgentinaDatos) — ninguna de las tres es de IOL.
- **Indicadores macro EE.UU.** *(barra lateral)*: espejo del panel anterior pero para EE.UU. — VIX (tarjeta resaltada, vía Yahoo Finance) más tasa de la Fed, inflación interanual (CPI), desempleo, oferta monetaria (M2), PBI trimestral y el rendimiento del bono del Tesoro a 10 años (la "tasa libre de riesgo" de referencia global), vía [FRED](https://fred.stlouisfed.org) (API del banco central de EE.UU., requiere una API key gratuita).
- **Caución** *(barra lateral)*: la tasa promedio operada a 1, 7 y 14 días, en pesos y en dólares (una fila por combinación, ordenadas por plazo). Se muestra como lista compacta, con el mismo formato que los indicadores macro (no la tabla con columnas de los demás paneles).
- **Descargar reporte (PDF)** *(barra lateral, arriba de Caución)*: genera y descarga un PDF de una plantilla fija con todos los paneles de la home (ver [Reporte de cierre en PDF](#reporte-de-cierre-en-pdf)).
- **Criptomonedas**: BTC, ETH, BNB, XRP, SOL y ADA en USD, actualizadas en vivo por WebSocket de Binance (no polling) — tampoco es de IOL.
- **Panel Líder**: acciones argentinas del panel líder (Merval).
- **CEDEARs principales**: los CEDEARs más operados del día (por `cantidadOperaciones`).
- **Índices americanos**: S&P 500, Dow Jones, Nasdaq Composite y Russell 2000 — vía Yahoo Finance, no de IOL (que solo expone acciones/ETFs/bonos/monedas de EE.UU., sin un instrumento de índices). El VIX no está acá: vive en "Indicadores macro EE.UU." (es un gauge de riesgo, no un índice bursátil).
- **Commodities**: oro, petróleo WTI, soja, maíz y trigo (futuros, vía Yahoo Finance) — soja/maíz/trigo en vez de una selección genérica, por su peso en las exportaciones argentinas.
- **Bonos soberanos en dólares (MEP)**: Bonares (AL), Globales (GD), Discount (AE), Par (PAY) y Bonos del Tesoro en USD (AN, AO), solo liquidación MEP (se excluye la liquidación dólar cable/CCL).
- **Letras**: LECAPs y LECER del Tesoro Nacional en pesos (excluye pagarés/cheques privados, letras provinciales y dollar-linked).
- **Bonos CER**: Boncer y demás deuda del Tesoro Nacional en pesos ajustada por CER.

En `/calculadora-bonos`:

- **Curvas de rendimientos — Ley local / Ley extranjera**: debajo de la tabla, una al lado de la otra, TIR vs. duration de cada sección de la hoja (SVG a mano, sin librería de gráficos), con la curva de regresión ajustada (no solo une los puntos), cada bono marcado en un color según rinda por encima o por debajo de esa curva (relativamente barato/caro para su duration), y estadísticas del ajuste (R², TIR promedio, desvío estándar, cantidad de bonos baratos/caros). Mismo borde (`rounded-lg border border-border/60`) que usan las tablas de cotizaciones.
- **Bonos en dólares**: precio, TIR, próximo pago, duration y convexidad de Bonares/Globales, agrupados por "ley local" / "ley new york" — vía una hoja de Google Sheets del usuario (compartida como "cualquiera con el link puede ver"), no de IOL ni de ninguna otra API.

### Estructura

```
src/
  app/
    page.tsx                     # Home: pide todo, arma la barra lateral (macro + caución) y el grid reordenable
    layout.tsx                   # Fuentes, paleta de colores, y el Header/Footer compartidos (pide dólares acá)
    globals.css                   # Tokens de color (--color-background/--color-accent/...) y @keyframes marquee
    calculadora-bonos/
      page.tsx                    # Curva + tabla de referencia (hoja de Google Sheets); la calculadora interactiva viene después
    api/
      reporte-cierre/
        route.ts                  # GET: devuelve el reporte guardado del último cierre (o lo genera si falta)
      cron/reporte-cierre/
        route.ts                  # GET protegido con CRON_SECRET: genera y guarda el reporte del día
  components/
    layout/
      Header.tsx                  # Header sticky: logo (linkea a "/") + nav + carrusel de dólares embebido
      Footer.tsx                   # Marca + navegación + contacto, créditos de fuentes, disclaimer y copyright
      Logo.tsx                     # `next/image` de public/logo.png, compartido por Header (priority) y Footer
      NavLink.tsx                  # "use client": Link que se resalta en accent cuando la ruta actual coincide
      Sidebar.tsx                  # Barra lateral izquierda de la home: caución + indicadores macro (misma altura de fila)
    ui/
      ErrorMessage.tsx             # Marca de error compartida por todas las secciones (evita repetir el mismo div 4 veces)
    bonos/                         # UI de la hoja de bonos de Google Sheets, en /calculadora-bonos
      BonosCurvaSection.tsx         # Header + estado de error + gráfico (título/sección configurables: se usa 2 veces)
      BonosCurvaChart.tsx            # SVG a mano, con borde igual al de las tablas: TIR vs. duration + curva de
                                      # regresión + estadísticas (usa lib/regresion.ts)
      BonosSheetSection.tsx         # Header + estado de error + tabla
      BonosSheetTable.tsx            # Tabla con sub-encabezados de sección ("Ley local"/"Ley new york")
    cotizaciones/                # UI compartida por todos los paneles de cotizaciones
      PanelSection.tsx           # Tarjeta de dashboard: título + estado de error + tabla de un panel
      CotizacionesTable.tsx      # Tabla Símbolo/Último/Variación/Volumen (recibe FilaCotizacion[])
      VariacionBadge.tsx
    caucion/                      # UI de la caución, como lista compacta (no la tabla del resto de paneles)
      CaucionSection.tsx           # Mismo patrón que PanelSection/MacroSection: header + lista, sin tarjeta envolvente
      CaucionList.tsx               # Filas símbolo+tasa, igual formato visual que MacroCard
    dolares/                     # UI de las tarjetas de dólar (dolarapi.com), usadas dentro del Header
      DolaresCarousel.tsx         # Loop infinito por CSS (@keyframes marquee en globals.css)
      DolarCard.tsx
    cryptos/
      CryptoLivePanel.tsx          # "use client": arranca en `inicial` y se actualiza por WebSocket
    reportes/                    # Reporte de cierre en PDF (ver sección propia más abajo)
      DescargarReporteButton.tsx   # "use client": botón de la barra lateral, pide el PDF y dispara la descarga
      ReporteCierreDocument.tsx    # Plantilla del PDF (primitivas de @react-pdf/renderer, no HTML)
    macro/                        # UI de la lista de indicadores del BCRA + riesgo país
      MacroSection.tsx              # Mismo patrón que PanelSection/CaucionSection: header + lista de filas divididas
      MacroCard.tsx                  # Fila compacta (no tarjeta): label+fecha a la izquierda, valor en mono a la derecha
      RiesgoPaisCard.tsx             # Fila destacada (fondo/borde en el color de acento) que encabeza la lista
    macroUsa/                     # Igual que macro/, pero genérico (FilaIndicador) en vez de atado a BcraVariable
      MacroUsaSection.tsx            # Mismo patrón: header + lista de filas divididas
      IndicadorRow.tsx                # Fila compacta (recibe el valor ya formateado como texto)
      VixRow.tsx                      # Fila destacada que encabeza la lista (equivalente a RiesgoPaisCard)
  lib/
    types.ts              # FilaCotizacion (tablas) y FilaIndicador (paneles tipo lista), sin atarse a ninguna fuente
    format.ts             # Formateo de números/porcentajes/volumen
    csv.ts                # parseCsv(): parser mínimo de CSV (comillas, comas escapadas), sin dependencias externas
    regresion.ts           # ajustarCurva()/r2()/media()/desvioEstandar(): regresión cuadrática por mínimos cuadrados, sin dependencias externas
    iol/                  # Todo lo relacionado a la API de IOL
      config.ts           # URLs base y constantes de panel/instrumento/país
      auth.ts              # Login y cacheo en memoria del access token
      client.ts            # fetch autenticado + revalidación (paneles de acciones/bonos)
      cotizaciones.ts      # getPanelLider(), getCedearsPrincipales(), getBonosSoberanosDolaresMep(), getLetras(), getBonosCer()
      caucion.ts            # getTasasCaucion() (forma propia) + getCaucionesTabla() (aplanada a FilaCotizacion[])
      market-hours.ts      # Horario de rueda + intervalo de revalidación dinámico
      types.ts             # Tipos de las respuestas de IOL
    dolarapi/             # Todo lo relacionado a dolarapi.com (independiente de IOL)
      config.ts            # URL base + intervalo de revalidación
      dolares.ts            # getDolares()
      types.ts              # Tipo de la respuesta
    binance/              # Todo lo relacionado a Binance (independiente de IOL)
      config.ts            # URLs REST/WS, símbolos fijos, nombres
      cryptos.ts             # getCryptosIniciales() — solo la foto inicial server-side
      types.ts               # Tipos de la respuesta REST y del mensaje del WebSocket
    bcra/                 # Todo lo relacionado a la API del BCRA (independiente de IOL)
      config.ts            # URL base, IDs de variable a mostrar, revalidación
      macro.ts               # getIndicadoresMacro()
      types.ts                # Tipo de la respuesta
    argentinadatos/       # Todo lo relacionado a la API de ArgentinaDatos (independiente de IOL)
      config.ts            # URL base + intervalo de revalidación
      riesgoPais.ts          # getRiesgoPais()
      types.ts                # Tipo de la respuesta
    googlesheets/         # Hoja de bonos del usuario, vía su exportación CSV pública (independiente de IOL)
      config.ts             # ID de la hoja, URL de exportación CSV, intervalo de revalidación
      bonos.ts                # getBonosSheet(): descarga el CSV, detecta secciones/encabezado y arma BonoFila[]
      types.ts                 # BonoFila
    yahoofinance/         # Índices americanos, commodities y VIX, vía Yahoo Finance (independiente de IOL)
      config.ts             # Tickers a mostrar (de los tres), User-Agent requerido, intervalo de revalidación
      cotizacion.ts           # getCotizacionYahoo()/getCotizacionesYahoo(): la lógica común (un pedido por símbolo, tolera fallos individuales)
      indices.ts               # getIndicesAmericanos()
      commodities.ts           # getCommodities()
      vix.ts                   # getVix(): igual que los anteriores, pero devuelve un FilaIndicador (va en el panel macro de EE.UU., no en una tabla)
      types.ts                 # Forma de la respuesta de /v8/finance/chart
    fred/                 # Indicadores macro de EE.UU., vía la API del banco central (independiente de IOL)
      config.ts             # URL base + intervalo de revalidación
      macro.ts                # getIndicadoresMacroUsa(): un pedido por serie, tolera fallos individuales (como Yahoo)
      types.ts                 # Forma de la respuesta de /fred/series/observations
    reportes/             # Datos para el reporte de cierre en PDF (junta lo que ya exponen los demás lib/*)
      datosReporte.ts        # getDatosReporte(): pide todo en paralelo, tolera fallos por sección (como app/page.tsx)
      noticias.ts             # getTitulares(): titulares de prensa recientes (RSS de Google Noticias)
      resumenIA.ts            # getResumenIA(): mini informe redactado por Gemini con datos + titulares
  config/
    env.ts               # Lectura validada de variables de entorno
```

`CotizacionesTable` solo pide 4 campos (`FilaCotizacion` en `lib/types.ts`:
símbolo, descripción, último, variación — esta última nullable, para
paneles como caución donde no aplica), no el objeto completo de IOL.
`CotizacionPanelItem` (la respuesta real de la API, con
apertura/máximo/mínimo/puntas/etc.) ya cumple esa forma por estructura, así
que acciones/bonos/CEDEARs se pasan tal cual sin conversión; criptomonedas
y dólares sí arman la fila/tarjeta explícitamente, porque sus fuentes no
tienen nada que ver con la forma de IOL.

Para sumar un panel nuevo alcanza con: una función que devuelva
`FilaCotizacion[]` (de la fuente que sea) y otro `<PanelSection>` en
`app/page.tsx`.

### Configuración

1. Necesitás una cuenta de IOL con la API habilitada (se activa desde Configuración > API en la plataforma) y una API key de [FRED](https://fred.stlouisfed.org/docs/api/api_key.html) (gratis, alta instantánea — crear cuenta y pedirla en esa misma página).
2. Copiá `.env.local.example` a `.env.local` y completá tus credenciales:

   ```
   IOL_USERNAME=tu_usuario
   IOL_PASSWORD=tu_contraseña
   FRED_API_KEY=tu_clave_de_fred
   GEMINI_API_KEY=tu_clave_de_gemini   # opcional: resumen con IA en el reporte PDF
   ```

3. Instalá dependencias y corré en desarrollo:

   ```
   npm install
   npm run dev
   ```

> **Nota sobre los paneles usados:** la API de IOL no publica un listado
> oficial de valores válidos para el parámetro `panel`, y para bonos
> directamente lo ignora (siempre devuelve el universo completo de títulos).
> Se verificó a mano contra la API real que:
> - El Panel Líder de acciones corresponde a `panel: "merval"` (no `"Lideres"`).
> - Para bonos soberanos en dólares no hay filtro de servidor: se pide todo
>   `/api/v2/Cotizaciones/Bonos/.../argentina` y se filtra en
>   `getBonosSoberanosDolaresMep` por `moneda === "US$"`, una lista de
>   prefijos de símbolo conocidos (`SOBERANOS_DOLARES_PREFIJOS` en
>   `src/lib/iol/config.ts`) y el sufijo de liquidación `"D"` (dólar MEP;
>   `"C"` es dólar cable/CCL y se descarta). Si aparece un bono soberano nuevo
>   que no matchea ningún prefijo, agregarlo ahí.
> - CEDEARs no es un instrumento propio sino un panel dentro de "acciones"
>   (`Cotizaciones/acciones/CEDEARs/argentina`, 935 títulos). Se filtra a
>   `moneda === "AR$"` (para no listar cada CEDEAR dos veces, en pesos y en su
>   variante dólar MEP) y se ordena por `cantidadOperaciones` para quedarse
>   con los `CEDEARS_TOP_N` más operados del día.
> - "Letras" es un instrumento propio de la API, distinto de "Bonos"
>   (`Cotizaciones/Letras/Todas/argentina`, 154 títulos). Además de LECAPs y
>   LECER nacionales trae pagarés y cheques de pago diferido privados
>   (símbolos que arrancan con `#`/`*`) y letras provinciales, así que se
>   filtra con el mismo criterio de palabras clave que el resto de la deuda
>   en pesos. Verificado a mano: 11 títulos.
> - "Bonos CER" reutiliza el panel de Bonos (`moneda === "AR$"`), agregando
>   un filtro extra por la palabra "CER" en la descripción
>   (`PESOS_ES_CER` en `src/lib/iol/config.ts`) para quedarse solo con la
>   deuda del Tesoro ajustada por CER (deja afuera TAMAR, tasa fija/dual y
>   los legacy Par/Discount/Cuasipar sin ajuste CER). Verificado a mano: 25
>   títulos. Como los símbolos de deuda en pesos no comparten prefijos
>   reconocibles (a diferencia de la deuda en dólares), tanto Letras como
>   Bonos CER filtran por palabras clave en la descripción
>   (`PESOS_SOBERANO_PALABRAS_CLAVE`) en vez de por prefijo, excluyendo
>   además lo dollar-linked/moneda dual (`PESOS_EXCLUYE_FX`).

> **Nota sobre las cauciones (`lib/iol/caucion.ts`):** usa
> `GET /api/v2/Cotizaciones/cauciones/todas/argentina`, dentro de la misma
> API pública que el resto de la app (se encontró navegando la propia web de
> IOL, que usa esta misma ruta). Devuelve, para cada plazo operado en el
> día, la tasa promedio ponderada de las operaciones (`tasaPromedio`) — es la
> tasa de cierre del día, no un libro de ofertas en vivo, y trae todos los
> plazos en un solo pedido igual que acciones/bonos.
>
> Dos cosas a tener en cuenta:
> - La respuesta no distingue moneda con un campo propio: se infiere por la
>   magnitud de `tasaPromedio` (pesos rinden un orden de magnitud más que
>   dólares hoy — ver `CAUCION_UMBRAL_TASA_PESOS` en `lib/iol/config.ts`).
> - No siempre hay operaciones a exactamente 1 o 7 o 14 días (día a día varía
>   qué plazos se operaron). Si el plazo pedido no tiene dato, se usa el más
>   cercano dentro de `CAUCION_FALLBACK_RADIO_DIAS` días y la fila lo marca
>   en la descripción ("más cercana operada: X días").
> - Este panel oculta la columna Variación (`mostrarVariacion={false}` en
>   `app/page.tsx`), porque no aplica a cauciones.

> **Nota sobre la columna "Último"/"Cierre":** en los paneles de
> acciones/CEDEARs/bonos/letras, muestra `ultimoPrecio` (el precio recién
> operado) mientras el mercado está abierto, y `ultimoCierre` (el precio de
> cierre) cuando está cerrado — en vez de asumir que son el mismo valor una
> vez terminada la rueda. El encabezado de esa columna acompaña, mostrando
> "Último" o "Cierre" según corresponda. Ambos se deciden una sola vez por
> request (`aFila` en `lib/iol/cotizaciones.ts` para el valor, `columnaPrecio`
> en `app/page.tsx` para el título), con el mismo `isMercadoAbierto()` que ya
> gobierna la revalidación.

> **Nota sobre los dólares (`lib/dolarapi/`):** dolarapi.com es un servicio
> público y gratuito, sin autenticación ni credenciales — a diferencia de
> todo lo demás en esta app, no usa la API de IOL ni el `.env.local`. Se
> revalida cada 60s de forma fija (`REVALIDATE_SECONDS_DOLARES` en
> `lib/dolarapi/config.ts`), sin la lógica de horario de mercado del resto
> de la app, porque no depende de una cuota mensual conocida ni de la rueda
> de BYMA (el dólar blue/cripto se mueve fuera de ese horario).
>
> El carrusel (`DolaresCarousel.tsx`) es puro CSS, sin JavaScript ni "use
> client": el track renderiza la lista de tarjetas duplicada una vez y
> `@keyframes marquee` (en `globals.css`) la traslada a `-50%` en loop, lo
> que deja la segunda copia exactamente donde arrancó la primera sin
> importar el ancho real del contenido. Se pausa al pasar el mouse con
> `group-hover:[animation-play-state:paused]`, también sin JS.

> **Nota sobre las criptomonedas (`lib/binance/`, `components/cryptos/`):**
> lista fija (`CRYPTOS_SIMBOLOS` en `lib/binance/config.ts`) — no hay ranking
> por market cap acá, a diferencia del resto de la app; si se quiere agregar
> o sacar una moneda, es ese array. Es el único panel que no usa
> `PanelSection`: `CryptoLivePanel` es un client component que arranca con
> `getCryptosIniciales()` (un `GET /ticker/24hr` de Binance, solo para tener
> algo pintado en el primer render) y apenas monta abre un WebSocket al
> stream combinado `wss://stream.binance.com:9443/stream?streams=btcusdt@ticker/...`
> (gratis, sin auth, sin límite de conexión — a diferencia de la cuota de la
> API de IOL). Cada mensaje trae precio y variación 24h de una moneda; el
> componente actualiza esa fila del estado y listo — no hay revalidación ni
> polling involucrados una vez montado. Si el socket se cae, reintenta solo
> cada 3s (`RECONEXION_MS`).

> **Nota sobre los indicadores macro (`lib/bcra/`):** usa
> `GET /estadisticas/v4.0/monetarias`, que lista las ~1600 series
> monetarias del BCRA y ya trae el último valor informado
> (`ultValorInformado`) y su fecha (`ultFechaInformada`) para cada una — no
> hace falta pedir cada serie por separado. Se filtra a los IDs pedidos
> (`MACRO_IDS` en `lib/bcra/config.ts`; agregar/sacar uno es tocar ese
> array) y se ordena según ese mismo orden.
>
> Tres cosas a tener en cuenta:
> - Son series diarias/mensuales, no algo que valga la pena revisar cada
>   minuto: revalida cada 30 minutos (`REVALIDATE_SECONDS_MACRO`).
> - El id 160 (tasa de política monetaria) no se actualiza desde julio de
>   2025 — verificado a mano contra la API real, no es un bug del código.
>   La tarjeta lo muestra igual, con su fecha ("Al DD/MM/AAAA") a la vista
>   para que quede claro que está desactualizado. Por eso se sumó también el
>   id 139 (BADLAR de bancos privados), que sí sigue actualizándose día a
>   día — verificado contra la API real antes de agregarlo.
> - **UVA no es del BCRA**: `getIndicadoresMacro()` (`lib/bcra/macro.ts`) la
>   pide aparte a ArgentinaDatos (`lib/argentinadatos/uva.ts`) y la arma como
>   si fuera una `BcraVariable` más (con un `idVariable` negativo, `-1`, que
>   nunca va a colisionar con un id real), para que `MacroSection`/`MacroCard`
>   la rendericen sin tocar esos componentes. `formatValor` (en `MacroCard.tsx`
>   y su copia en `ReporteCierreDocument.tsx`) ganó un tercer caso para
>   `unidadExpresion: "índice"` — UVA no es ni un porcentaje ni un monto en
>   pesos/dólares, así que mostrarlo con el formato de cualquiera de esos dos
>   hubiera sido incorrecto. Es best-effort aparte del resto: si ArgentinaDatos
>   falla, el panel de indicadores del BCRA se muestra igual, solo sin esa fila.

> **Nota sobre la tabla de bonos (`lib/googlesheets/`):** lee directamente
> `https://docs.google.com/spreadsheets/d/{ID}/export?format=csv`, la URL de
> exportación pública que expone cualquier hoja compartida como "cualquiera
> con el link puede ver" — sin API key, sin OAuth, sin cuenta de servicio.
> Esa URL sin `gid` siempre trae la primera pestaña de la hoja.
>
> La hoja del usuario no es una tabla simple: son dos bloques ("ley local" /
> "ley new york") separados por filas en blanco, cada uno con su propio
> título de sección y su propia fila de encabezado, con una columna A vacía
> de por medio. `getBonosSheet()` no asume una columna ni una fila fijas:
> busca la celda literal `"ticker"` para ubicar el encabezado de cada bloque
> y usa esa misma columna para leer el resto de los valores de esa sección,
> así que agregar filas a la hoja (o reordenar bonos) no rompe nada. Los
> números vienen en formato argentino ("7,34%", "54,4"): se parsean a mano
> reemplazando la coma decimal antes de `Number()`.
>
> Es una hoja que el usuario edita manualmente de vez en cuando, no
> cotizaciones en vivo — revalida cada 30 minutos
> (`REVALIDATE_SECONDS_BONOS_SHEET`). El ID de la hoja no es una credencial
> (no da acceso de edición a nadie), así que va como constante en
> `lib/googlesheets/config.ts` en vez de en variables de entorno, igual
> criterio que las URLs base del resto de las APIs públicas del proyecto.

> **Nota sobre índices americanos y commodities (`lib/yahoofinance/`):** se
> probó primero si la propia API de IOL tenía índices — no: `estados_Unidos`
> solo trae `Acciones`, `Bonos`, `Etfs` y `Monedas` como instrumento
> (verificado contra el Swagger real de IOL, `GET /v2/swagger`, y contra la
> API en vivo), sin ningún instrumento de índices ni de commodities. Yahoo
> Finance sí los tiene, sin API key, pero con dos particularidades
> verificadas a mano:
> - El endpoint por defecto de `fetch`/`curl` (sin un `User-Agent` de
>   navegador) devuelve 429. Con uno de Chrome funciona sin problema — no
>   hace falta cookies ni ningún otro header.
> - `/v7/finance/quote`, que trae varios símbolos en un solo pedido, ahora
>   exige autenticación (`"Unauthorized"`). Por eso `getCotizacionesYahoo()`
>   (la lógica compartida entre `getIndicesAmericanos()` y
>   `getCommodities()`) pide cada símbolo por separado contra
>   `/v8/finance/chart/{ticker}` (un `Promise.allSettled`, no `Promise.all`:
>   si uno falla, los demás se muestran igual — recién si fallan todos se
>   considera que el panel entero falló).
>
> Los commodities son futuros (sufijo `=F` en el ticker de Yahoo): oro y
> petróleo WTI como referencia general, y soja/maíz/trigo en vez de una
> selección genérica, por su peso en las exportaciones argentinas.

> **Nota sobre los indicadores macro de EE.UU. (`lib/fred/`):** espejo del
> panel de BCRA, pero para EE.UU. — mismo formato visual (`components/macroUsa/`,
> calcado de `components/macro/` pero genérico vía `FilaIndicador` en vez de
> atado a `BcraVariable`). FRED, a diferencia de la API del BCRA, no tiene un
> endpoint que traiga varias series en un solo pedido: `getIndicadoresMacroUsa()`
> pide una por una (mismo criterio que Yahoo Finance — `Promise.allSettled`,
> tolera fallos individuales). El VIX no sale de FRED: se pide aparte a Yahoo
> Finance (`getVix()`, reusa `getCotizacionYahoo()` de `lib/yahoofinance/`) y
> encabeza la lista como fila destacada, igual que Riesgo País en el panel
> argentino.
>
> Detalles de las series elegidas:
> - La inflación interanual (CPI) usa el parámetro `units=pc1` de la propia
>   API de FRED, que devuelve directamente la variación % contra el mismo
>   mes del año anterior — no hace falta pedir el índice bruto y calcular el
>   % a mano.
> - Las fechas de la mayoría de las series son siempre el día 1 del período
>   (series mensuales/trimestrales, ej. `"2026-08-01"`): se muestran como
>   `MM/AAAA` en vez de `DD/MM/AAAA`, para no insinuar una precisión diaria
>   que el dato no tiene. La excepción es `DGS10` (rendimiento del bono del
>   Tesoro a 10 años, la "tasa libre de riesgo" — serie diaria de verdad, no
>   mensual con el día fijo en 1): cada `SerieFred` tiene un flag `diaria`
>   que cambia el formateador de fecha a `DD/MM/AAAA` para esos casos.
>
> `FRED_API_KEY` es la única credencial del proyecto además de las de IOL:
> se pide gratis y al instante en fred.stlouisfed.org, y se lee vía
> `config/env.ts` (nunca hardcodeada, mismo criterio que `IOL_USERNAME`/`IOL_PASSWORD`).

### Reporte de cierre en PDF

El botón "Descargar reporte (PDF)" de la barra lateral (arriba de Caución)
pide `GET /api/reporte-cierre`, que arma un PDF de una sola plantilla fija
(`components/reportes/ReporteCierreDocument.tsx`) con todos los paneles de
la home, en el mismo orden en que aparecen ahí: dólares, indicadores macro
de Argentina y de EE.UU. (con riesgo país y VIX destacados), caución, panel
líder, bonos soberanos en dólares, letras, bonos CER, CEDEARs, índices
americanos, commodities y criptomonedas.

Un par de decisiones de diseño:

- **El reporte siempre muestra el último cierre real, nunca un precio en
  vivo** — sin importar la hora a la que se genere. Esto es distinto del
  resto del sitio, donde el mismo panel muestra "Último" (en vivo) durante
  la rueda y "Cierre" fuera de ella. Para lograrlo, los fetchers de IOL y
  de Yahoo Finance aceptan un segundo parámetro `modo: "auto" | "cierre"`
  (tipo `ModoPrecio` en `lib/types.ts`): "auto" es el comportamiento de
  siempre de la home, "cierre" fuerza siempre el último cierre —
  `getDatosReporte()` pide todo en modo "cierre".
  - Para IOL (`aFila` en `lib/iol/cotizaciones.ts`), "cierre" fuerza
    `ultimoCierre` en vez de `ultimoPrecio`, aunque el mercado esté
    operando en ese momento (en cuyo caso `ultimoCierre` es el cierre de
    **ayer**, no el de hoy, porque hoy todavía no cerró).
  - Para Yahoo Finance (`getCotizacionYahoo` en `lib/yahoofinance/cotizacion.ts`),
    "cierre" usa `chartPreviousClose` en vez de `regularMarketPrice` cuando
    el mercado de EE.UU. está operando en ese momento (se sabe comparando
    la hora actual contra `currentTradingPeriod.regular`, que ya viene en
    la propia respuesta de Yahoo).
  - En ambos casos, si se fuerza "cierre" con el mercado todavía abierto,
    la columna "Var." queda en "-" en vez de mostrar un número: la
    variación que dan estas APIs es siempre "vs. el cierre anterior a
    HOY", así que no le corresponde a un precio que ya es, en sí, el
    cierre de ayer — mostrarla igual sería un dato engañoso.
  - La fecha de ese cierre (la que se ve en el encabezado del PDF, "Cierre
    del ...") se calcula aparte con `getFechaUltimoCierre()`
    (`lib/iol/market-hours.ts`): hoy si el mercado ya cerró por hoy, o el
    último día hábil anterior si todavía no cerró.
  - Caución, dólares, criptomonedas y los indicadores macro (BCRA/FRED/
    riesgo país) no tienen esta dualidad en vivo/cierre para empezar (ver
    las notas de cada uno más arriba), así que no participan de `modo` —
    el PDF lo aclara en la propia plantilla (subtítulo de cada sección).
- **El PDF se genera al momento del click, no es un archivo precalculado**:
  la ruta no tiene `dynamic = "force-static"`, así que corre en cada
  pedido. Es más lento que servir un archivo fijo (junta ~14 fuentes en
  paralelo y arma el documento), por eso el botón muestra "Generando..."
  mientras espera.
- **La plantilla usa las primitivas de `@react-pdf/renderer`** (`Document`,
  `Page`, `View`, `Text`, `StyleSheet`), no HTML/Tailwind: es un renderer de
  PDF aparte, con su propio motor de layout (flexbox limitado, sin CSS
  real). Por eso el PDF tiene su propia paleta de colores, más oscura que
  la del sitio (`--accent` original queda demasiado pálido para texto
  sobre fondo blanco impreso) y no reutiliza los componentes de UI del
  dashboard.
- **Cada sección tolera fallos individuales**, igual que la home: si una
  fuente falla, esa sección del PDF muestra "No se pudo obtener este dato."
  en vez de tirar abajo el reporte entero.
- El logo no se usa en el PDF: es una "V" gris clara pensada para fondo
  oscuro (ver Notas de diseño), así que el encabezado del PDF usa el mismo
  wordmark de texto ("Cotizaciones.") que el resto del sitio.

#### Mini informe con IA en el reporte

Si está definida `GEMINI_API_KEY` (gratis en aistudio.google.com/apikey), el PDF suma
arriba de todo un mini informe de la rueda en cuatro párrafos (panorama, eventos
relevantes, contexto internacional, conclusión), redactado por Gemini (`lib/reportes/resumenIA.ts`, vía la Interactions API).
Sin la clave, o si falla, el reporte se genera igual sin esa sección.

- **La información extra son titulares de prensa que trae el servidor**, no búsqueda del
  modelo: `lib/reportes/noticias.ts` lee el RSS de Google Noticias (gratis, sin clave) para
  5 temas (Merval, riesgo país, dólar, BCRA/tasas/inflación, Wall Street) y se los pasa al
  modelo junto con los datos de cierre. Así el informe puede explicar *por qué* se movió el
  mercado, no solo describirlo. Se usa este camino porque la búsqueda integrada de Gemini
  (`google_search`) da 429 (sin cuota) en el plan gratuito — verificado con dos claves
  distintas — y Groq no ofrece búsqueda en su plan gratuito.
- **Solo noticias del día del cierre**: la consulta se acota con `after:`/`before:` y
  después se descarta todo titular cuya fecha de publicación (en hora Argentina) no sea
  exactamente la fecha de cierre del reporte; además se filtran por palabras clave
  financieras (`ES_FINANCIERO`), porque las búsquedas traen ruido de deportes o
  espectáculos. Al modelo se le indica que use SOLO esas noticias y no agregue hechos de
  días anteriores ni de su conocimiento previo. Si un día no hay titulares, se redacta
  solo con los datos.
- **Reglas del prompt**: no inventar cifras ni hechos que no estén en los datos o los
  titulares; si un titular contradice a los datos, prevalecen los datos; no citar medios
  ni copiar titulares. La cifra de riesgo país, por ejemplo, sale de ArgentinaDatos, no de
  la prensa.
- **Qué eventos son relevantes**: Google Noticias solo da título y medio (sin resumen),
  así que la relevancia se infiere: se consultan 10 temas orientados a hechos (reservas,
  FMI, Caputo/Milei, Fed, petróleo, etc.), y `noticias.ts` agrupa los titulares que cuentan
  el mismo hecho (palabras clave en común) y los ordena por cobertura. Al modelo le llegan
  primero los hechos que más medios cubrieron, marcados `[cubierto por N medios]`, hasta 40
  titulares. El prompt le pide explicar *qué pasó, por qué importa y cómo se reflejó en los
  precios*, sin atribuir más causalidad que la que sugieren los titulares.
- **Modelo**: primero `gemini-3.5-flash` ("piensa": análisis mejor, 10-25 s, timeout de 30 s);
  si falla — es común un 503 por alta demanda — cae a `gemini-3.5-flash-lite` (~2 s, timeout
  de 15 s). El PDF indica cuál de los dos lo redactó. Con `GEMINI_MODEL` se fuerza uno solo.
- El PDF marca la sección como redactada por IA, con el modelo, la cantidad de titulares
  usados y la prensa consultada, porque puede contener errores.
- Best-effort en cada capa: un tema de noticias que falla no afecta a los demás; sin
  titulares se redacta solo con los datos; si Gemini falla no hay sección.
- La ruta declara `maxDuration = 60`. En Vercel, agregar `GEMINI_API_KEY` en las
  variables de entorno del entorno correspondiente (Preview y/o Production).

#### Un reporte por día, guardado

El reporte no se arma en cada click: hay uno por día, correspondiente al último
cierre de mercado, que queda guardado y se sirve tal cual hasta el próximo cierre
(`lib/reportes/reporteDiario.tsx`).

- **Generación**: un cron de Vercel (`vercel.json`, `0 21 * * 1-5` UTC = 18hs Argentina,
  de lunes a viernes) llama a `/api/cron/reporte-cierre`, que genera el PDF (con el resumen
  de IA) y lo guarda, pisando cualquier versión previa de esa fecha. En el plan Hobby los
  crons corren en algún momento dentro de la hora indicada, no al minuto.
- **Descarga**: `/api/reporte-cierre` busca el guardado de la fecha del último cierre
  (`getFechaUltimoCierre`) y lo devuelve. Si no existe (el cron falló, o es el primer día),
  lo genera en ese momento y lo guarda, así nunca queda sin reporte.
- **Almacenamiento** (`lib/reportes/almacenamiento.ts`): Vercel Blob privado, con una
  clave por fecha (`reportes/reporte-cierre-AAAA-MM-DD.pdf`). Sin `BLOB_READ_WRITE_TOKEN`
  (desarrollo local) se guarda en `.reportes/`, ignorado por git.
- **Configuración en Vercel**: crear un Blob store en el proyecto (Storage → Blob; agrega
  `BLOB_READ_WRITE_TOKEN` solo) y definir `CRON_SECRET` con un string largo y aleatorio.
  Sin `CRON_SECRET` el cron rechaza todo (evita que alguien lo dispare desde afuera y
  gaste la cuota de la IA).
- El cron de Vercel dispara igual en un feriado (no es feriado-aware, solo sabe "lun-vie"),
  pero `getFechaUltimoCierre()` sí lo es (ver la nota de `lib/iol/market-hours.ts` más abajo):
  el reporte que arma ese día queda guardado con la fecha real del último cierre, no con la
  fecha del feriado — en el peor caso se pisa el mismo archivo del día anterior con un resumen
  de IA levemente distinto (redactado de nuevo), no se genera un reporte con fecha incorrecta.

### Deploy en Vercel

1. Subí el repo a GitHub/GitLab/Bitbucket y conectalo en Vercel, o corré `vercel` desde la CLI.
2. Configurá `IOL_USERNAME`, `IOL_PASSWORD` y `FRED_API_KEY` como variables de entorno del proyecto en Vercel (Project Settings → Environment Variables). Nunca subas `.env.local`.
3. Deploy. La página se sirve como server component; el fetch a IOL corre en el servidor de Vercel, no en el browser, así que las credenciales nunca llegan al cliente.

### Paleta de colores

Toda la UI usa variables CSS semánticas (`--background`, `--foreground`, `--card`, `--muted-foreground`, `--border`, `--accent`, definidas en `app/globals.css` y mapeadas a colores de Tailwind vía `@theme inline`); ningún componente tiene un hex hardcodeado. Cambiar la paleta entera del sitio es, literalmente, editar esas variables en un solo archivo.

Paleta actual (blanco y negro, con celeste como único detalle de color):

| Variable | Hex |
|---|---|
| `--background` | `#0A0A0A` |
| `--card` | `#171717` |
| `--border` | `#2E2E2E` |
| `--muted-foreground` | `#A3A3A3` |
| `--accent` | `#8ECAE6` |
| `--foreground` / `--card-foreground` | `#F5F5F5` |
| `--accent-foreground` | igual que `--background` (`#0A0A0A`) |

Todo el sitio es gris/blanco/negro salvo `--accent`: es el único color no neutro, y se eligió deliberadamente pálido y desaturado (un celeste suave, no un azul saturado) para que se sienta como un detalle sutil en vez de un segundo color protagonista — sigue siendo el mismo token que ya usan encabezados de columna, la fila de Riesgo País, la curva de bonos, etc., simplemente con un tono mucho menos vibrante que en paletas anteriores. Rampa de luminosidad monótona de punta a punta sin ningún compromiso de contraste: fondo (`0A0A0A`) < tarjeta (`171717`) < borde (`2E2E2E`) < texto secundario (`A3A3A3`, ~7.8:1) < acento (`8ECAE6`, ~11.1:1) < texto principal (`F5F5F5`, ~18.2:1) — todo cumple AA con margen de sobra, incluidos los encabezados de columna sobre `--card` (el caso más exigente en paletas anteriores).

`:root` también declara `color-scheme: dark`. Sin eso, el navegador sigue asumiendo que la página es "clara" para todo lo que no pintan nuestras propias clases — el scrollbar del navegador (el de toda la ventana; el de las tablas ya tiene su propio estilo vía `.scrollbar-accent`), el color de selección de texto, controles nativos — y esos quedaban con su apariencia clara por defecto, una franja pálida notoria contra un sitio por lo demás oscuro.

### Notas de diseño

- El logo (`public/logo.png`, 500x300, fondo transparente) se usa vía `next/image` en `Logo.tsx` — `public/` es el lugar correcto para assets estáticos en Next.js, se sirven directo desde la raíz (`/logo.png`). `favicon`/`apple-icon` (`src/app/icon.png` y `apple-icon.png`, generados con `sharp` recortando el margen transparente del original) usan fondo sólido negro en vez de transparente: la "V" gris clara del logo casi desaparece sobre blanco (el fondo de tab por defecto), pero se ve nítida sobre el mismo negro del sitio.
- El año del copyright en `Footer.tsx` es una constante fija (`AÑO = 2026`), no `new Date().getFullYear()`. El footer se renderiza en el layout raíz, o sea en todas las páginas: calcularlo en cada request forzaría a Next a tratar toda la app como dinámica, perdiendo el prerenderizado estático que hoy tiene `/calculadora-bonos`. Hay que actualizarlo a mano una vez por año.
- Ningún panel/sección va envuelto en una tarjeta (borde+fondo+sombra): es un diseño deliberadamente plano — título y contenido flotan directo sobre el fondo de la página, y el único borde visible es el propio de cada tabla/lista (necesario para delimitar su scroll interno). `PanelSection`, `MacroSection`, `CaucionSection` y `CryptoLivePanel` comparten esa misma estructura simple (`header` + contenido, sin envoltorio).
- El texto secundario muy chico (fechas, descripciones) usa un único tamaño (`text-[0.7rem]`) en toda la app, en vez de mezclar 0.6rem/0.65rem/0.7rem sin motivo real.
- `CotizacionesTable` usa alto **máximo** (no fijo, `max-h-[28rem]`): un panel con pocas filas (Índices, Commodities) mide lo que necesita su contenido, no los mismos 28rem que uno con 25 filas (Bonos CER) — más allá del máximo, scrollea.
- El contenido principal de la home usa **columnas CSS** (`columns-1 sm:columns-2 xl:columns-3` en `app/page.tsx`, cada panel envuelto en un `<div className="mb-5 break-inside-avoid">`), no un grid. La diferencia importa justo por el punto anterior: en un grid, todos los paneles de una misma fila comparten alto (el más alto define el alto de la fila, dejando hueco debajo de los cortos); con columnas CSS cada panel mide lo que necesita y el siguiente panel de esa columna sube a ocupar el espacio libre, como un muro de Pinterest — sin eso, el alto variable de `max-h` no serviría de mucho. `break-inside-avoid` evita que un panel se parta entre dos columnas. Antes había un reordenamiento interactivo (botones ↑/↓, orden guardado en `localStorage`, columnas calculadas a mano con `ResizeObserver`) que se sacó por pedido explícito: era una fuente de bugs (parpadeo en el primer render, desincronización al redimensionar) para lograr algo que las columnas CSS nativas ya resuelven solas.
- El token de acceso de IOL dura 15 minutos. `lib/iol/auth.ts` lo cachea en memoria del proceso (por instancia serverless) para no pedir uno nuevo en cada request.
- Los datos del panel usan ISR (`next.revalidate` en `lib/iol/client.ts`): Next.js no hace polling en segundo plano, solo vuelve a pedir los datos cuando, pasado ese tiempo, entra una visita nueva. El gasto real de pedidos depende de cuánta gente visita la página, no de un timer corriendo solo.
- El intervalo de revalidación es dinámico (`lib/iol/market-hours.ts`): **60s** mientras el mercado está operando (lun-vie 11 a 17hs, hora Argentina) y **30 minutos** fuera de ese horario, ya que de noche o el fin de semana los precios no se mueven. Ajustar `REVALIDATE_SECONDS_MERCADO_ABIERTO` / `REVALIDATE_SECONDS_MERCADO_CERRADO` en `lib/iol/config.ts` si hace falta afinar el consumo mensual de la API.
- Cada página tiene exactamente un `<h1>` (regla de accesibilidad): en `/calculadora-bonos` es el título visible de la página, pero en la home ese lugar ya lo ocupaba visualmente el nombre del sitio en el Header — como el Header vive en el layout raíz y se repite en todas las páginas, ese texto pasó a ser un `<p>`, y la home agrega su propio `<h1 className="sr-only">` (visualmente oculto, pero presente para lectores de pantalla y SEO) describiendo el contenido de esa página en particular.
- Metadata (`title`/`description`/Open Graph) está centralizada: `app/layout.tsx` define un `title.template` (`"%s — Cotizaciones"`) y una descripción general del sitio entero; cada página solo exporta su propio `title`/`description` puntual (ej. `/calculadora-bonos`) y Next arma el resto. Deliberadamente no se seteó `metadataBase` ni una imagen de Open Graph todavía — falta definir el dominio de producción y generar un asset dedicado.
- Los mensajes de error que ve el usuario son siempre genéricos y en español ("No se pudieron cargar los datos de este panel. Probá recargar la página en unos minutos."), nunca el detalle técnico real (status HTTP, símbolo que falló, etc.), que en cambio se loguea server-side vía `console.error` con el nombre del panel como tag (ej. `[indices-americanos]`) — así queda accionable en los logs de Vercel sin exponerle nada al visitante que no pueda hacer nada con esa información.
- Los títulos/descripciones de cada panel (en `app/page.tsx` y en los `*Section.tsx`) no mencionan la fuente de datos (IOL, Yahoo Finance, BCRA, etc.) — es ruido para quien solo quiere ver la cotización. Todas las fuentes viven en un único lugar: la lista compacta de links al pie del `Footer` (`FUENTES` en `Footer.tsx`), separada del disclaimer/copyright.
- **Pasada de densidad** (tomando como referencia visual un terminal de trading tipo Bloomberg, solo en el eje "más comprimido", sin sumar elementos que no aplican a un sitio de solo consulta como libro de profundidad o botones de orden): primero se probó convertir caución/indicadores macro en una grilla de tiles de 2 columnas, pero se volvió atrás a la lista de filas original (se simplifica mejor, y un valor largo como `"$ 46.262.060,00 M"` no tiene problema para entrar en una fila de ancho completo como sí lo tenía en un tile angosto de ~130px). Lo que sí quedó de esa pasada:
  - Las filas de `CotizacionesTable` bajaron su padding (`py-2` → `py-1`) para que entren más símbolos sin scroll.
  - El layout principal pasó de grid a columnas CSS con `max-h` en vez de alto fijo (ver las dos notas de arriba) — esto es lo que realmente ahorra espacio en blanco, no la densidad de cada fila.
  - El Header se achicó (logo+título en una sola línea, sin la bajada "Mercado argentino en vivo"; la tarjeta de cada dólar en el carrusel pasó de dos columnas con labels "Compra"/"Venta" a un solo renglón `$compra / $venta` — la posición ya identifica cuál es cuál, y el `title="Compra / Venta"` del `<dl>` más los `<dt className="sr-only">` conservan el significado para lectores de pantalla).
  - Se recortaron las descripciones de panel que solo repetían el título sin sumar información (Panel Líder, Criptomonedas) o que tenían palabras de más (Bonos MEP, Letras, Bonos CER, CEDEARs, indicadores macro); `description` en `PanelSection` ahora es opcional. En `CaucionList`, la descripción por fila ("Caución a 1 día") se dejó de mostrar porque repetía lo que ya decía el símbolo ("Pesos 1D") — se sigue mostrando solo en el caso de fallback real ("más cercana operada: X días"), que sí aporta información.
  - Un espacio irrompible (U+00A0) entre el número y la unidad en los valores de `MacroCard`/`lib/fred/macro.ts` (ej. "...46.262.060,00 M") evita que la unidad quede colgando sola en su propia línea si el texto llega a quebrar — quedó de la prueba con tiles, pero es una mejora válida igual en la lista.
- **Columna Volumen**: `FilaCotizacion.volumen` es opcional (no todas las fuentes lo tienen) y se muestra abreviado (`formatVolumen` en `lib/format.ts`, ej. "48,3M") porque el número crudo tiene demasiados dígitos para una columna angosta. De dónde sale según la fuente:
  - IOL: ya viene en `CotizacionPanelItem.volumen` — se pedía y se descartaba al armar la fila, no es un pedido nuevo.
  - Yahoo Finance: `meta.regularMarketVolume`, mismo pedido que ya se hacía para precio/variación.
  - Binance: `quoteVolume` (volumen en USDT, no en unidades de la moneda — más comparable entre BTC/ETH/etc. que mezclar "cantidad de BTC" con "cantidad de ETH"), tanto en la foto inicial (`GET /ticker/24hr`) como en vivo (`q` del stream `@ticker`).
  - Caución no participa: no usa `CotizacionesTable`, usa `CaucionList` con su propio formato de lista.
- **Feriados en `isMercadoAbierto()`/`getFechaUltimoCierre()`**: durante un buen tiempo estas dos
  funciones (`lib/iol/market-hours.ts`) solo miraban fin de semana — un feriado hábil (ej. 25/12,
  que siempre cae entre semana) hacía que el sitio pensara que el mercado estaba operando. Se
  corrigió sumando `lib/argentinadatos/feriados.ts` (`GET /v1/feriados/{año}`, gratis, sin clave).
  - Las dos funciones pasaron de sincrónicas a `async` (necesitan pedir el feriadario), lo que
    obligó a tocar todos sus callers (los 5 getters de `lib/iol/cotizaciones.ts`, `lib/iol/caucion.ts`,
    `app/page.tsx`, `lib/reportes/datosReporte.ts` y `reporteDiario.tsx`) — todos ya estaban en
    contexto async, así que fue agregar `await`, no un rediseño.
  - `getRevalidateSeconds()` se partió en dos: `isMercadoAbierto()` (async, hace el trabajo pesado)
    y `revalidateSecondsPara(mercadoAbierto: boolean)` (sync, puro). Antes `aFila()` en
    `lib/iol/cotizaciones.ts` llamaba a `isMercadoAbierto()` una vez por fila (desperdicio, aunque
    barato siendo sync); ahora cada getter la resuelve una sola vez por request y se la pasa a
    `aFila()` como parámetro, evitando N pedidos de feriados redundantes por el mismo resultado.
  - `getFechaUltimoCierre()` necesita poder caminar hacia atrás por una cadena de feriado+fin de
    semana consecutivos (ej. Navidad viernes → sábado → domingo), así que pide el feriadario del
    año actual *y* el anterior en un solo paso (`feriadosAlrededorDe`, un `Promise.all`) y después
    recorre los días hacia atrás de forma sincrónica contra ese set ya resuelto, en vez de pedir
    feriados de nuevo en cada iteración del loop.
  - Verificado a mano (no quedó solo como código sin probar): simulando el 25/12/2026 — feriado
    real, viernes, dentro del horario de rueda — `isMercadoAbierto()` da `false` (antes hubiera
    dado `true`), y `getFechaUltimoCierre()` del lunes siguiente salta correctamente feriado +
    fin de semana y cae en el jueves anterior.
