import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/AuthForms";
import { FormAlert } from "@/components/auth/FormAlert";
import { buttonStyles } from "@/components/ui/Button";
import { getCurrentProfile } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Yeni şifre | Pickle" };

// E-postadaki sıfırlama bağlantısı önce /auth/confirm'e gider, oturum açıp buraya yönlendirir.
export default async function ResetPasswordPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <AuthCard title="Bağlantı gerekli">
        <FormAlert tone="info">
          Yeni şifre belirlemek için e-postana gelen sıfırlama bağlantısını açmalısın. Bağlantının süresi dolduysa
          yenisini isteyebilirsin.
        </FormAlert>
        <Link href="/forgot-password" className={buttonStyles({ fullWidth: true })}>
          Yeni bağlantı iste
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Yeni şifreni belirle" description="Bundan sonra bu şifreyle giriş yapacaksın.">
      <ResetPasswordForm />
    </AuthCard>
  );
}
