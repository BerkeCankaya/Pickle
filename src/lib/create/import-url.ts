"use server";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { getCurrentProfile, isProfileComplete } from "@/lib/auth/session";
import { MEDIA_BUCKET, mediaPublicUrl } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";
import type { MediaType } from "@/types/quiz";
import { GIF_MAX_BYTES, IMAGE_MAX_BYTES, MEDIA_EXTENSIONS, formatMegabytes, nameFromFile } from "./rules";

// Bağlantıdan resim ekleme: sunucu resmi indirir, kontrol eder ve kullanıcının
// depo klasörüne kopyalar. Böylece asıl site resmi silse de quiz bozulmaz.

export type ImportResult =
  | { ok: true; path: string; previewUrl: string; mediaType: MediaType; name: string }
  | { ok: false; error: string };

const TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 3;

function fail(error: string): ImportResult {
  return { ok: false, error };
}

/** Yerel ağ, localhost gibi dışarıya açık olmayan adresler (sunucunun iç ağına erişimi engeller). */
function isPrivateAddress(ip: string) {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith("::ffff:")) return isPrivateAddress(v6.slice(7));
  return (
    v6 === "::" ||
    v6 === "::1" ||
    v6.startsWith("fc") ||
    v6.startsWith("fd") ||
    v6.startsWith("fe8") ||
    v6.startsWith("fe9") ||
    v6.startsWith("fea") ||
    v6.startsWith("feb")
  );
}

async function isSafeUrl(url: URL) {
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  if (url.username || url.password) return false;
  if (url.port && url.port !== "80" && url.port !== "443") return false;
  const host = url.hostname.replace(/^\[|\]$/g, "");
  try {
    const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
    return addresses.length > 0 && addresses.every(({ address }) => !isPrivateAddress(address));
  } catch {
    return false;
  }
}

/** Dosya türünü içeriğin ilk baytlarından anlar (sunucunun söylediğine güvenmez). */
function sniffType(bytes: Uint8Array): string | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png";
  if (ascii(0, 4) === "GIF8") return "image/gif";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  return null;
}

/** Yönlendirmeleri tek tek kontrol ederek indirir; sınırı aşarsa yarıda keser. */
async function download(start: URL): Promise<{ bytes: Uint8Array; finalUrl: URL } | string> {
  let url = start;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!(await isSafeUrl(url))) return "Bu bağlantıya erişilemiyor.";

    let response: Response;
    try {
      response = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { "User-Agent": "PickleBot/1.0 (+quiz görseli)", Accept: "image/*" },
      });
    } catch {
      return "Bağlantıya ulaşılamadı veya çok yavaş yanıt verdi.";
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return "Bağlantı geçersiz bir yere yönlendiriyor.";
      url = new URL(location, url);
      continue;
    }
    if (!response.ok || !response.body) return "Bu bağlantıda bir resim bulunamadı.";

    const declared = Number(response.headers.get("content-length"));
    if (declared > GIF_MAX_BYTES) return `Resim çok büyük (en fazla ${formatMegabytes(GIF_MAX_BYTES)}).`;

    const chunks: Uint8Array[] = [];
    let size = 0;
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > GIF_MAX_BYTES) {
        await reader.cancel();
        return `Resim çok büyük (en fazla ${formatMegabytes(GIF_MAX_BYTES)}).`;
      }
      chunks.push(value);
    }

    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return { bytes, finalUrl: url };
  }
  return "Bağlantı çok fazla yönlendirme yapıyor.";
}

export async function importImageFromUrl(rawUrl: string): Promise<ImportResult> {
  const profile = await getCurrentProfile();
  if (!profile || !isProfileComplete(profile) || profile.isBanned) {
    return fail("Resim eklemek için giriş yapmış olmalısın.");
  }

  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return fail("Geçerli bir bağlantı değil.");
  }

  const result = await download(url);
  if (typeof result === "string") return fail(result);

  const type = sniffType(result.bytes);
  if (!type) return fail("Bu bağlantı bir JPG, PNG, WEBP veya GIF resmi değil.");

  const limit = type === "image/gif" ? GIF_MAX_BYTES : IMAGE_MAX_BYTES;
  if (result.bytes.byteLength > limit) {
    return fail(`Resim çok büyük (${formatMegabytes(result.bytes.byteLength)}, en fazla ${formatMegabytes(limit)}).`);
  }

  const path = `${profile.id}/${crypto.randomUUID()}.${MEDIA_EXTENSIONS[type]}`;
  const supabase = await createClient();
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, result.bytes, { contentType: type, cacheControl: "31536000", upsert: false });
  if (error) return fail("Resim kaydedilemedi. Lütfen tekrar dene.");

  const lastSegment = result.finalUrl.pathname.split("/").pop() ?? "";
  let fileName = lastSegment;
  try {
    fileName = decodeURIComponent(lastSegment);
  } catch {
    // Bozuk kodlanmış adlarda olduğu gibi kullan.
  }
  return {
    ok: true,
    path,
    previewUrl: mediaPublicUrl(path)!,
    mediaType: type === "image/gif" ? "gif" : "image",
    name: nameFromFile(fileName),
  };
}
