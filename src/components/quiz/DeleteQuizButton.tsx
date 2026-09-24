"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { deleteQuiz } from "@/lib/quiz-actions";

/** "Sil" → "Emin misin?" onayı → sil. */
export function DeleteQuizButton({ quizId, title }: { quizId: string; title: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setConfirming(true)} aria-label={`${title} quizini sil`}>
        Sil
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <p className="text-sm text-secondary">Silinsin mi? Bu işlem geri alınamaz.</p>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={pending}>
          Vazgeç
        </Button>
        <Button
          size="sm"
          loading={pending}
          className="bg-danger text-background shadow-none hover:shadow-none"
          onClick={() =>
            startTransition(async () => {
              const result = await deleteQuiz(quizId);
              if (result.error) setError(result.error);
            })
          }
        >
          Evet, sil
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
