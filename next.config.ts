import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `pdf-to-png-converter` trae binarios nativos (@napi-rs/canvas) y archivos
  // de worker propios (pdfjs-dist) que el bundler de Next no sabe empaquetar
  // bien — hay que dejarlos afuera del bundle y que se resuelvan como
  // dependencias normales de node_modules en runtime.
  serverExternalPackages: ["pdf-to-png-converter", "@napi-rs/canvas", "pdfjs-dist"],
  // Lo anterior evita que el bundler rompa estos paquetes, pero no alcanza en
  // Vercel: el "output file tracing" que decide qué archivos subir a cada
  // función serverless es estático (sigue `require`/`import`), y el binario
  // nativo de @napi-rs/canvas se resuelve en runtime según la plataforma —
  // el tracer no lo ve y lo deja afuera del deploy, así que /api/reporte-cierre
  // tira error en producción al pedir el PNG (funciona en local porque ahí no
  // hay ningún recorte de archivos). Esto fuerza a incluirlos igual.
  outputFileTracingIncludes: {
    "/api/reporte-cierre": [
      "./node_modules/@napi-rs/**/*",
      "./node_modules/pdf-to-png-converter/**/*",
      "./node_modules/pdfjs-dist/**/*",
    ],
  },
};

export default nextConfig;
