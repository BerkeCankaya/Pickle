import { useSyncExternalStore } from "react";
import { isTournamentSize, type GameState, type TournamentSize } from "./tournament";

// Oyun durumu tarayıcıda (localStorage) tutulur; sayfa yenilense de oyun devam eder.
// Gizli sekme veya engellenmiş depolamada sessizce çalışmaya devam eder.

const CHANGE_EVENT = "pickle-storage";
const gameKey = (quizId: string) => `pickle:game:${quizId}`;
const resultKey = (quizId: string) => `pickle:result:${quizId}`;

export type StoredResult = { championId: string; size: TournamentSize; finishedAt: string };

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Depolama kullanılamıyor: oyun yine oynanır, sadece yenilemede kaybolur.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function parse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Kayıtlı oyunu çözer; bozuksa, bitmişse veya seçenekler değiştiyse yok sayar. */
export function parseGame(raw: string | null, quizId: string, validOptionIds: string[]): GameState | null {
  const data = parse(raw) as GameState | null;
  if (
    !data ||
    data.version !== 1 ||
    data.quizId !== quizId ||
    !isTournamentSize(data.size) ||
    !Array.isArray(data.round) ||
    data.championId
  ) {
    return null;
  }
  const valid = new Set(validOptionIds);
  return data.round.every((id) => valid.has(id)) ? data : null;
}

export function parseResult(raw: string | null): StoredResult | null {
  const data = parse(raw) as StoredResult | null;
  return data && typeof data.championId === "string" ? data : null;
}

export function loadGame(quizId: string, validOptionIds: string[]) {
  return parseGame(readRaw(gameKey(quizId)), quizId, validOptionIds);
}

export function saveGame(state: GameState) {
  writeRaw(gameKey(state.quizId), JSON.stringify(state));
}

export function clearGame(quizId: string) {
  writeRaw(gameKey(quizId), null);
}

export function saveResult(quizId: string, result: StoredResult) {
  writeRaw(resultKey(quizId), JSON.stringify(result));
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** Depodaki ham değeri okur; sunucuda ve ilk çizimde null döner, değişince günceller. */
function useStoredRaw(key: string) {
  return useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null,
  );
}

export function useStoredGameRaw(quizId: string) {
  return useStoredRaw(gameKey(quizId));
}

export function useStoredResultRaw(quizId: string) {
  return useStoredRaw(resultKey(quizId));
}
