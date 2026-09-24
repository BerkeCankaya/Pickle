"use client";

import dynamic from "next/dynamic";

// Sonuç tarayıcıda saklandığı için kazanan kısmı sadece tarayıcıda çizilir.
export const ResultWinnerLoader = dynamic(
  () => import("./ResultWinner").then((mod) => mod.ResultWinner),
  {
    ssr: false,
    loading: () => <div className="mx-auto aspect-square w-full max-w-sm rounded-card bg-surface/60" />,
  },
);
