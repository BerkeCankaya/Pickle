// Giriş/kayıt formlarının kuralları. Hem tarayıcıda hem sunucuda kullanılır.
// Kullanıcı adı kuralı veritabanındaki kontrolle aynıdır (profiles.username).

export const USERNAME_PATTERN = "^[a-z0-9_]{3,20}$";
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const PASSWORD_MIN = 8;

const usernameRegex = new RegExp(USERNAME_PATTERN);
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function validateUsername(value: string): string | undefined {
  if (!value) return "Kullanıcı adı gerekli.";
  if (value.length < USERNAME_MIN || value.length > USERNAME_MAX) {
    return `Kullanıcı adı ${USERNAME_MIN}–${USERNAME_MAX} karakter olmalı.`;
  }
  if (!usernameRegex.test(value)) {
    return "Sadece küçük harf, rakam ve alt çizgi (_) kullanabilirsin.";
  }
}

export function validateEmail(value: string): string | undefined {
  if (!value) return "E-posta adresi gerekli.";
  if (!emailRegex.test(value)) return "Geçerli bir e-posta adresi yaz.";
}

export function validatePassword(value: string): string | undefined {
  if (!value) return "Şifre gerekli.";
  if (value.length < PASSWORD_MIN) return `Şifre en az ${PASSWORD_MIN} karakter olmalı.`;
}

/** Giriş sonrası yönlendirme adresi sadece site içi bir yol olabilir. */
export function safeNextPath(value: FormDataEntryValue | string | null | undefined) {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\") ? path : "/";
}
