export interface Punto {
  x: number;
  y: number;
}

/** Coeficientes de un polinomio de grado ≤2: y = a + b·x + c·x². */
export interface CoeficientesCurva {
  a: number;
  b: number;
  c: number;
}

export function evaluarCurva({ a, b, c }: CoeficientesCurva, x: number): number {
  return a + b * x + c * x * x;
}

function determinante3(m: number[][]): number {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

function conColumnaReemplazada(m: number[][], columna: number, valores: number[]): number[][] {
  return m.map((fila, i) => fila.map((valor, j) => (j === columna ? valores[i] : valor)));
}

/** Regresión lineal simple (y = a + b·x) por mínimos cuadrados. */
function ajustarLineal(puntos: Punto[]): CoeficientesCurva {
  const n = puntos.length;
  if (n === 0) return { a: 0, b: 0, c: 0 };
  if (n === 1) return { a: puntos[0].y, b: 0, c: 0 };

  const sx = puntos.reduce((s, p) => s + p.x, 0);
  const sy = puntos.reduce((s, p) => s + p.y, 0);
  const sxy = puntos.reduce((s, p) => s + p.x * p.y, 0);
  const sx2 = puntos.reduce((s, p) => s + p.x * p.x, 0);
  const denominador = n * sx2 - sx * sx;

  if (denominador === 0) return { a: sy / n, b: 0, c: 0 };

  const b = (n * sxy - sx * sy) / denominador;
  const a = (sy - b * sx) / n;
  return { a, b, c: 0 };
}

/**
 * Regresión cuadrática (y = a + b·x + c·x²) por mínimos cuadrados, resolviendo
 * el sistema de ecuaciones normales 3x3 con la regla de Cramer. Con x sin
 * suficiente variación para despejar 3 términos (determinante ~0) cae a una
 * recta en vez de devolver un resultado inestable.
 */
function ajustarCuadratica(puntos: Punto[]): CoeficientesCurva {
  let sx = 0;
  let sx2 = 0;
  let sx3 = 0;
  let sx4 = 0;
  let sy = 0;
  let sxy = 0;
  let sx2y = 0;

  for (const { x, y } of puntos) {
    const x2 = x * x;
    sx += x;
    sx2 += x2;
    sx3 += x2 * x;
    sx4 += x2 * x2;
    sy += y;
    sxy += x * y;
    sx2y += x2 * y;
  }

  const n = puntos.length;
  const matriz = [
    [n, sx, sx2],
    [sx, sx2, sx3],
    [sx2, sx3, sx4],
  ];
  const independientes = [sy, sxy, sx2y];
  const det = determinante3(matriz);

  if (Math.abs(det) < 1e-9) return ajustarLineal(puntos);

  const a = determinante3(conColumnaReemplazada(matriz, 0, independientes)) / det;
  const b = determinante3(conColumnaReemplazada(matriz, 1, independientes)) / det;
  const c = determinante3(conColumnaReemplazada(matriz, 2, independientes)) / det;
  return { a, b, c };
}

/** Cuadrática con 3 o más puntos (mejor capta la forma típica de una curva de rendimientos); recta si hay menos. */
export function ajustarCurva(puntos: Punto[]): CoeficientesCurva {
  return puntos.length >= 3 ? ajustarCuadratica(puntos) : ajustarLineal(puntos);
}

/** Coeficiente de determinación (R²): 1 = ajuste perfecto, cerca de 0 = la curva no explica la dispersión de los datos. */
export function r2(puntos: Punto[], coeficientes: CoeficientesCurva): number {
  if (puntos.length === 0) return 0;
  const prom = media(puntos.map((p) => p.y));
  let ssRes = 0;
  let ssTot = 0;
  for (const { x, y } of puntos) {
    const estimado = evaluarCurva(coeficientes, x);
    ssRes += (y - estimado) ** 2;
    ssTot += (y - prom) ** 2;
  }
  return ssTot === 0 ? 1 : 1 - ssRes / ssTot;
}

export function media(valores: number[]): number {
  return valores.length === 0 ? 0 : valores.reduce((s, v) => s + v, 0) / valores.length;
}

export function desvioEstandar(valores: number[]): number {
  if (valores.length === 0) return 0;
  const prom = media(valores);
  const varianza = valores.reduce((s, v) => s + (v - prom) ** 2, 0) / valores.length;
  return Math.sqrt(varianza);
}
