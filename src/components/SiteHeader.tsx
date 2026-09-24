import Link from "next/link";
import { Suspense } from "react";
import { PlusIcon } from "@/components/icons";
import { SearchForm } from "@/components/SearchForm";
import { buttonStyles } from "@/components/ui/Button";
import { UserMenu } from "@/components/UserMenu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-accent/15 bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap sm:px-6">
        <Link
          href="/"
          className="mr-auto rounded-field font-display text-xl font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-soft sm:mr-0"
        >
          Pickle
        </Link>

        <div className="order-last w-full sm:order-none sm:mx-auto sm:max-w-md">
          <Suspense fallback={<div className="h-11 rounded-full bg-surface" />}>
            <SearchForm />
          </Suspense>
        </div>

        <Link href="/create" className={buttonStyles({ variant: "secondary", size: "sm" })}>
          <PlusIcon className="size-4" />
          Quiz oluştur
        </Link>
        <Suspense fallback={<div className="h-11 w-11 sm:w-28" />}>
          <UserMenu />
        </Suspense>
      </div>
    </header>
  );
}
