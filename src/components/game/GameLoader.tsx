"use client";

import dynamic from "next/dynamic";

// Oyun durumu tarayıcıda saklandığı için oyuncu sadece tarayıcıda çizilir.
export const GameLoader = dynamic(() => import("./GamePlayer").then((mod) => mod.GamePlayer), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-dvh items-center justify-center text-secondary" role="status">
      Oyun hazırlanıyor…
    </div>
  ),
});
