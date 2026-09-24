import type { ReactNode } from "react";
import { FormAlert } from "@/components/auth/FormAlert";

/** Kullanım koşulları ve KVKK sayfalarının ortak düzeni. */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="mx-auto flex w-full max-w-prose flex-col gap-6">
      <h1 className="font-display text-3xl font-bold text-balance">{title}</h1>
      <FormAlert tone="info">
        Bu metin geçici bir taslaktır. Site yayına alınmadan önce bir hukukçu tarafından hazırlanan metinle
        değiştirilecektir.
      </FormAlert>
      <div className="flex flex-col gap-6 leading-relaxed text-secondary [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-primary">
        {children}
      </div>
    </article>
  );
}
