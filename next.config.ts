import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `pdf-to-png-converter` trae binarios nativos (@napi-rs/canvas) y archivos
  // de worker propios (pdfjs-dist) que el bundler de Next no sabe empaquetar
  // bien — hay que dejarlos afuera del bundle y que se resuelvan como
  // dependencias normales de node_modules en runtime.
  serverExternalPackages: ["pdf-to-png-converter", "@napi-rs/canvas", "pdfjs-dist"],
};

export default nextConfig;
