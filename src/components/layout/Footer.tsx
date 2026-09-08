export function Footer() {
  return (
    <footer className="border-t border-accent/15 bg-background/95 px-6 py-6">
      <div className="mx-auto flex w-full max-w-[100rem] flex-col items-center gap-1 text-center text-xs text-muted-foreground">
        <p>
          Datos vía{" "}
          <a
            href="https://www.invertironline.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent"
          >
            IOL
          </a>
          , <a href="https://dolarapi.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
            dolarapi.com
          </a>
          , <a href="https://www.bcra.gob.ar" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
            BCRA
          </a>
          , <a href="https://www.binance.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
            Binance
          </a>{" "}
          y{" "}
          <a
            href="https://api.argentinadatos.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent"
          >
            ArgentinaDatos
          </a>
          .
        </p>
        <p className="text-muted-foreground/60">
          Información con fines de referencia, no constituye asesoramiento financiero.
        </p>
      </div>
    </footer>
  );
}
