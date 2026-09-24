// Supabase'in İngilizce hata kodlarını kullanıcıya gösterilecek Türkçe metne çevirir.

const AUTH_ERRORS: Record<string, string> = {
  invalid_credentials: "E-posta veya şifre hatalı.",
  email_not_confirmed: "Önce e-posta adresini doğrulamalısın. Gelen kutunu kontrol et.",
  user_already_exists: "Bu e-posta adresiyle zaten bir hesap var.",
  email_exists: "Bu e-posta adresiyle zaten bir hesap var.",
  weak_password: "Bu şifre çok zayıf. Daha uzun ve tahmin edilmesi zor bir şifre seç.",
  same_password: "Yeni şifren eskisinden farklı olmalı.",
  email_address_invalid: "Bu e-posta adresi kabul edilmiyor.",
  over_email_send_rate_limit: "Çok fazla e-posta gönderildi. Biraz bekleyip tekrar dene.",
  over_request_rate_limit: "Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.",
  signup_disabled: "Şu anda yeni kayıt alınmıyor.",
  otp_expired: "Bağlantının süresi dolmuş. Yeniden iste.",
  session_not_found: "Oturumun sona ermiş. Tekrar giriş yap.",
};

export const GENERIC_ERROR = "Bir şeyler ters gitti. Lütfen tekrar dene.";

export function authErrorMessage(error: { code?: string } | null | undefined) {
  return (error?.code && AUTH_ERRORS[error.code]) || GENERIC_ERROR;
}
