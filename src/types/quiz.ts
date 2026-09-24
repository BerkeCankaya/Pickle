// Alan adları Prd.md 7. bölümdeki tablolarla birebir eşleşir (camelCase olarak).

export const CATEGORIES = [
  { id: "yemek", label: "Yemek" },
  { id: "dizi-film", label: "Dizi & Film" },
  { id: "muzik", label: "Müzik" },
  { id: "spor", label: "Spor" },
  { id: "oyun", label: "Oyun" },
  { id: "unluler", label: "Ünlüler" },
  { id: "hayvanlar", label: "Hayvanlar" },
  { id: "diger", label: "Diğer" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function categoryLabel(id: CategoryId) {
  return CATEGORIES.find((category) => category.id === id)?.label ?? "Diğer";
}

export type MediaType = "image" | "gif";

export type QuizOption = {
  id: string;
  quizId: string;
  name: string;
  /** Görsel henüz yoksa null: arayüz yer tutucu gösterir. */
  mediaUrl: string | null;
  mediaType: MediaType;
  wins: number;
  losses: number;
  championships: number;
};

export type Quiz = {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  description: string;
  category: CategoryId;
  coverUrl: string | null;
  status: "published" | "hidden";
  playCount: number;
  /** "Popüler" sıralaması için son 7 gündeki oynanma. */
  recentPlayCount: number;
  likeCount: number;
  optionCount: number;
  createdAt: string;
};
