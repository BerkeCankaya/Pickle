import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MediaImage } from "@/components/MediaImage";
import { CommunityActions } from "@/components/quiz/CommunityActions";
import { StartPanel } from "@/components/quiz/StartPanel";
import { formatNumber } from "@/lib/format";
import { availableSizes } from "@/lib/game/tournament";
import { getQuiz, getQuizOptions } from "@/lib/quizzes";
import { categoryLabel } from "@/types/quiz";

export async function generateMetadata(props: PageProps<"/quiz/[id]">): Promise<Metadata> {
  const quiz = await getQuiz((await props.params).id);
  return quiz ? { title: `${quiz.title} – Pickle`, description: quiz.description } : {};
}

export default async function QuizDetailPage(props: PageProps<"/quiz/[id]">) {
  const { id } = await props.params;
  const quiz = await getQuiz(id);
  if (!quiz) notFound();
  const options = await getQuizOptions(quiz.id);

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-start lg:gap-12">
      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-surface ring-1 ring-accent/20">
        <MediaImage src={quiz.coverUrl} alt="" sizes="(min-width: 768px) 55vw, 100vw" preload />
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-secondary">{categoryLabel(quiz.category)}</p>
          <h1 className="font-display text-2xl leading-tight font-bold text-balance sm:text-4xl">{quiz.title}</h1>
          {quiz.description && <p className="max-w-prose leading-relaxed">{quiz.description}</p>}
          <dl className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-secondary">
            <div className="flex gap-1">
              <dt>Oluşturan</dt>
              <dd className="text-primary">{quiz.creatorName}</dd>
            </div>
            <div className="flex gap-1">
              <dd className="tabular-nums text-primary">{formatNumber(quiz.playCount)}</dd>
              <dt>oynanma</dt>
            </div>
            <div className="flex gap-1">
              <dd className="tabular-nums text-primary">{quiz.optionCount}</dd>
              <dt>seçenek</dt>
            </div>
          </dl>
        </div>

        <StartPanel
          quizId={quiz.id}
          optionIds={options.map((option) => option.id)}
          sizes={availableSizes(quiz.optionCount)}
        />

        <CommunityActions likeCount={quiz.likeCount} />
      </div>
    </div>
  );
}
