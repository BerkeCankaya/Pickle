"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlayIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { clearGame, parseGame, useStoredGameRaw } from "@/lib/game/storage";
import { progressLabel, type TournamentSize } from "@/lib/game/tournament";

type StartPanelProps = {
  quizId: string;
  optionIds: string[];
  sizes: TournamentSize[];
};

export function StartPanel({ quizId, optionIds, sizes }: StartPanelProps) {
  const router = useRouter();
  const [size, setSize] = useState<TournamentSize>(sizes.includes(16) ? 16 : sizes[sizes.length - 1]);
  const savedGame = parseGame(useStoredGameRaw(quizId), quizId, optionIds);

  function start() {
    clearGame(quizId);
    router.push(`/quiz/${quizId}/play?boyut=${size}`);
  }

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-medium">Kaç kişilik turnuva?</legend>
        <div className="grid grid-cols-4 gap-2">
          {sizes.map((option) => (
            <label
              key={option}
              className={cn(
                "flex h-12 cursor-pointer items-center justify-center rounded-field font-display text-base font-semibold ring-1 transition-[box-shadow,background-color] duration-200",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-soft",
                option === size
                  ? "bg-accent/15 text-primary ring-2 ring-accent shadow-glow-sm"
                  : "bg-surface text-secondary ring-secondary/30 hover:text-primary hover:ring-secondary/60",
              )}
            >
              <input
                type="radio"
                name="tournament-size"
                value={option}
                checked={option === size}
                onChange={() => setSize(option)}
                className="sr-only"
              />
              {option}
            </label>
          ))}
        </div>
        <p className="text-sm text-secondary">
          Seçtiğin sayı quizdeki seçeneklerden azsa, seçenekler rastgele seçilir.
        </p>
      </fieldset>

      <Button size="lg" fullWidth onClick={start}>
        <PlayIcon className="size-5" />
        Oyna
      </Button>

      {savedGame && (
        <div className="flex flex-col gap-3 rounded-field bg-surface/60 p-4 ring-1 ring-accent/25 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            Yarım kalan bir oyunun var:{" "}
            <span className="font-medium">
              {savedGame.size} kişilik, {progressLabel(savedGame)}
            </span>
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/quiz/${quizId}/play?boyut=${savedGame.size}`)}
          >
            Kaldığın yerden devam et
          </Button>
        </div>
      )}
    </div>
  );
}
