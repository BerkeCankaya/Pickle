import { MOCK_DATA } from "@/data/mock-quizzes";
import type { CategoryId, Quiz, QuizOption } from "@/types/quiz";

// Sayfalar veriye sadece bu fonksiyonlarla ulaşır.
// 5. aşamada içleri Supabase sorgularıyla değiştirilecek; imzalar aynı kalacak.

export const QUIZ_TABS = [
  { id: "populer", label: "Popüler" },
  { id: "yeni", label: "Yeni" },
  { id: "begenilen", label: "En çok beğenilen" },
] as const;

export type QuizTab = (typeof QUIZ_TABS)[number]["id"];

export const PAGE_SIZE = 12;

type ListQuizzesOptions = {
  tab: QuizTab;
  category?: CategoryId;
  query?: string;
  limit: number;
};

const sorters: Record<QuizTab, (a: Quiz, b: Quiz) => number> = {
  populer: (a, b) => b.recentPlayCount - a.recentPlayCount,
  yeni: (a, b) => b.createdAt.localeCompare(a.createdAt),
  begenilen: (a, b) => b.likeCount - a.likeCount,
};

function normalize(text: string) {
  return text.toLocaleLowerCase("tr").trim();
}

export async function listQuizzes({ tab, category, query, limit }: ListQuizzesOptions) {
  const search = query ? normalize(query) : "";
  const matches = MOCK_DATA.map((entry) => entry.quiz)
    .filter((quiz) => quiz.status === "published")
    .filter((quiz) => !category || quiz.category === category)
    .filter((quiz) => !search || normalize(quiz.title).includes(search))
    .sort(sorters[tab]);

  return { quizzes: matches.slice(0, limit), hasMore: matches.length > limit };
}

export async function getQuiz(id: string): Promise<Quiz | null> {
  const entry = MOCK_DATA.find((item) => item.quiz.id === id);
  return entry && entry.quiz.status === "published" ? entry.quiz : null;
}

export async function getQuizOptions(quizId: string): Promise<QuizOption[]> {
  return MOCK_DATA.find((item) => item.quiz.id === quizId)?.options ?? [];
}
