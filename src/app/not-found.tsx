import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { buttonStyles } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start justify-center gap-5 px-4 py-16 sm:px-6">
        <p className="font-display text-6xl font-bold text-accent-soft sm:text-8xl">404</p>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Bu sayfa elendi</h1>
        <p className="max-w-prose text-secondary">
          Aradığın sayfa yok ya da henüz hazır değil. Ana sayfadan bir quiz seçerek devam edebilirsin.
        </p>
        <Link href="/" className={buttonStyles()}>
          Ana sayfaya dön
        </Link>
      </main>
    </>
  );
}
