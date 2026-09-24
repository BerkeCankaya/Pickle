import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { WelcomeForm } from "@/components/auth/AuthForms";
import { getCurrentProfile, isProfileComplete } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/auth/validation";

export const metadata: Metadata = { title: "Hoş geldin | Pickle" };

// Google ile ilk kez giriş yapan kullanıcı burada kullanıcı adını seçer ve koşulları kabul eder.
export default async function WelcomePage(props: PageProps<"/welcome">) {
  const params = await props.searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);

  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent("/welcome")}`);
  if (isProfileComplete(profile)) redirect(next);

  return (
    <AuthCard
      title="Son bir adım"
      description={
        profile.username
          ? "Devam etmeden önce kullanım koşullarını onaylaman gerekiyor."
          : "Diğer oyuncuların göreceği kullanıcı adını seç. Bunu daha sonra değiştiremezsin."
      }
    >
      <WelcomeForm next={next} username={profile.username} />
    </AuthCard>
  );
}
