// Veritabanı görsel için depodaki dosya yolunu tutar ("<kullanıcı id>/<dosya>").
// Sayfalarda gösterirken herkese açık tam adrese çevrilir.

export const MEDIA_BUCKET = "quiz-media";

const PUBLIC_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/`;

export function mediaPublicUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return PUBLIC_BASE + path.split("/").map(encodeURIComponent).join("/");
}
