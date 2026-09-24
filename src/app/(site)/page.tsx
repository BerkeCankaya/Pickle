import Link from "next/link";
import { QuizCard } from "@/components/QuizCard";
import { buttonStyles } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { PAGE_SIZE, QUIZ_TABS, listQuizzes, type QuizTab } from "@/lib/quizzes";
import { CATEGORIES, type CategoryId } from "@/types/quiz";

type Filters = { tab: QuizTab; category?: CategoryId; query?: string; page: number };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseFilters(params: Record<string, string | string[] | undefined>): Filters {
  const tab = first(params.sekme);
  const category = first(params.kategori);
  const query = first(params.q)?.trim();
  const page = Number(first(params.sayfa));
  return {
    tab: QUIZ_TABS.some((item) => item.id === tab) ? (tab as QuizTab) : "populer",
    category: CATEGORIES.some((item) => item.id === category) ? (category as CategoryId) : undefined,
    query: query || undefined,
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

/** Mevcut filtreleri koruyarak yeni bir adres üretir. */
function filterHref(current: Filters, change: Partial<Filters>) {
  const next = { ...current, page: 1, ...change };
  const params = new URLSearchParams();
  if (next.query) params.set("q", next.query);
  if (next.tab !== "populer") params.set("sekme", next.tab);
  if (next.category) params.set("kategori", next.category);
  if (next.page > 1) params.set("sayfa", String(next.page));
  const search = params.toString();
  return search ? `/?${search}` : "/";
}

export default async function HomePage(props: PageProps<"/">) {
  const filters = parseFilters(await props.searchParams);
  const { quizzes, hasMore } = await listQuizzes({
    tab: filters.tab,
    category: filters.category,
    query: filters.query,
    limit: PAGE_SIZE * filters.page,
  });

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold text-balance sm:text-5xl">
          {filters.query ? `“${filters.query}” için sonuçlar` : "Hangisini seçerdin?"}
        </h1>
        {!filters.query && (
          <p className="max-w-prose text-secondary">
            Her turda iki seçenek, sonunda tek bir kazanan. Bir quiz seç, turnuvayı başlat.
          </p>
        )}
      </section>

      <div className="flex flex-col gap-4">
        <nav aria-label="Sıralama" className="flex gap-6 border-b border-accent/15">
          {QUIZ_TABS.map((tab) => {
            const active = tab.id === filters.tab;
            return (
              <Link
                key={tab.id}
                href={filterHref(filters, { tab: tab.id })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative -mb-px flex min-h-11 items-center border-b-2 text-sm font-medium transition-colors duration-200 sm:text-base",
                  active
                    ? "border-accent text-accent-soft"
                    : "border-transparent text-secondary hover:text-primary",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <nav aria-label="Kategoriler" className="flex flex-wrap gap-2">
          {[{ id: undefined, label: "Tümü" }, ...CATEGORIES].map((category) => {
            const active = category.id === filters.category;
            return (
              <Link
                key={category.label}
                href={filterHref(filters, { category: category.id })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors duration-200",
                  active
                    ? "bg-accent font-medium text-primary"
                    : "bg-surface text-secondary hover:text-primary",
                )}
              >
                {category.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {quizzes.length > 0 ? (
        <ul className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz, index) => (
            <li key={quiz.id}>
              <QuizCard quiz={quiz} preload={index < 3} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-start gap-4 rounded-card bg-surface/50 p-6 ring-1 ring-accent/15">
          <p>
            {filters.query
              ? "Aramana uyan bir quiz bulunamadı. Farklı bir kelime dene."
              : "Bu kategoride henüz quiz yok."}
          </p>
          <Link href="/" className={buttonStyles({ variant: "secondary", size: "sm" })}>
            Tüm quizleri gör
          </Link>
        </div>
      )}

      {hasMore && (
        <Link
          href={filterHref(filters, { page: filters.page + 1 })}
          scroll={false}
          className={buttonStyles({ variant: "secondary", className: "self-center" })}
        >
          Daha fazla yükle
        </Link>
      )}
    </div>
  );
}
