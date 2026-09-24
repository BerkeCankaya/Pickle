import type { CSSProperties } from "react";

const COLORS = ["bg-accent", "bg-accent-soft", "bg-primary", "bg-secondary"];
const PIECES = 42;

// Kazananın üstüne bir kez yağan konfeti. Hareket azaltma açıksa hiç görünmez.
export function Confetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 overflow-hidden motion-reduce:hidden">
      {Array.from({ length: PIECES }, (_, i) => {
        // Rastgele görünen ama her seferinde aynı dağılım (altın oran ile).
        const spread = (i * 0.618034) % 1;
        const style = {
          left: `${spread * 100}%`,
          "--confetti-delay": `${(i % 7) * 0.12}s`,
          "--confetti-duration": `${2.2 + ((i * 37) % 10) / 10}s`,
          "--confetti-drift": `${((i * 53) % 120) - 60}px`,
        } as CSSProperties;
        return (
          <span
            key={i}
            style={style}
            className={`absolute top-0 animate-confetti ${COLORS[i % COLORS.length]} ${
              i % 3 === 0 ? "h-3 w-1.5 rounded-sm" : "size-2 rounded-full"
            }`}
          />
        );
      })}
    </div>
  );
}
