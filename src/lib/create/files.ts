// Quiz oluşturma: dosya kontrolü, tarayıcıda sıkıştırma ve depoya yükleme.
// Kurallar Prd.md 4.5 ve veritabanındaki create_quiz() ile aynıdır.

import { createClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET } from "@/lib/media";

export const MIN_OPTIONS = 8;
export const MAX_OPTIONS = 64;
export const OPTION_NAME_MAX = 60;
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const GIF_MAX_BYTES = 10 * 1024 * 1024;
/** Sıkıştırmadan önce kabul edilen en büyük resim (telefon fotoğrafları için). */
const RAW_IMAGE_MAX_BYTES = 25 * 1024 * 1024;
/** Küçültülen resmin uzun kenarı en fazla bu kadar piksel olur. */
const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 0.85;

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const ACCEPT_ATTR = ACCEPTED_TYPES.join(",");

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

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image_load_failed"));
    };
    image.src = url;
  });
}

/**
 * Resmi en fazla 1600 piksele küçültüp WEBP'ye çevirir. GIF'lere dokunmaz
 * (animasyon bozulmasın). Sonuç orijinalden büyükse orijinal kullanılır.
 */
export async function compressImage(file: File): Promise<Blob> {
  if (file.type === "image/gif") return file;

  const image = await loadImage(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")?.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", WEBP_QUALITY));
  // Bazı tarayıcılar WEBP üretemez (image/png döner); o zaman küçük olanı seç.
  if (!blob || blob.size >= file.size) return file;
  return blob;
}

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** Dosyayı sıkıştırıp kullanıcının klasörüne yükler; depodaki yolunu döner. */
export async function uploadMedia(userId: string, file: File): Promise<string> {
  const blob = await compressImage(file);
  const type = blob.type || file.type;
  const limit = type === "image/gif" ? GIF_MAX_BYTES : IMAGE_MAX_BYTES;
  if (blob.size > limit) {
    throw new UploadError(`${file.name}: sıkıştırıldıktan sonra bile ${formatMegabytes(limit)} sınırını aşıyor.`);
  }

  const path = `${userId}/${crypto.randomUUID()}.${EXTENSIONS[type] ?? "bin"}`;
  const { error } = await createClient()
    .storage.from(MEDIA_BUCKET)
    .upload(path, blob, { contentType: type, cacheControl: "31536000", upsert: false });
  if (error) throw new UploadError(`${file.name} yüklenemedi. İnternet bağlantını kontrol edip tekrar dene.`);
  return path;
}

/** Yarıda kalan bir yayınlamada yüklenmiş dosyaları temizler. */
export async function removeMedia(paths: string[]) {
  if (paths.length === 0) return;
  await createClient().storage.from(MEDIA_BUCKET).remove(paths);
}

export class UploadError extends Error {}

/** Görevleri aynı anda en fazla `limit` tane olacak şekilde çalıştırır. */
export async function runWithLimit<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const index = next++;
      results[index] = await tasks[index]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
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
