// Quiz oluşturma (tarayıcı): sıkıştırma ve depoya yükleme. Kurallar ./rules.ts içinde.

import { createClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET } from "@/lib/media";
import { GIF_MAX_BYTES, IMAGE_MAX_BYTES, MEDIA_EXTENSIONS, formatMegabytes } from "./rules";

/** Küçültülen resmin uzun kenarı en fazla bu kadar piksel olur. */
const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 0.85;

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

/** Dosyayı sıkıştırıp kullanıcının klasörüne yükler; depodaki yolunu döner. */
export async function uploadMedia(userId: string, file: File): Promise<string> {
  const blob = await compressImage(file);
  const type = blob.type || file.type;
  const limit = type === "image/gif" ? GIF_MAX_BYTES : IMAGE_MAX_BYTES;
  if (blob.size > limit) {
    throw new UploadError(`${file.name}: sıkıştırıldıktan sonra bile ${formatMegabytes(limit)} sınırını aşıyor.`);
  }

  const path = `${userId}/${crypto.randomUUID()}.${MEDIA_EXTENSIONS[type] ?? "bin"}`;
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

