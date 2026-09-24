import type { Metadata } from "next";
import { FormAlert } from "@/components/auth/FormAlert";
import { CreateQuizForm } from "@/components/create/CreateQuizForm";
import { requireCompleteProfile } from "@/lib/auth/guard";

export const metadata: Metadata = { title: "Quiz oluştur | Pickle" };

export default async function CreateQuizPage() {
  const profile = await requireCompleteProfile("/create");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold text-balance">Quiz oluştur</h1>
        <p className="max-w-prose leading-relaxed text-secondary">
          Resim veya GIF&apos;lerini yükle, her birine bir ad ver ve yayınla. Oyuncular her turda ikisinden birini
          seçecek.
        </p>
      </div>
      {profile.isBanned ? (
        <FormAlert tone="error">
          Hesabın kısıtlandığı için quiz oluşturamazsın. Quizleri oynamaya devam edebilirsin.
        </FormAlert>
      ) : (
        <CreateQuizForm userId={profile.id} />
      )}
    </div>
  );
}
