import { redirect } from "next/navigation";
import { getCurrentProfile, isProfileComplete, type Profile } from "./session";

/**
 * Quiz oluşturma gibi katkı sayfaları için: giriş yapılmamışsa giriş sayfasına,
 * profil eksikse "Son bir adım" sayfasına yönlendirir.
 */
export async function requireCompleteProfile(returnTo: string): Promise<Profile> {
  const profile = await getCurrentProfile();
  const next = encodeURIComponent(returnTo);
  if (!profile) redirect(`/login?next=${next}`);
  if (!isProfileComplete(profile)) redirect(`/welcome?next=${next}`);
  return profile;
}
