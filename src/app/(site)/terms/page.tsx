import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Kullanım koşulları | Pickle" };

export default function TermsPage() {
  return (
    <LegalPage title="Kullanım koşulları">
      <section className="flex flex-col gap-2">
        <h2>1. Hizmet</h2>
        <p>
          Pickle, kullanıcıların resim ve GIF&apos;lerden oluşan eleme usulü quizler oluşturup oynayabildiği bir
          platformdur. Siteyi kullanarak bu koşulları kabul etmiş olursun.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2>2. Hesabın</h2>
        <p>
          Hesabının güvenliğinden sen sorumlusun. Seçtiğin kullanıcı adı başkalarını yanıltıcı, hakaret içeren veya
          başkasına ait olmamalıdır.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2>3. Yüklediğin içerikler</h2>
        <p>
          Oluşturduğun quizlerden ve yüklediğin tüm görsellerden yalnızca sen sorumlusun. Telif hakkı sana ait
          olmayan, uygunsuz, yasa dışı veya başkalarının haklarını ihlal eden içerik yükleyemezsin.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2>4. Kurallara uyulmaması</h2>
        <p>
          Şikayet edilen veya bu koşullara uymayan quizler gizlenebilir ya da silinebilir. Kuralları ihlal eden
          hesapların quiz oluşturma, beğenme ve şikayet etme yetkileri kaldırılabilir.
        </p>
      </section>
    </LegalPage>
  );
}
