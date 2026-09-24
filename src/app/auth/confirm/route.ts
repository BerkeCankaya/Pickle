import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { isProfileComplete, getCurrentProfile } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/server";

// E-posta doğrulama, şifre sıfırlama ve Google girişinden dönülen adres.
// - E-posta şablonları token_hash + type gönderir (Türkçe şablonlar böyle ayarlanır).
// - Varsayılan şablonlar ve Google girişi ?code= ile döner.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  const supabase = await createClient();
  let ok = false;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  }

  if (!ok) {
    return NextResponse.redirect(new URL("/login?hata=baglanti", origin));
  }

  // Google ile ilk kez gelen kullanıcı önce kullanıcı adını seçer.
  const profile = await getCurrentProfile();
  if (profile && !isProfileComplete(profile) && next !== "/reset-password") {
    return NextResponse.redirect(new URL(`/welcome?next=${encodeURIComponent(next)}`, origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}
