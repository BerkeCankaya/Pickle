"use client";

import Link from "next/link";
import { PlayIcon, TrophyIcon } from "@/components/icons";
import { MediaImage } from "@/components/MediaImage";
import { buttonStyles } from "@/components/ui/Button";
import { parseResult, useStoredResultRaw } from "@/lib/game/storage";
import type { QuizOption } from "@/types/quiz";
import { Confetti } from "./Confetti";

type ResultWinnerProps = {
  quizId: string;
  options: Pick<QuizOption, "id" | "name" | "mediaUrl" | "mediaType">[];
};

export function ResultWinner({ quizId, options }: ResultWinnerProps) {
  const result = parseResult(useStoredResultRaw(quizId));
  const winner = result && options.find((option) => option.id === result.championId);

  if (!result || !winner) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-card bg-surface/60 p-6 ring-1 ring-accent/20">
        <h1 className="font-display text-xl font-semibold">Henüz bir şampiyonun yok</h1>
        <p className="text-secondary">Bu quizi bu cihazda henüz oynamadın. Oyna ve kendi şampiyonunu seç.</p>
        <Link href={`/quiz/${quizId}`} className={buttonStyles()}>
          <PlayIcon className="size-5" />
          Oyna
        </Link>
      </div>
    );
  }

  return (
    <section aria-labelledby="winner-heading" className="flex flex-col items-center gap-5 text-center">
      <Confetti />
      <p className="inline-flex items-center gap-2 text-sm text-secondary">
        <TrophyIcon className="size-5 text-accent" />
        {result.size} kişilik turnuvanın şampiyonu
      </p>
      <div className="relative aspect-square w-full max-w-sm animate-pop-in overflow-hidden rounded-card bg-surface shadow-glow-lg">
        <MediaImage
          src={winner.mediaUrl}
          alt={winner.name}
          mediaType={winner.mediaType}
          sizes="(min-width: 640px) 384px, 100vw"
          preload
        />
      </div>
      <h1 id="winner-heading" className="font-display text-3xl font-bold text-balance sm:text-5xl">
        {winner.name}
      </h1>
    </section>
  );
}
