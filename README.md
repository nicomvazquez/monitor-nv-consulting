## Cotizaciones IOL

App Next.js que consulta la API de [IOL invertirOnline](https://api.invertironline.com) desde el servidor y muestra, en un dashboard bien oscuro (marrones sobre negro casi absoluto, ver [Paleta de colores](#paleta-de-colores)), distintos paneles de mercado — todos con la misma tabla (Símbolo / Último / Variación) — dispuestos en grilla para ver la mayor cantidad posible juntas. Header y footer viven en el layout raíz, así que son compartidos por todas las páginas del sitio (hoy: la home y `/calculadora-bonos`).

La home se divide en una barra lateral izquierda (indicadores macro + caución) y el contenido principal a la derecha (el resto de las tablas), en un orden fijo: Panel Líder, Bonos MEP, Letras, Bonos CER, CEDEARs y Criptomonedas. Para cambiar el orden alcanza con reordenar los bloques en `app/page.tsx` — no hay drag-and-drop ni persistencia en `localStorage` (se probó y se sacó; ver Notas de diseño).

Secciones disponibles en la home:

- **Header**: sticky, con el logo, el título, la navegación a las demás páginas y el carrusel de dólares integrado (no es una sección más de la página, vive en el layout raíz).
- **Dólares**: carrusel de tarjetas con compra/venta de cada tipo de dólar (oficial, blue, bolsa/MEP, CCL, mayorista, cripto, tarjeta), vía [dolarapi.com](https://dolarapi.com) — no es parte de la API de IOL. Gira solo, sin JS (animación CSS), y se pausa al pasar el mouse.
- **Indicadores macro** *(barra lateral)*: riesgo país (tarjeta resaltada, vía [ArgentinaDatos](https://api.argentinadatos.com)) más reservas internacionales, inflación mensual e interanual, tasa de política monetaria, base monetaria y LELIQ/NOTALQ, vía la [API del BCRA](https://api.bcra.gob.ar) — ninguna de las dos es de IOL.
- **Caución** *(barra lateral)*: la tasa promedio operada a 1, 7 y 14 días, en pesos y en dólares (una fila por combinación, ordenadas por plazo). Se muestra como lista compacta, con el mismo formato que los indicadores macro (no la tabla con columnas de los demás paneles).
- **Criptomonedas**: BTC, ETH, BNB, XRP, SOL y ADA en USD, actualizadas en vivo por WebSocket de Binance (no polling) — tampoco es de IOL.
- **Panel Líder**: acciones argentinas del panel líder (Merval).
- **CEDEARs principales**: los CEDEARs más operados del día (por `cantidadOperaciones`).
- **Bonos soberanos en dólares (MEP)**: Bonares (AL), Globales (GD), Discount (AE), Par (PAY) y Bonos del Tesoro en USD (AN, AO), solo liquidación MEP (se excluye la liquidación dólar cable/CCL).
- **Letras**: LECAPs y LECER del Tesoro Nacional en pesos (excluye pagarés/cheques privados, letras provinciales y dollar-linked).
- **Bonos CER**: Boncer y demás deuda del Tesoro Nacional en pesos ajustada por CER.

En `/calculadora-bonos` (por ahora solo una tabla de referencia, la calculadora interactiva viene después):

- **Bonos en dólares**: precio, TIR, próximo pago, duration y convexidad de Bonares/Globales, agrupados por "ley local" / "ley new york" — vía una hoja de Google Sheets del usuario (compartida como "cualquiera con el link puede ver"), no de IOL ni de ninguna otra API.

### Estructura

```
src/
  app/
    page.tsx                     # Home: pide todo, arma la barra lateral (macro + caución) y el grid reordenable
    layout.tsx                   # Fuentes, paleta de colores, y el Header/Footer compartidos (pide dólares acá)
    globals.css                   # Tokens de color (--color-background/--color-accent/...) y @keyframes marquee
    calculadora-bonos/
      page.tsx                    # Tabla de referencia (hoja de Google Sheets); la calculadora interactiva viene después
  components/
    layout/
      Header.tsx                  # Header sticky: logo (linkea a "/") + nav + carrusel de dólares embebido
      Footer.tsx                   # Créditos de fuentes + disclaimer, al pie de la página
      Sidebar.tsx                  # Barra lateral izquierda de la home: caución + indicadores macro (misma altura de fila)
    ui/
      ErrorMessage.tsx             # Marca de error compartida por todas las secciones (evita repetir el mismo div 4 veces)
    bonos/                         # UI de la tabla de bonos de Google Sheets, en /calculadora-bonos
      BonosSheetSection.tsx         # Header + estado de error + tabla
      BonosSheetTable.tsx            # Tabla con sub-encabezados de sección ("Ley local"/"Ley new york")
    cotizaciones/                # UI compartida por todos los paneles de cotizaciones
      PanelSection.tsx           # Tarjeta de dashboard: título + estado de error + tabla de un panel
      CotizacionesTable.tsx      # Tabla Símbolo/Último/Variación (recibe FilaCotizacion[])
      VariacionBadge.tsx
    caucion/                      # UI de la caución, como lista compacta (no la tabla del resto de paneles)
      CaucionSection.tsx           # Mismo patrón que PanelSection/MacroSection: header + lista, sin tarjeta envolvente
      CaucionList.tsx               # Filas símbolo+descripción / tasa, igual formato visual que MacroCard
    dolares/                     # UI de las tarjetas de dólar (dolarapi.com), usadas dentro del Header
      DolaresCarousel.tsx         # Loop infinito por CSS (@keyframes marquee en globals.css)
      DolarCard.tsx
    cryptos/
      CryptoLivePanel.tsx          # "use client": arranca en `inicial` y se actualiza por WebSocket
    macro/                        # UI de la lista de indicadores del BCRA + riesgo país
      MacroSection.tsx              # Mismo patrón que PanelSection/CaucionSection: header + lista de filas divididas
      MacroCard.tsx                  # Fila compacta (no tarjeta): label+fecha a la izquierda, valor en mono a la derecha
      RiesgoPaisCard.tsx             # Fila destacada (fondo/borde en el color de acento) que encabeza la lista
  lib/
    types.ts              # FilaCotizacion: la forma que pide CotizacionesTable, sin atarse a ninguna fuente
    format.ts             # Formateo de números/porcentajes
    csv.ts                # parseCsv(): parser mínimo de CSV (comillas, comas escapadas), sin dependencias externas
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

1. Necesitás una cuenta de IOL con la API habilitada (se activa desde Configuración > API en la plataforma).
2. Copiá `.env.local.example` a `.env.local` y completá tus credenciales:

   ```
   IOL_USERNAME=tu_usuario
   IOL_PASSWORD=tu_contraseña
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
> hace falta pedir cada serie por separado. Se filtra a los 6 IDs pedidos
> (`MACRO_IDS` en `lib/bcra/config.ts`; agregar/sacar uno es tocar ese
> array) y se ordena según ese mismo orden.
>
> Dos cosas a tener en cuenta:
> - Son series diarias/mensuales, no algo que valga la pena revisar cada
>   minuto: revalida cada 30 minutos (`REVALIDATE_SECONDS_MACRO`).
> - El id 160 (tasa de política monetaria) no se actualiza desde julio de
>   2025 — verificado a mano contra la API real, no es un bug del código.
>   La tarjeta lo muestra igual, con su fecha ("Al DD/MM/AAAA") a la vista
>   para que quede claro que está desactualizado.

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

### Deploy en Vercel

1. Subí el repo a GitHub/GitLab/Bitbucket y conectalo en Vercel, o corré `vercel` desde la CLI.
2. Configurá `IOL_USERNAME` e `IOL_PASSWORD` como variables de entorno del proyecto en Vercel (Project Settings → Environment Variables). Nunca subas `.env.local`.
3. Deploy. La página se sirve como server component; el fetch a IOL corre en el servidor de Vercel, no en el browser, así que las credenciales nunca llegan al cliente.

### Paleta de colores

Toda la UI usa variables CSS semánticas (`--background`, `--foreground`, `--card`, `--muted-foreground`, `--border`, `--accent`, definidas en `app/globals.css` y mapeadas a colores de Tailwind vía `@theme inline`); ningún componente tiene un hex hardcodeado. Cambiar la paleta entera del sitio es, literalmente, editar esas variables en un solo archivo.

Paleta actual (marrones + negro puro), usada **tal cual**, sin agregar ningún tono:

| Variable | Hex (paleta, sin modificar) |
|---|---|
| `--background` | `#080808` |
| `--card` | `#231810` |
| `--border` | `#613D28` |
| `--muted-foreground` | `#625F5D` |
| `--accent` | `#AE7F62` |
| `--foreground` / `--card-foreground` | `#FCCDAC` |
| `--accent-foreground` | igual que `--background` (`#080808`) |

Esta paleta trae un negro casi absoluto (`080808`) entre sus 6 colores, así que se pudo usar directamente como fondo para lograr un estilo bien oscuro sin inventar nada (a diferencia de una paleta anterior, a la que le faltaba un negro real y hubo que agregarle uno). También es la primera de las cuatro paletas probadas cuya rampa de luminosidad es monótona de punta a punta sin ningún compromiso de contraste: fondo (`080808`) < tarjeta (`231810`) < borde (`613D28`) < texto secundario (`625F5D`, ~3.2:1) < acento (`AE7F62`, ~5.7:1) < texto principal (`FCCDAC`, ~13.8:1) — todos los usos de `--accent` como texto, incluidos los encabezados de columna sobre `--card` (el caso más exigente en paletas anteriores), cumplen el mínimo de accesibilidad AA (4.5:1).

`:root` también declara `color-scheme: dark`. Sin eso, el navegador sigue asumiendo que la página es "clara" para todo lo que no pintan nuestras propias clases — el scrollbar del navegador (el de toda la ventana; el de las tablas ya tiene su propio estilo vía `.scrollbar-accent`), el color de selección de texto, controles nativos — y esos quedaban con su apariencia clara por defecto, una franja pálida notoria contra un sitio por lo demás oscuro.

### Notas de diseño

- Ningún panel/sección va envuelto en una tarjeta (borde+fondo+sombra): es un diseño deliberadamente plano — título y contenido flotan directo sobre el fondo de la página, y el único borde visible es el propio de cada tabla/lista (necesario para delimitar su scroll interno). `PanelSection`, `MacroSection`, `CaucionSection` y `CryptoLivePanel` comparten esa misma estructura simple (`header` + contenido, sin envoltorio).
- El texto secundario muy chico (fechas, descripciones, labels de Compra/Venta) usa un único tamaño (`text-[0.7rem]`) en toda la app, en vez de mezclar 0.6rem/0.65rem/0.7rem sin motivo real.
- `CotizacionesTable` usa alto **fijo** (no máximo) para su contenedor con scroll: así todos los paneles del grid principal quedan con la misma altura entre sí, sin importar si un panel tiene 6 filas y otro 30.
- El contenido principal de la home usa un grid CSS común (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-3`) en `app/page.tsx`, en orden fijo. Antes había un reordenamiento interactivo (botones ↑/↓, orden guardado en `localStorage`, columnas calculadas a mano con `ResizeObserver`) que se sacó por pedido explícito: con todos los paneles a la misma altura fija, un grid normal ya queda parejo sin necesidad de ese cálculo manual en JS — que además era una fuente de bugs (parpadeo en el primer render, desincronización al redimensionar).
- El token de acceso de IOL dura 15 minutos. `lib/iol/auth.ts` lo cachea en memoria del proceso (por instancia serverless) para no pedir uno nuevo en cada request.
- Los datos del panel usan ISR (`next.revalidate` en `lib/iol/client.ts`): Next.js no hace polling en segundo plano, solo vuelve a pedir los datos cuando, pasado ese tiempo, entra una visita nueva. El gasto real de pedidos depende de cuánta gente visita la página, no de un timer corriendo solo.
- El intervalo de revalidación es dinámico (`lib/iol/market-hours.ts`): **60s** mientras el mercado está operando (lun-vie 11 a 17hs, hora Argentina) y **30 minutos** fuera de ese horario, ya que de noche o el fin de semana los precios no se mueven. Ajustar `REVALIDATE_SECONDS_MERCADO_ABIERTO` / `REVALIDATE_SECONDS_MERCADO_CERRADO` en `lib/iol/config.ts` si hace falta afinar el consumo mensual de la API.
