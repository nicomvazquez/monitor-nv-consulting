## Cotizaciones IOL

App Next.js que consulta la API de [IOL invertirOnline](https://api.invertironline.com) desde el servidor y muestra, en una sola página, distintos paneles de mercado — todos con la misma tabla (Símbolo / Último / Variación).

Paneles disponibles hoy:

- **Caución**: la tasa promedio operada a 1, 7 y 14 días, en pesos y en dólares (una fila por combinación, ordenadas por plazo). "Variación" no aplica acá y queda en "-".
- **Panel Líder**: acciones argentinas del panel líder (Merval).
- **CEDEARs principales**: los CEDEARs más operados del día (por `cantidadOperaciones`).
- **Bonos soberanos en dólares (MEP)**: Bonares (AL), Globales (GD), Discount (AE), Par (PAY) y Bonos del Tesoro en USD (AN, AO), solo liquidación MEP (se excluye la liquidación dólar cable/CCL).
- **Letras**: LECAPs y LECER del Tesoro Nacional en pesos (excluye pagarés/cheques privados, letras provinciales y dollar-linked).
- **Bonos CER**: Boncer y demás deuda del Tesoro Nacional en pesos ajustada por CER.

### Estructura

```
src/
  app/
    page.tsx                     # Página única: pide ambos paneles y renderiza sus secciones
    layout.tsx
  components/
    cotizaciones/                # UI compartida por todos los paneles de cotizaciones
      PanelSection.tsx           # Título + estado de error + tabla de un panel
      CotizacionesTable.tsx      # Tabla Símbolo/Último/Variación (recibe FilaCotizacion[])
      VariacionBadge.tsx
  lib/
    format.ts            # Formateo de números/porcentajes
    iol/                  # Todo lo relacionado a la API de IOL
      config.ts           # URLs base y constantes de panel/instrumento/país
      auth.ts              # Login y cacheo en memoria del access token
      client.ts            # fetch autenticado + revalidación (paneles de acciones/bonos)
      cotizaciones.ts      # getPanelLider(), getCedearsPrincipales(), getBonosSoberanosDolaresMep(), getLetras(), getBonosCer()
      caucion.ts            # getTasasCaucion() (forma propia) + getCaucionesTabla() (aplanada a FilaCotizacion[])
      market-hours.ts      # Horario de rueda + intervalo de revalidación dinámico
      types.ts             # Tipos de las respuestas de IOL
  config/
    env.ts               # Lectura validada de variables de entorno
```

`CotizacionesTable` solo pide 4 campos (`FilaCotizacion`: símbolo, descripción,
último, variación — esta última nullable, para paneles como caución donde no
aplica), no el objeto completo de IOL. `CotizacionPanelItem` (la respuesta
real de la API, con apertura/máximo/mínimo/puntas/etc.) ya cumple esa forma
por estructura, así que acciones/bonos/CEDEARs se pasan tal cual sin
conversión.

Para sumar un panel nuevo alcanza con: una constante en `lib/iol/config.ts`,
una función que devuelva `FilaCotizacion[]` en `lib/iol/cotizaciones.ts`, y
otro `<PanelSection>` en `app/page.tsx`.

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

### Deploy en Vercel

1. Subí el repo a GitHub/GitLab/Bitbucket y conectalo en Vercel, o corré `vercel` desde la CLI.
2. Configurá `IOL_USERNAME` e `IOL_PASSWORD` como variables de entorno del proyecto en Vercel (Project Settings → Environment Variables). Nunca subas `.env.local`.
3. Deploy. La página se sirve como server component; el fetch a IOL corre en el servidor de Vercel, no en el browser, así que las credenciales nunca llegan al cliente.

### Notas de diseño

- El token de acceso de IOL dura 15 minutos. `lib/iol/auth.ts` lo cachea en memoria del proceso (por instancia serverless) para no pedir uno nuevo en cada request.
- Los datos del panel usan ISR (`next.revalidate` en `lib/iol/client.ts`): Next.js no hace polling en segundo plano, solo vuelve a pedir los datos cuando, pasado ese tiempo, entra una visita nueva. El gasto real de pedidos depende de cuánta gente visita la página, no de un timer corriendo solo.
- El intervalo de revalidación es dinámico (`lib/iol/market-hours.ts`): **60s** mientras el mercado está operando (lun-vie 11 a 17hs, hora Argentina) y **30 minutos** fuera de ese horario, ya que de noche o el fin de semana los precios no se mueven. Ajustar `REVALIDATE_SECONDS_MERCADO_ABIERTO` / `REVALIDATE_SECONDS_MERCADO_CERRADO` en `lib/iol/config.ts` si hace falta afinar el consumo mensual de la API.
