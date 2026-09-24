import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Her istekte süresi dolmak üzere olan oturumu yeniler ve yeni çerezleri
 * hem sayfaya hem tarayıcıya iletir. src/proxy.ts tarafından çağrılır.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // createServerClient ile bu satır arasına kod eklenmemeli: oturum burada yenilenir.
  await supabase.auth.getClaims();

  return response;
}
