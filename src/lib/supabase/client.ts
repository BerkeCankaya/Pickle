import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/** Tarayıcıda çalışan bileşenler için Supabase istemcisi. */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
