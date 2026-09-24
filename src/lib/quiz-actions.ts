"use server";

import { refresh } from "next/cache";
import { MEDIA_BUCKET } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";

export type DeleteResult = { error?: string };

/** Quizi ve depodaki görsellerini siler. Sadece sahibi (veya admin) silebilir. */
export async function deleteQuiz(quizId: string): Promise<DeleteResult> {
  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, cover_url, quiz_options(media_url)")
    .eq("id", quizId)
    .maybeSingle();
  if (!quiz) return { error: "Quiz bulunamadı." };

  const { data: deleted, error } = await supabase.from("quizzes").delete().eq("id", quizId).select("id");
  if (error || !deleted?.length) return { error: "Bu quizi silme yetkin yok." };

  // Görseller depodaki yol olarak saklanır; test verilerinde görsel yoktur.
  const paths = [quiz.cover_url, ...quiz.quiz_options.map((option) => option.media_url)].filter(
    (path): path is string => Boolean(path) && !path!.startsWith("http") && !path!.startsWith("/"),
  );
  const unique = [...new Set(paths)];
  if (unique.length) await supabase.storage.from(MEDIA_BUCKET).remove(unique);

  refresh();
  return {};
}
