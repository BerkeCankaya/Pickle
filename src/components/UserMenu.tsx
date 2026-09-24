import Link from "next/link";
import { ChevronDownIcon, ImageIcon, LogOutIcon, UserIcon } from "@/components/icons";
import { buttonStyles } from "@/components/ui/Button";
import { signOut } from "@/lib/auth/actions";
import { getCurrentProfile, isProfileComplete } from "@/lib/auth/session";

const itemStyle =
  "flex w-full items-center gap-3 rounded-field px-3 py-2.5 text-left text-sm text-primary " +
  "cursor-pointer hover:bg-background/60 focus-visible:outline-2 focus-visible:outline-accent-soft";

/** Üst menünün sağ ucu: giriş yapılmamışsa "Giriş yap", yapılmışsa kullanıcı menüsü. */
export async function UserMenu() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <Link
        href="/login"
        aria-label="Giriş yap"
        className={buttonStyles({ variant: "ghost", size: "sm", className: "px-3 sm:px-4" })}
      >
        <UserIcon className="size-5" />
        <span className="hidden sm:inline">Giriş yap</span>
      </Link>
    );
  }

  const complete = isProfileComplete(profile);
  const name = profile.username ?? "Hesabım";

  return (
    <details className="group relative">
      <summary
        aria-label={`Hesap menüsü: ${name}`}
        className={buttonStyles({
          variant: "ghost",
          size: "sm",
          className: "list-none px-3 sm:px-4 [&::-webkit-details-marker]:hidden",
        })}
      >
        <UserIcon className="size-5" />
        <span className="hidden max-w-32 truncate sm:inline">{name}</span>
        {!complete && <span className="size-2 rounded-full bg-warning" aria-hidden="true" />}
        <ChevronDownIcon className="size-4 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 z-30 mt-2 flex w-56 flex-col gap-1 rounded-card bg-surface p-2 shadow-glow-sm ring-1 ring-accent/30">
        <p className="truncate px-3 pt-1 pb-2 text-sm text-secondary">
          {profile.username ? `@${profile.username}` : "Kullanıcı adı seçilmedi"}
        </p>
        {!complete && (
          <Link href="/welcome" className={itemStyle}>
            <span className="size-2 rounded-full bg-warning" aria-hidden="true" />
            Profilini tamamla
          </Link>
        )}
        {complete && (
          <Link href="/my-quizzes" className={itemStyle}>
            <ImageIcon className="size-4" />
            Quizlerim
          </Link>
        )}
        <form action={signOut}>
          <button type="submit" className={itemStyle}>
            <LogOutIcon className="size-4" />
            Çıkış yap
          </button>
        </form>
      </div>
    </details>
  );
}
