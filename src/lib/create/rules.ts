// Quiz oluşturma kuralları. Tarayıcıda ve sunucuda kullanılır;
// Prd.md 4.5 ve veritabanındaki create_quiz() ile aynıdır.

export const MIN_OPTIONS = 8;
export const MAX_OPTIONS = 64;
export const OPTION_NAME_MAX = 60;
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const GIF_MAX_BYTES = 10 * 1024 * 1024;
/** Sıkıştırmadan önce kabul edilen en büyük resim (telefon fotoğrafları için). */
export const RAW_IMAGE_MAX_BYTES = 25 * 1024 * 1024;

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const ACCEPT_ATTR = ACCEPTED_TYPES.join(",");

export const MEDIA_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function formatMegabytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} MB`;
}

/** Dosyayı kabul edilebilir mi diye kontrol eder; sorun varsa Türkçe açıklama döner. */
export function checkFile(file: File): string | undefined {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `${file.name}: sadece JPG, PNG, WEBP veya GIF yükleyebilirsin.`;
  }
  if (file.type === "image/gif" && file.size > GIF_MAX_BYTES) {
    return `${file.name}: GIF'ler en fazla ${formatMegabytes(GIF_MAX_BYTES)} olabilir.`;
  }
  if (file.type !== "image/gif" && file.size > RAW_IMAGE_MAX_BYTES) {
    return `${file.name}: bu resim çok büyük (${formatMegabytes(file.size)}).`;
  }
}

/** "kirmizi_panda-1.jpg" → "kirmizi panda 1" */
export function nameFromFile(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, OPTION_NAME_MAX);
}

const CREATE_ERRORS: Record<string, string> = {
  not_allowed: "Quiz oluşturma yetkin yok. Hesabının engellenmediğinden ve profilini tamamladığından emin ol.",
  too_many_quizzes: "Bugün çok fazla quiz oluşturdun. Yarın tekrar deneyebilirsin.",
  invalid_title: "Başlık 1–50 karakter olmalı.",
  invalid_description: "Açıklama en fazla 300 karakter olabilir.",
  invalid_category: "Geçerli bir kategori seç.",
  invalid_option_count: `Quizde en az ${MIN_OPTIONS}, en fazla ${MAX_OPTIONS} seçenek olmalı.`,
  invalid_option_name: `Her seçeneğin 1–${OPTION_NAME_MAX} karakterlik bir adı olmalı.`,
  duplicate_media: "Aynı görsel birden fazla kez eklenmiş.",
  invalid_media: "Görsellerden biri kabul edilmedi. Sayfayı yenileyip tekrar dene.",
  file_too_large: "Görsellerden biri boyut sınırını aşıyor.",
};

export function createErrorMessage(code: string | undefined) {
  return (code && CREATE_ERRORS[code]) || "Quiz yayınlanamadı. Lütfen tekrar dene.";
}
