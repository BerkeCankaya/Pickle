import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { CategoryId, Quiz, QuizOption } from "@/types/quiz";

// Sayfalar veriye sadece bu fonksiyonlarla ulaşır.

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

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function listQuizzes({ tab, category, query, limit }: ListQuizzesOptions) {
  const supabase = await createClient();
  // Bir fazlasını isteyip "Daha fazla" butonunun gösterilip gösterilmeyeceğini anlıyoruz.
  const { data, error } = await supabase.rpc("list_quizzes", {
    p_tab: tab,
    p_category: category,
    p_query: query,
    p_limit: limit + 1,
  });
  if (error) throw error;

  const quizzes: Quiz[] = data.slice(0, limit).map((row) => ({
    id: row.id,
    creatorId: row.creator_id,
    creatorName: row.creator_name,
    title: row.title,
    description: row.description,
    category: row.category as CategoryId,
    coverUrl: row.cover_url ?? null,
    status: "published",
    playCount: row.play_count,
    recentPlayCount: row.recent_play_count,
    likeCount: row.like_count,
    optionCount: row.option_count,
    createdAt: row.created_at,
  }));

  return { quizzes, hasMore: data.length > limit };
}

/** Yayındaki bir quiz; yoksa veya gizlenmişse null. Aynı istekte bir kez sorgulanır. */
export const getQuiz = cache(async (id: string): Promise<Quiz | null> => {
  if (!UUID_PATTERN.test(id)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select(
      "id, creator_id, title, description, category, cover_url, status, play_count, like_count, option_count, created_at, creator:profiles!quizzes_creator_id_fkey(username)",
    )
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    creatorId: data.creator_id,
    creatorName: data.creator?.username ?? "",
    title: data.title,
    description: data.description,
    category: data.category as CategoryId,
    coverUrl: data.cover_url,
    status: data.status,
    playCount: data.play_count,
    // Sadece ana sayfadaki "Popüler" sıralamasında kullanılır.
    recentPlayCount: 0,
    likeCount: data.like_count,
    optionCount: data.option_count,
    createdAt: data.created_at,
  };
});

export const getQuizOptions = cache(async (quizId: string): Promise<QuizOption[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quiz_options")
    .select("id, quiz_id, name, media_url, media_type, wins, losses, championships")
    .eq("quiz_id", quizId)
    .order("name");
  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    quizId: row.quiz_id,
    name: row.name,
    mediaUrl: row.media_url,
    mediaType: row.media_type,
    wins: row.wins,
    losses: row.losses,
    championships: row.championships,
  }));
});
