import type { Metadata } from "next";
import Link from "next/link";
import { HeartIcon, PlayIcon, PlusIcon } from "@/components/icons";
import { MediaImage } from "@/components/MediaImage";
import { DeleteQuizButton } from "@/components/quiz/DeleteQuizButton";
import { buttonStyles } from "@/components/ui/Button";
import { requireCompleteProfile } from "@/lib/auth/guard";
import { formatNumber } from "@/lib/format";
import { mediaPublicUrl } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Quizlerim | Pickle" };

export default async function MyQuizzesPage() {
  const profile = await requireCompleteProfile("/my-quizzes");

  const supabase = await createClient();
  const { data: quizzes, error } = await supabase
    .from("quizzes")
    .select("id, title, cover_url, status, play_count, like_count, option_count")
    .eq("creator_id", profile.id)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-bold">Quizlerim</h1>
          <p className="text-secondary">Yayınladığın quizler. Quizler düzenlenemez, sadece silinebilir.</p>
        </div>
        <Link href="/create" className={buttonStyles({ size: "sm" })}>
          <PlusIcon className="size-4" />
          Yeni quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-card bg-surface p-6 ring-1 ring-accent/20">
          <p className="font-display text-xl font-semibold">Henüz quiz oluşturmadın</p>
          <p className="text-secondary">İlk quizini oluştur, arkadaşların oynamaya başlasın.</p>
          <Link href="/create" className={buttonStyles()}>
            Quiz oluştur
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {quizzes.map((quiz) => (
            <li
              key={quiz.id}
              className="flex flex-wrap items-center gap-4 rounded-card bg-surface p-3 ring-1 ring-accent/20 sm:flex-nowrap"
            >
              <Link
                href={`/quiz/${quiz.id}`}
                className="flex min-w-0 flex-1 items-center gap-4 rounded-field focus-visible:outline-2 focus-visible:outline-accent-soft"
              >
                <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-field bg-background/40">
                  <MediaImage src={mediaPublicUrl(quiz.cover_url)} alt="" sizes="96px" />
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="truncate font-semibold">{quiz.title}</p>
                  <p className="flex flex-wrap items-center gap-4 text-sm text-secondary">
                    <span className="inline-flex items-center gap-1.5">
                      <PlayIcon className="size-4" />
                      <span className="tabular-nums">{formatNumber(quiz.play_count)}</span>
                      <span className="sr-only">oynanma</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <HeartIcon className="size-4" />
                      <span className="tabular-nums">{formatNumber(quiz.like_count)}</span>
                      <span className="sr-only">beğeni</span>
                    </span>
                    <span>{quiz.option_count} seçenek</span>
                    {quiz.status === "hidden" && (
                      <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs text-warning">
                        Gizlendi
                      </span>
                    )}
                  </p>
                </div>
              </Link>
              <div className="ml-auto">
                <DeleteQuizButton quizId={quiz.id} title={quiz.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
