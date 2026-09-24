// Turnuva mantığı: saf fonksiyonlar, tarayıcıya veya veritabanına bağımlı değil.

export const TOURNAMENT_SIZES = [8, 16, 32, 64] as const;
export type TournamentSize = (typeof TOURNAMENT_SIZES)[number];

export type MatchResult = { winnerId: string; loserId: string };

export type GameState = {
  version: 1;
  quizId: string;
  size: TournamentSize;
  /** Bu turdaki seçenekler, eşleşme sırasıyla: [0,1], [2,3], ... */
  round: string[];
  /** Bu turda kazananlar; tur bitince yeni tura karıştırılarak geçer. */
  winners: string[];
  matchIndex: number;
  results: MatchResult[];
  championId: string | null;
};

type Random = () => number;

export function isTournamentSize(value: number): value is TournamentSize {
  return (TOURNAMENT_SIZES as readonly number[]).includes(value);
}

/** Seçenek sayısına göre oynanabilecek turnuva boyutları (ör. 20 seçenek → 8, 16). */
export function availableSizes(optionCount: number): TournamentSize[] {
  return TOURNAMENT_SIZES.filter((size) => size <= optionCount);
}

function shuffle<T>(items: T[], random: Random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createGame(
  quizId: string,
  optionIds: string[],
  size: TournamentSize,
  random: Random = Math.random,
): GameState {
  if (optionIds.length < size) {
    throw new Error(`Bu quizde ${size} kişilik turnuva için yeterli seçenek yok.`);
  }
  return {
    version: 1,
    quizId,
    size,
    round: shuffle(optionIds, random).slice(0, size),
    winners: [],
    matchIndex: 0,
    results: [],
    championId: null,
  };
}

export function currentMatch(state: GameState): [string, string] | null {
  if (state.championId) return null;
  const first = state.round[state.matchIndex * 2];
  const second = state.round[state.matchIndex * 2 + 1];
  return first && second ? [first, second] : null;
}

/** Aynı turdaki bir sonraki eşleşme (görselleri önceden yüklemek için). */
export function upcomingMatch(state: GameState): [string, string] | null {
  const first = state.round[(state.matchIndex + 1) * 2];
  const second = state.round[(state.matchIndex + 1) * 2 + 1];
  return first && second ? [first, second] : null;
}

export function choose(state: GameState, winnerId: string, random: Random = Math.random): GameState {
  const match = currentMatch(state);
  if (!match || !match.includes(winnerId)) return state;

  const loserId = match[0] === winnerId ? match[1] : match[0];
  const results = [...state.results, { winnerId, loserId }];
  const winners = [...state.winners, winnerId];
  const roundFinished = (state.matchIndex + 1) * 2 >= state.round.length;

  if (!roundFinished) {
    return { ...state, winners, results, matchIndex: state.matchIndex + 1 };
  }
  if (winners.length === 1) {
    return { ...state, winners, results, championId: winnerId };
  }
  return { ...state, round: shuffle(winners, random), winners: [], results, matchIndex: 0 };
}

export function roundLabel(roundSize: number) {
  if (roundSize === 2) return "Final";
  if (roundSize === 4) return "Yarı final";
  if (roundSize === 8) return "Çeyrek final";
  return `Son ${roundSize}`;
}

/** Üstteki tur bilgisi: "Son 16 – 3/8". */
export function progressLabel(state: GameState) {
  return `${roundLabel(state.round.length)} – ${state.matchIndex + 1}/${state.round.length / 2}`;
}
