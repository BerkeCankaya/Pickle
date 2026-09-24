import Link from "next/link";
import { HeartIcon, PlayIcon } from "@/components/icons";
import { MediaImage } from "@/components/MediaImage";
import { Card } from "@/components/ui/Card";
import { formatNumber } from "@/lib/format";
import type { Quiz } from "@/types/quiz";

export function QuizCard({ quiz, preload = false }: { quiz: Quiz; preload?: boolean }) {
  return (
    <Card interactive className="overflow-hidden">
      <Link
        href={`/quiz/${quiz.id}`}
        className="flex h-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-inset rounded-card"
      >
        <div className="relative aspect-[4/3] bg-background/40">
          <MediaImage
            src={quiz.coverUrl}
            alt=""
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            preload={preload}
          />
          <span className="absolute top-3 left-3 rounded-full bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur">
            {quiz.optionCount} seçenek
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <h3 className="font-display text-base leading-snug font-semibold text-balance">{quiz.title}</h3>
          <p className="mt-auto flex gap-4 text-sm text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <PlayIcon className="size-4" />
              <span className="tabular-nums">{formatNumber(quiz.playCount)}</span>
              <span className="sr-only">oynanma</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <HeartIcon className="size-4" />
              <span className="tabular-nums">{formatNumber(quiz.likeCount)}</span>
              <span className="sr-only">beğeni</span>
            </span>
          </p>
        </div>
      </Link>
    </Card>
  );
}
