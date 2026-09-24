import { createClient } from "@/lib/supabase/client";
import type { GameState } from "./tournament";

export type RecordOutcome = "saved" | "rate_limited" | "failed";

const TIMEOUT_MS = 6000;

/**
 * Biten oyunun sonucunu veritabanına gönderir. Sonuç sunucuda doğrulanır
 * (record_play); başarısız olsa bile oyuncu sonuç sayfasına geçebilir.
 */
export async function recordPlay(game: GameState): Promise<RecordOutcome> {
  if (!game.championId) return "failed";

  const request = createClient()
    .rpc("record_play", {
      p_quiz_id: game.quizId,
      p_size: game.size,
      p_champion_id: game.championId,
      p_matches: game.results,
    })
    .then(({ error }): RecordOutcome => {
      if (!error) return "saved";
      return error.message === "rate_limited" ? "rate_limited" : "failed";
    });

  const timeout = new Promise<RecordOutcome>((resolve) => setTimeout(() => resolve("failed"), TIMEOUT_MS));

  try {
    return await Promise.race([request, timeout]);
  } catch {
    return "failed";
  }
}
