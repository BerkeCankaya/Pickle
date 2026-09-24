import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  username: string | null;
  role: "user" | "admin";
  isBanned: boolean;
  termsAcceptedAt: string | null;
};

/**
 * Giriş yapan kullanıcının profili; giriş yapılmamışsa null.
 * Aynı istekte birden çok kez çağrılsa da veritabanına bir kez gider.
 */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) return null;

  const { data } = await supabase.rpc("get_my_profile").maybeSingle<{
    id: string;
    username: string | null;
    role: "user" | "admin";
    is_banned: boolean;
    terms_accepted_at: string | null;
  }>();
  if (!data) return null;

  return {
    id: data.id,
    username: data.username,
    role: data.role,
    isBanned: data.is_banned,
    termsAcceptedAt: data.terms_accepted_at,
  };
});

/** Kullanıcı adı seçilmiş ve kullanım koşulları kabul edilmiş mi? */
export function isProfileComplete(profile: Profile) {
  return Boolean(profile.username && profile.termsAcceptedAt);
}
