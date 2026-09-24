import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";

// Geçici önizleme sayfası: 3. aşamada gerçek sayfalar gelince silinecek.
export const metadata: Metadata = {
  title: "Tasarım sistemi – Pickle",
  robots: { index: false },
};

const swatches = [
  { name: "background", hex: "#090A0F", role: "Sayfa arka planı (%60)", className: "bg-background" },
  { name: "surface", hex: "#242656", role: "Kartlar, header, inputlar (%30)", className: "bg-surface" },
  { name: "accent", hex: "#6366F1", role: "Butonlar, parlama, seçili durum (%10)", className: "bg-accent" },
  { name: "accent-soft", hex: "#818CF8", role: "Küçük vurgu yazıları, linkler", className: "bg-accent-soft" },
  { name: "primary", hex: "#F1F5F9", role: "Ana metin", className: "bg-primary" },
  { name: "secondary", hex: "#94A3B8", role: "İkincil metin", className: "bg-secondary" },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignPreviewPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-4 py-10 sm:px-6 sm:py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-3xl font-bold text-balance sm:text-5xl">
          Hangisini seçerdin?
        </h1>
        <p className="max-w-prose text-secondary">
          Pickle tasarım sistemi önizlemesi. Renkler, yazı tipleri ve temel bileşenler burada
          tek ekranda görünür.
        </p>
      </header>

      <Section title="Renkler">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {swatches.map((swatch) => (
            <li key={swatch.name} className="flex flex-col gap-2">
              <div className={`h-16 rounded-field ring-1 ring-secondary/30 ${swatch.className}`} />
              <div className="text-sm">
                <p className="font-medium">{swatch.name}</p>
                <p className="text-secondary">
                  {swatch.hex} – {swatch.role}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Yazı tipleri">
        <Card className="flex flex-col gap-4 p-5 sm:p-8">
          <p className="font-display text-4xl font-bold sm:text-6xl">Son 16</p>
          <p className="font-display text-2xl font-semibold">Şampiyon: İskender mi, çiğ köfte mi?</p>
          <p className="max-w-prose leading-relaxed">
            Başlıklar Unbounded, metinler Rubik ile yazılır. Türkçe karakterler sorunsuz görünür:
            ğ ü ş ı ö ç Ğ Ü Ş İ Ö Ç.
          </p>
          <p className="text-sm text-secondary">1.284 oynanma, 312 beğeni</p>
          <a href="#" className="w-fit text-accent-soft underline underline-offset-4 hover:text-primary">
            Örnek link
          </a>
        </Card>
      </Section>

      <Section title="Butonlar">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg">Oyna</Button>
          <Button>Quiz oluştur</Button>
          <Button size="sm">Beğen</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary">Tekrar oyna</Button>
          <Button variant="ghost">Şikayet et</Button>
          <Button loading>Yükleniyor</Button>
          <Button disabled>Pasif</Button>
        </div>
      </Section>

      <Section title="Kartlar">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card interactive className="overflow-hidden">
            <a href="#" className="flex flex-col outline-none">
              <div className="flex aspect-video items-center justify-center bg-background/50 text-sm text-secondary">
                Kapak görseli
              </div>
              <div className="flex flex-col gap-2 p-4">
                <h3 className="font-display text-base font-semibold leading-snug">
                  En iyi sokak lezzeti hangisi?
                </h3>
                <p className="flex flex-wrap gap-x-3 text-sm text-secondary">
                  <span>32 seçenek</span>
                  <span>1.284 oynanma</span>
                  <span>312 beğeni</span>
                </p>
              </div>
            </a>
          </Card>
          <Card className="flex flex-col gap-2 p-5">
            <h3 className="font-display text-base font-semibold">Düz kart</h3>
            <p className="text-sm leading-relaxed text-secondary">
              Tıklanmayan içerik için. Parlamasız, sadece ince bir kenar.
            </p>
          </Card>
        </div>
      </Section>

      <Section title="Form alanları">
        <Card className="flex max-w-xl flex-col gap-6 p-5 sm:p-8">
          <Input
            label="Başlık"
            placeholder="Ör. En iyi Türk dizisi"
            required
            maxLength={80}
            showCount
          />
          <Textarea
            label="Açıklama"
            placeholder="Quiz ne hakkında?"
            hint="İsteğe bağlı"
            maxLength={300}
            showCount
          />
          <Input
            label="Kullanıcı adı"
            defaultValue="Quiz Ustası!"
            error="Kullanıcı adı sadece küçük harf, rakam ve alt çizgi içerebilir."
          />
          <Input label="E-posta" type="email" placeholder="ornek@mail.com" disabled />
        </Card>
      </Section>
    </main>
  );
}
