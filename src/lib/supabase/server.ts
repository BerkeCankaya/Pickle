import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Sunucu bileşenleri, Server Action'lar ve Route Handler'lar için Supabase istemcisi.
 * Her istekte yeniden oluşturulur, çünkü o isteğin çerezlerini kullanır.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Sunucu bileşenleri çerez yazamaz; oturumu src/proxy.ts yeniler.
          }
        },
      },
    },
  );
}
