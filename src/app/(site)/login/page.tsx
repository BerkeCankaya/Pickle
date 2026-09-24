import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/AuthForms";
import { FormAlert } from "@/components/auth/FormAlert";
import { GoogleButton, OrDivider } from "@/components/auth/GoogleButton";
import { getCurrentProfile } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/auth/validation";

export const metadata: Metadata = { title: "Giriş yap | Pickle" };

const NOTICES: Record<string, string> = {
  google: "Google ile giriş henüz açık değil. Şimdilik e-posta ile giriş yapabilirsin.",
  baglanti: "Bu bağlantı geçersiz ya da süresi dolmuş. Tekrar dene.",
};

export default async function LoginPage(props: PageProps<"/login">) {
  const params = await props.searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);
  const notice = typeof params.hata === "string" ? NOTICES[params.hata] : undefined;

  if (await getCurrentProfile()) redirect(next);

  return (
    <AuthCard
      title="Tekrar hoş geldin"
      description="Quiz oluşturmak, beğenmek ve şikayet etmek için giriş yap."
      footer={
        <>
          Hesabın yok mu?{" "}
          <Link href="/register" className="text-accent-soft underline underline-offset-4 hover:text-primary">
            Kayıt ol
          </Link>
        </>
      }
    >
      {notice && <FormAlert tone="error">{notice}</FormAlert>}
      <GoogleButton next={next} />
      <OrDivider />
      <LoginForm next={next} />
    </AuthCard>
  );
}
