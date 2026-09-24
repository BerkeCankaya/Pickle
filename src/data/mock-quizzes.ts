import type { CategoryId, MediaType, Quiz, QuizOption } from "@/types/quiz";

// 3. aşama için sahte veriler. 5. aşamada Supabase'e bağlanınca bu dosya kaldırılacak.
// Sayılar (oynanma, beğeni, istatistik) her quiz için sabit bir tohumdan üretilir;
// böylece her yenilemede aynı çıkar.

type MockQuizSeed = {
  id: string;
  title: string;
  description: string;
  category: CategoryId;
  creatorName: string;
  createdAt: string;
  /** GÖRSEL: public/ altındaki klasör. Dosya adı = seçenek adı (ör. "Lahmacun.jpg"). */
  mediaFolder: string;
  /** GÖRSEL: klasörde "kapak.*" varsa buraya yazılacak; yoksa ilk seçenek kapak olur. */
  cover: string | null;
  options: string[];
};

const SEEDS: MockQuizSeed[] = [
  {
    id: "sokak-lezzetleri",
    title: "En iyi sokak lezzeti hangisi?",
    description: "Gece yarısı acıktın, cebinde son 200 lira var. Hangisine koşarsın?",
    category: "yemek",
    creatorName: "gurme_kedi",
    createdAt: "2026-09-20T18:30:00Z",
    mediaFolder: "/mock/sokak-lezzetleri", // GÖRSEL
    cover: null, // GÖRSEL
    options: [
      "Lahmacun", "Kokoreç", "Midye dolma", "Döner", "Islak hamburger", "Çiğ köfte",
      "Kumpir", "Tantuni", "Simit", "Kestane", "Balık ekmek", "Pilav üstü nohut",
      "Gözleme", "Pide", "Tost", "Waffle",
    ],
  },
  {
    id: "turk-dizileri",
    title: "Tüm zamanların en iyi Türk dizisi",
    description: "Nostaljiden yeni nesle, tek bir şampiyon kalacak.",
    category: "dizi-film",
    creatorName: "dizi_bagimlisi",
    createdAt: "2026-09-12T20:00:00Z",
    mediaFolder: "/mock/turk-dizileri", // GÖRSEL
    cover: null, // GÖRSEL
    options: [
      "Leyla ile Mecnun", "Ezel", "Behzat Ç.", "Avrupa Yakası", "Kurtlar Vadisi",
      "Yaprak Dökümü", "Aşk-ı Memnu", "Çocuklar Duymasın", "Kavak Yelleri", "Bir Zamanlar Çukurova",
      "Gibi", "Masumlar Apartmanı", "Yalı Çapkını", "Diriliş Ertuğrul", "Poyraz Karayel",
      "Şahsiyet", "Muhteşem Yüzyıl", "Kuzey Güney", "Bizimkiler", "Arka Sokaklar",
    ],
  },
  {
    id: "sevimli-hayvanlar",
    title: "Dünyanın en sevimli hayvanı",
    description: "Kalbin hangisine dayanamıyor? Otuz iki tatlılık, tek kazanan.",
    category: "hayvanlar",
    creatorName: "patili_dost",
    createdAt: "2026-09-23T09:15:00Z",
    mediaFolder: "/mock/sevimli-hayvanlar", // GÖRSEL
    cover: null, // GÖRSEL
    options: [
      "Kırmızı panda", "Kedi yavrusu", "Golden retriever", "Kuokka", "Su samuru", "Penguen",
      "Fennek tilkisi", "Koala", "Tavşan", "Alpaka", "Hamster", "Baykuş",
      "Kirpi", "Sincap", "Panda", "Kaplumbağa", "Ördek yavrusu", "Tembel hayvan",
      "Corgi", "Axolotl", "Chinchilla", "Fok yavrusu", "Kanguru", "Lama",
      "Rakun", "Shiba Inu", "Tilki", "Kuzu", "Keçi yavrusu", "Kuğu yavrusu",
      "Van kedisi", "Kangal",
    ],
  },
  {
    id: "efsane-oyunlar",
    title: "Efsane video oyunu seçimi",
    description: "Çocukluğunu çalan oyunlar kapışıyor.",
    category: "oyun",
    creatorName: "retro_oyuncu",
    createdAt: "2026-08-30T14:45:00Z",
    mediaFolder: "/mock/efsane-oyunlar", // GÖRSEL
    cover: null, // GÖRSEL
    options: [
      "Minecraft", "GTA San Andreas", "Counter-Strike", "The Witcher 3", "League of Legends",
      "Red Dead Redemption 2", "The Sims", "Metin2", "Zelda: Breath of the Wild", "FIFA",
      "Age of Empires II", "Half-Life 2",
    ],
  },
  {
    id: "turkce-pop",
    title: "Doksanların en iyi Türkçe pop şarkısı",
    description: "Kaset çağının hitleri. Hangisi hâlâ dilinden düşmüyor?",
    category: "muzik",
    creatorName: "kaset_devri",
    createdAt: "2026-09-05T11:00:00Z",
    mediaFolder: "/mock/turkce-pop", // GÖRSEL
    cover: null, // GÖRSEL
    options: [
      "Şımarık", "Kuzu Kuzu", "Bana Bir Masal Anlat", "Aşkın Kanunu", "Yaz Yaz Yaz",
      "Yalnızlar Rıhtımı", "Deli Divane", "Bir Derdim Var",
    ],
  },
  {
    id: "dunya-bayraklari",
    title: "En güzel bayrak hangisi?",
    description: "Altmış dört ülke bayrağı. Sadece tasarıma göre seç.",
    category: "diger",
    creatorName: "vexilloloji",
    createdAt: "2026-07-18T08:00:00Z",
    mediaFolder: "/mock/dunya-bayraklari", // GÖRSEL
    cover: null, // GÖRSEL
    options: [
      "Türkiye", "Japonya", "Kanada", "Brezilya", "Güney Kore", "Nepal", "Bhutan", "Galler",
      "İsviçre", "Yunanistan", "Meksika", "Arjantin", "Jamaika", "Güney Afrika", "Kıbrıs", "Hırvatistan",
      "Portekiz", "İspanya", "İtalya", "Fransa", "Almanya", "Norveç", "İsveç", "Finlandiya",
      "Danimarka", "İzlanda", "İrlanda", "Birleşik Krallık", "ABD", "Avustralya", "Yeni Zelanda", "Hindistan",
      "Pakistan", "Azerbaycan", "Kazakistan", "Kırgızistan", "Özbekistan", "Moğolistan", "Çin", "Vietnam",
      "Tayland", "Endonezya", "Filipinler", "Malezya", "Singapur", "Mısır", "Fas", "Tunus",
      "Kenya", "Nijerya", "Gana", "Etiyopya", "Şili", "Peru", "Kolombiya", "Küba",
      "Ukrayna", "Polonya", "Macaristan", "Romanya", "Bosna-Hersek", "Arnavutluk", "Gürcistan", "Lübnan",
    ],
  },
];

