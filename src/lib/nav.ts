import { Calculator, ChartLineUp, CurrencyBtc, House, Newspaper, Scroll, Table } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

/**
 * Fuente única de la navegación del sitio: la usan tanto `MenuLateral` (menú
 * desplegable) como `Footer`, para que agregar o renombrar una sección no
 * implique acordarse de tocar los dos lugares (el footer quedó desactualizado
 * una vez justamente por eso).
 */
export interface Enlace {
  href: string;
  label: string;
  descripcion: string;
  Icono: Icon;
}

/** Inicio y Noticias van sueltos arriba de todo (no son parte de ninguna categoría). */
export const ENLACES_PRINCIPALES: Enlace[] = [
  { href: "/", label: "Inicio", descripcion: "Dólares, cripto, acciones y bonos en vivo", Icono: House },
  { href: "/noticias", label: "Noticias", descripcion: "Lo más cubierto del día, curado", Icono: Newspaper },
];

/** El resto de las secciones, agrupadas por categoría. */
export const GRUPOS: { categoria: string; enlaces: Enlace[] }[] = [
  {
    categoria: "Acciones",
    enlaces: [
      { href: "/analisis-acciones", label: "Análisis de acciones", descripcion: "Mapa de calor sectorizado del Panel Líder", Icono: ChartLineUp },
      { href: "/acciones-argentinas", label: "Acciones argentinas", descripcion: "Panel Líder y General, con fundamentals", Icono: Table },
    ],
  },
  {
    categoria: "Renta fija",
    enlaces: [
      { href: "/calculadora-bonos", label: "Calculadora de bonos", descripcion: "TIR, duration y curva de rendimientos", Icono: Calculator },
      { href: "/obligaciones-negociables", label: "Obligaciones negociables", descripcion: "Listado filtrable por sector, emisor y ley", Icono: Scroll },
    ],
  },
  {
    categoria: "Cripto",
    enlaces: [{ href: "/cripto", label: "Cripto", descripcion: "Próximamente", Icono: CurrencyBtc }],
  },
];
