import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameLoader } from "@/components/game/GameLoader";
import { isTournamentSize } from "@/lib/game/tournament";
import { getQuiz, getQuizOptions } from "@/lib/quizzes";

export async function generateMetadata(props: PageProps<"/quiz/[id]/play">): Promise<Metadata> {
  const quiz = await getQuiz((await props.params).id);
  return quiz ? { title: `${quiz.title} oynanıyor – Pickle`, robots: { index: false } } : {};
}

export default async function PlayPage(props: PageProps<"/quiz/[id]/play">) {
  const { id } = await props.params;
  const quiz = await getQuiz(id);
  if (!quiz) notFound();
  const options = await getQuizOptions(quiz.id);

  const sizeParam = Number((await props.searchParams).boyut);
  const requestedSize = isTournamentSize(sizeParam) ? sizeParam : null;

  return <GameLoader quiz={quiz} options={options} requestedSize={requestedSize} />;
}
