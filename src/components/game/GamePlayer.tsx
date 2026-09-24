"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon } from "@/components/icons";
import { MediaImage } from "@/components/MediaImage";
import { cn } from "@/lib/cn";
import { clearGame, loadGame, saveGame, saveResult } from "@/lib/game/storage";
import {
  availableSizes,
  choose,
  createGame,
  currentMatch,
  progressLabel,
  upcomingMatch,
  type GameState,
  type TournamentSize,
} from "@/lib/game/tournament";
import type { Quiz, QuizOption } from "@/types/quiz";

const PICK_DELAY_MS = 450;
const PICK_DELAY_REDUCED_MS = 150;

type GamePlayerProps = {
  quiz: Quiz;
  options: QuizOption[];
  requestedSize: TournamentSize | null;
};

function startingState(quiz: Quiz, optionIds: string[], requestedSize: TournamentSize | null): GameState {
  const saved = loadGame(quiz.id, optionIds);
  if (saved && (!requestedSize || saved.size === requestedSize)) return saved;

  const sizes = availableSizes(optionIds.length);
  const size =
    requestedSize && sizes.includes(requestedSize)
      ? requestedSize
      : sizes.includes(16)
        ? 16
        : sizes[sizes.length - 1];
  return createGame(quiz.id, optionIds, size);
}

export function GamePlayer({ quiz, options, requestedSize }: GamePlayerProps) {
  const router = useRouter();
  const optionsById = new Map(options.map((option) => [option.id, option]));
  const [game, setGame] = useState(() =>
    startingState(quiz, options.map((option) => option.id), requestedSize),
  );
  const [pickedId, setPickedId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const match = currentMatch(game);
  const upcoming = upcomingMatch(game);
  const totalMatches = game.size - 1;

  useEffect(() => {
    saveGame(game);
  }, [game]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function pick(optionId: string) {
    if (pickedId || !match) return;
    setPickedId(optionId);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(
      () => {
        const next = choose(game, optionId);
        if (next.championId) {
          saveResult(quiz.id, {
            championId: next.championId,
            size: next.size,
            finishedAt: new Date().toISOString(),
          });
          clearGame(quiz.id);
          // 5. aşamada sonuç (next.results) burada sunucuya gönderilecek.
          router.replace(`/quiz/${quiz.id}/result`);
          return;
        }
        setGame(next);
        setPickedId(null);
      },
      reduceMotion ? PICK_DELAY_REDUCED_MS : PICK_DELAY_MS,
    );
  }

  // Klavye: sol ok / 1 birinci seçenek, sağ ok / 2 ikinci seçenek.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!match || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp" || event.key === "1") pick(match[0]);
      if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === "2") pick(match[1]);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!match) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-secondary" role="status">
        Sonuç hazırlanıyor…
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex flex-col gap-3 px-4 pt-3 pb-2 sm:px-6 sm:pt-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/quiz/${quiz.id}`}
            className="-ml-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-secondary transition-colors hover:bg-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-accent-soft"
            aria-label="Oyundan çık"
          >
            <ArrowLeftIcon className="size-5" />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-sm text-secondary">{quiz.title}</p>
            <p aria-live="polite" className="font-display text-lg font-bold tabular-nums sm:text-2xl">
              {progressLabel(game)}
            </p>
          </div>
          <span className="size-11 shrink-0" aria-hidden="true" />
        </div>
        <div
          role="progressbar"
          aria-label="Turnuva ilerlemesi"
          aria-valuemin={0}
          aria-valuemax={totalMatches}
          aria-valuenow={game.results.length}
          className="h-1 overflow-hidden rounded-full bg-surface"
        >
          <div
            className="h-full rounded-full bg-accent shadow-glow-sm transition-[width] duration-300 ease-out-soft"
            style={{ width: `${(game.results.length / totalMatches) * 100}%` }}
          />
        </div>
      </header>

      <main className="relative flex min-h-0 flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4 md:flex-row">
        {match.map((optionId, index) => {
          const option = optionsById.get(optionId);
          if (!option) return null;
          const state = pickedId === null ? "idle" : pickedId === optionId ? "picked" : "dropped";
          return (
            // Her seçenek kendi yarısının ortasında, sabit oranlı ve sınırlı boyutlu bir kart.
            <div key={`${game.results.length}-${optionId}`} className="flex min-h-0 flex-1 items-center justify-center">
              <button
                type="button"
                onClick={() => pick(optionId)}
                disabled={pickedId !== null}
                aria-label={`${option.name} seç`}
                aria-keyshortcuts={index === 0 ? "ArrowLeft 1" : "ArrowRight 2"}
                className={cn(
                  "flex aspect-[4/5] h-[min(100%,30rem)] max-w-full animate-pop-in cursor-pointer flex-col overflow-hidden rounded-card bg-surface ring-1 ring-accent/20",
                  "transition-[translate,scale,opacity,box-shadow] duration-300 ease-spring",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft",
                  "disabled:cursor-default",
                  state === "idle" && "hover:shadow-glow md:hover:-translate-y-1 active:scale-[0.98]",
                  state === "picked" && "z-10 scale-[1.03] shadow-glow-lg",
                  state === "dropped" && "scale-95 opacity-30",
                )}
              >
                <span className="relative block min-h-0 flex-1">
                  <MediaImage
                    src={option.mediaUrl}
                    alt=""
                    mediaType={option.mediaType}
                    sizes="(min-width: 768px) 384px, 60vw"
                    loading="eager"
                  />
                </span>
                <span className="shrink-0 px-3 py-2 text-center font-display text-sm font-semibold text-balance sm:text-base">
                  {option.name}
                </span>
              </button>
            </div>
          );
        })}

        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 z-20 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background font-display text-sm font-bold shadow-glow ring-2 ring-accent sm:size-12"
        >
          VS
        </span>
      </main>

      {/* Sıradaki eşleşmenin görsellerini önceden yükler. */}
      {upcoming && (
        <div aria-hidden="true" className="pointer-events-none fixed size-px overflow-hidden opacity-0">
          {upcoming.map((optionId) => {
            const option = optionsById.get(optionId);
            return option?.mediaUrl ? (
              <div key={optionId} className="relative size-px">
                <MediaImage
                  src={option.mediaUrl}
                  alt=""
                  mediaType={option.mediaType}
                  sizes="(min-width: 768px) 384px, 60vw"
                  loading="eager"
                />
              </div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
