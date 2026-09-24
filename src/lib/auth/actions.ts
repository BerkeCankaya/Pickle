"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { authErrorMessage, GENERIC_ERROR } from "./messages";
import {
  normalizeUsername,
  safeNextPath,
  validateEmail,
  validatePassword,
  validateUsername,
} from "./validation";

export type FormState = {
  /** Formun üstünde gösterilen genel hata. */
  error?: string;
  /** Alan adına göre hata mesajları. */
  fieldErrors?: Record<string, string | undefined>;
  /** İşlem başarılıysa gösterilecek mesaj (ör. "E-postanı kontrol et"). */
  success?: string;
  /** Form gönderilince React alanları sıfırlar; yazılanları geri doldurmak için. */
  values?: Record<string, string>;
};

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function hasErrors(fieldErrors: FormState["fieldErrors"]) {
  return Object.values(fieldErrors ?? {}).some(Boolean);
}

/** E-postalardaki bağlantıların döneceği site adresi (ör. http://localhost:3000). */
async function siteOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const protocol = h.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

function confirmUrl(origin: string, next: string) {
  return `${origin}/auth/confirm?next=${encodeURIComponent(next)}`;
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));
  const values = { email };

  const fieldErrors = {
    email: validateEmail(email),
    password: password ? undefined : "Şifre gerekli.",
  };
  if (hasErrors(fieldErrors)) return { fieldErrors, values };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: authErrorMessage(error), values };

  redirect(next);
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const username = normalizeUsername(text(formData, "username"));
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const acceptedTerms = formData.get("terms") === "on";
  const values = { username, email };

  const fieldErrors = {
    username: validateUsername(username),
    email: validateEmail(email),
    password: validatePassword(password),
    terms: acceptedTerms ? undefined : "Devam etmek için kullanım koşullarını kabul etmelisin.",
  };
  if (hasErrors(fieldErrors)) return { fieldErrors, values };

  const supabase = await createClient();

  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (taken) {
    return { fieldErrors: { username: "Bu kullanıcı adı alınmış." }, values };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Veritabanındaki tetikleyici bunları profile yazar.
      data: { username, terms_accepted: true },
      emailRedirectTo: confirmUrl(await siteOrigin(), "/"),
    },
  });
  if (error) return { error: authErrorMessage(error), values };

  // Supabase, adres zaten kayıtlıysa güvenlik gereği hata vermez; kimliği boş döner.
  if (data.user && data.user.identities?.length === 0) {
    return { error: "Bu e-posta adresiyle zaten bir hesap var. Giriş yapmayı dene.", values };
  }

  return {
    success: `${email} adresine bir doğrulama bağlantısı gönderdik. Bağlantıya tıklayınca hesabın açılacak.`,
  };
}

/** Google girişi Supabase panelinden açılmış mı? (Kapalıyken Supabase bir hata sayfası gösterir.) */
async function isGoogleEnabled() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! },
      cache: "no-store",
    });
    const settings = (await response.json()) as { external?: { google?: boolean } };
    return settings.external?.google === true;
  } catch {
    return false;
  }
}

export async function signInWithGoogle(formData: FormData) {
  const next = safeNextPath(formData.get("next"));
  if (!(await isGoogleEnabled())) redirect("/login?hata=google");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: confirmUrl(await siteOrigin(), next) },
  });

  if (error || !data.url) redirect("/login?hata=google");
  redirect(data.url);
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email").toLowerCase();
  const emailError = validateEmail(email);
  if (emailError) return { fieldErrors: { email: emailError }, values: { email } };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: confirmUrl(await siteOrigin(), "/reset-password"),
  });
  if (error?.code === "over_email_send_rate_limit" || error?.code === "over_request_rate_limit") {
    return { error: authErrorMessage(error), values: { email } };
  }

  // Hesabın var olup olmadığını belli etmemek için her durumda aynı mesaj.
  return {
    success: `Bu adrese kayıtlı bir hesap varsa, ${email} adresine şifre sıfırlama bağlantısı gönderdik.`,
  };
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const fieldErrors = {
    password: validatePassword(password),
    confirm: password === confirm ? undefined : "Şifreler aynı değil.",
  };
  if (hasErrors(fieldErrors)) return { fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: authErrorMessage(error) };

  redirect("/");
}

export async function completeProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const username = normalizeUsername(text(formData, "username"));
  const acceptedTerms = formData.get("terms") === "on";
  const next = safeNextPath(formData.get("next"));
  const values = { username };

  const fieldErrors = {
    username: validateUsername(username),
    terms: acceptedTerms ? undefined : "Devam etmek için kullanım koşullarını kabul etmelisin.",
  };
  if (hasErrors(fieldErrors)) return { fieldErrors, values };

  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_profile", { p_username: username });
  if (error) {
    if (error.message === "username_taken") {
      return { fieldErrors: { username: "Bu kullanıcı adı alınmış." }, values };
    }
    if (error.message === "invalid_username") {
      return { fieldErrors: { username: validateUsername(username) ?? GENERIC_ERROR }, values };
    }
    if (error.message === "not_authenticated") redirect("/login");
    return { error: GENERIC_ERROR, values };
  }

  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
