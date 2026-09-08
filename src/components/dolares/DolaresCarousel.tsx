import type { Dolar } from "@/lib/dolarapi/types";
import { DolarCard } from "./DolarCard";

export function DolaresCarousel({ dolares }: { dolares: Dolar[] }) {
  return (
    <div className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
      {/* El track está duplicado (ver @keyframes marquee en globals.css): recorre las tarjetas dos veces para que el loop sea continuo. */}
      <div className="flex w-max animate-[marquee_30s_linear_infinite] gap-4 group-hover:[animation-play-state:paused]">
        {[...dolares, ...dolares].map((dolar, index) => (
          <DolarCard key={`${dolar.casa}-${index}`} dolar={dolar} />
        ))}
      </div>
    </div>
  );
}
