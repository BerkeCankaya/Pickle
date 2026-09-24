import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaImage } from "@/components/MediaImage";
import { ResultWinnerLoader } from "@/components/result/ResultWinnerLoader";
import { buttonStyles } from "@/components/ui/Button";
import { formatNumber, formatPercent, winRate } from "@/lib/format";
import { getQuiz, getQuizOptions } from "@/lib/quizzes";

export async function generateMetadata(props: PageProps<"/quiz/[id]/result">): Promise<Metadata> {
  const quiz = await getQuiz((await props.params).id);
  return quiz ? { title: `${quiz.title} sonuçları – Pickle`, robots: { index: false } } : {};
}

export default async function ResultPage(props: PageProps<"/quiz/[id]/result">) {
  const { id } = await props.params;
  const quiz = await getQuiz(id);
  if (!quiz) notFound();
  const options = await getQuizOptions(quiz.id);

  const ranking = options
    .map((option) => ({ ...option, rate: winRate(option.wins, option.losses) }))
    .sort((a, b) => b.championships - a.championships || b.rate - a.rate);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-12">
      <ResultWinnerLoader
        quizId={quiz.id}
        options={options.map(({ id, name, mediaUrl, mediaType }) => ({ id, name, mediaUrl, mediaType }))}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href={`/quiz/${quiz.id}`} className={buttonStyles({ size: "lg" })}>
          Tekrar oyna
        </Link>
        <Link href="/" className={buttonStyles({ variant: "secondary", size: "lg" })}>
          Başka quizler
        </Link>
      </div>

      <section aria-labelledby="ranking-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="ranking-heading" className="font-display text-xl font-semibold">
            Diğer oyuncular ne seçti?
          </h2>
          <p className="text-sm text-secondary">
            {quiz.title} – toplam {formatNumber(quiz.playCount)} oynanma
          </p>
        </div>

        <div className="overflow-hidden rounded-card bg-surface ring-1 ring-accent/20">
          <table className="w-full text-left text-sm">
            <thead className="text-secondary">
              <tr className="border-b border-accent/15">
                <th scope="col" className="w-10 py-3 pl-4 font-medium">
                  <span className="sr-only">Sıra</span>
                </th>
                <th scope="col" className="py-3 pr-2 font-medium">
                  Seçenek
                </th>
                <th scope="col" className="py-3 pr-2 text-right font-medium">
                  Şampiyonluk
                </th>
                <th scope="col" className="py-3 pr-4 text-right font-medium">
                  Kazanma oranı
                </th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((option, index) => (
                <tr key={option.id} className="border-b border-accent/10 last:border-0">
                  <td className="py-2.5 pl-4 font-display font-semibold tabular-nums text-secondary">
                    {index + 1}
                  </td>
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-field bg-background/40">
                        <MediaImage src={option.mediaUrl} alt="" mediaType={option.mediaType} sizes="40px" />
                      </div>
                      <span className="font-medium">{option.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-2 text-right tabular-nums">{formatNumber(option.championships)}</td>
                  <td className="py-2.5 pr-4 text-right tabular-nums">{formatPercent(option.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
