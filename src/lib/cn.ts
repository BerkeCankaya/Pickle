/** Koşullu Tailwind sınıflarını tek bir metinde birleştirir. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
