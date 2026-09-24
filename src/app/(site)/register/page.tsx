import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/AuthForms";
import { GoogleButton, OrDivider } from "@/components/auth/GoogleButton";
import { getCurrentProfile } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Kayıt ol | Pickle" };

export default async function RegisterPage() {
  if (await getCurrentProfile()) redirect("/");

  return (
    <AuthCard
      title="Pickle'a katıl"
      description="Kendi quizlerini oluştur, beğendiklerini kaydet."
      footer={
        <>
          Zaten hesabın var mı?{" "}
          <Link href="/login" className="text-accent-soft underline underline-offset-4 hover:text-primary">
            Giriş yap
          </Link>
        </>
      }
    >
      <GoogleButton next="/" />
      <OrDivider />
      <RegisterForm />
    </AuthCard>
  );
}
