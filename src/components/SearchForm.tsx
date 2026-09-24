"use client";

import { useSearchParams } from "next/navigation";
import { SearchIcon } from "@/components/icons";

export function SearchForm() {
  const query = useSearchParams().get("q") ?? "";

  return (
    <form action="/" role="search" className="relative">
      <label htmlFor="site-search" className="sr-only">
        Quiz ara
      </label>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-secondary" />
      <input
        // URL değişince (ör. logoya tıklayınca) kutunun içeriği de güncellensin.
        key={query}
        id="site-search"
        name="q"
        type="search"
        defaultValue={query}
        placeholder="Quiz ara"
        className="h-11 w-full rounded-full bg-surface pr-4 pl-11 text-base text-primary placeholder:text-secondary ring-1 ring-secondary/30 outline-none transition-[box-shadow] duration-200 hover:ring-secondary/60 focus:ring-2 focus:ring-accent"
      />
    </form>
  );
}