// Sabit tohumlu basit rastgele sayı üreteci (her çalıştırmada aynı sonuç).
function seededRandom(seed: string) {
  let h = 2166136261;
  for (const char of seed) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

// GÖRSEL: görseller eklenince buraya "klasör/seçenek adı": "dosya adı" eşleşmeleri yazılacak.
// Örnek: "/mock/sokak-lezzetleri/Lahmacun": "Lahmacun.jpg"
const MEDIA_FILES: Record<string, string> = {};

function optionMedia(folder: string, name: string): { url: string | null; type: MediaType } {
  const file = MEDIA_FILES[`${folder}/${name}`];
  if (!file) return { url: null, type: "image" };
  return {
    url: encodeURI(`${folder}/${file}`),
    type: file.toLowerCase().endsWith(".gif") ? "gif" : "image",
  };
}

function buildOptions(seed: MockQuizSeed, playCount: number): QuizOption[] {
  const random = seededRandom(`${seed.id}:options`);
  const strengths = seed.options.map(() => random() ** 2);
  const totalStrength = strengths.reduce((sum, value) => sum + value, 0);

  return seed.options.map((name, index) => {
    const strength = strengths[index] / totalStrength;
    const matches = Math.round(playCount * (0.4 + random() * 0.8));
    const winRate = Math.min(0.92, 0.2 + strength * seed.options.length * 0.35);
    const wins = Math.round(matches * winRate);
    const media = optionMedia(seed.mediaFolder, name);
    return {
      id: `${seed.id}-${index + 1}`,
      quizId: seed.id,
      name,
      mediaUrl: media.url,
      mediaType: media.type,
      wins,
      losses: matches - wins,
      championships: Math.round(playCount * strength),
    };
  });
}

function buildQuiz(seed: MockQuizSeed) {
  const random = seededRandom(seed.id);
  const playCount = Math.round(300 + random() * 18000);
  const options = buildOptions(seed, playCount);
  const quiz: Quiz = {
    id: seed.id,
    creatorId: `user-${seed.creatorName}`,
    creatorName: seed.creatorName,
    title: seed.title,
    description: seed.description,
    category: seed.category,
    coverUrl: seed.cover ?? options[0].mediaUrl,
    status: "published",
    playCount,
    recentPlayCount: Math.round(playCount * (0.05 + random() * 0.3)),
    likeCount: Math.round(playCount * (0.04 + random() * 0.12)),
    optionCount: options.length,
    createdAt: seed.createdAt,
  };
  return { quiz, options };
}

export const MOCK_DATA = SEEDS.map(buildQuiz);
