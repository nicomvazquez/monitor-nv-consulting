import { get, put } from "@vercel/blob";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const usaBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/** Una clave por fecha de cierre: el reporte "del día" es el que corresponde al último cierre, sin listar nada. */
function nombreArchivo(fechaCierre: Date): string {
  return `reporte-cierre-${fechaCierre.toISOString().slice(0, 10)}.pdf`;
}

// Sin token de Blob (desarrollo local), se guarda en disco. En Vercel el
// disco solo es escribible en el directorio temporal, que no es persistente:
// ahí funciona como cache de la instancia, pero lo que garantiza que el
// reporte quede guardado es el Blob.
function directorioLocal(): string {
  return process.env.VERCEL ? path.join(tmpdir(), "reportes") : path.join(process.cwd(), ".reportes");
}

export async function leerReporte(fechaCierre: Date): Promise<Buffer | null> {
  const nombre = nombreArchivo(fechaCierre);

  if (usaBlob()) {
    const resultado = await get(`reportes/${nombre}`, { access: "private", useCache: false });
    if (!resultado || resultado.statusCode !== 200) return null;
    return Buffer.from(await new Response(resultado.stream).arrayBuffer());
  }

  try {
    return await readFile(path.join(directorioLocal(), nombre));
  } catch {
    return null;
  }
}

export async function guardarReporte(fechaCierre: Date, pdf: Buffer): Promise<void> {
  const nombre = nombreArchivo(fechaCierre);

  if (usaBlob()) {
    await put(`reportes/${nombre}`, pdf, {
      access: "private",
      contentType: "application/pdf",
      allowOverwrite: true,
      addRandomSuffix: false,
    });
    return;
  }

  await mkdir(directorioLocal(), { recursive: true });
  await writeFile(path.join(directorioLocal(), nombre), pdf);
}
