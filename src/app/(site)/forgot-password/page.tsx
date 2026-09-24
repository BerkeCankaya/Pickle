import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Şifremi unuttum | Pickle" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Şifreni mi unuttun?"
      description="E-posta adresini yaz, sana yeni şifre belirleyebileceğin bir bağlantı gönderelim."
      footer={
        <Link href="/login" className="text-accent-soft underline underline-offset-4 hover:text-primary">
          Giriş sayfasına dön
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
