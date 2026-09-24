import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "KVKK aydınlatma metni | Pickle" };

export default function PrivacyPage() {
  return (
    <LegalPage title="KVKK aydınlatma metni">
      <section className="flex flex-col gap-2">
        <h2>Toplanan veriler</h2>
        <p>
          Kayıt olduğunda e-posta adresin ve seçtiğin kullanıcı adı saklanır. Google ile giriş yaparsan Google&apos;ın
          paylaştığı e-posta adresin kullanılır. Oluşturduğun quizler, beğenilerin ve şikayetlerin hesabınla
          ilişkilendirilir.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2>Kullanım amacı</h2>
        <p>
          Bu veriler yalnızca hesabını yönetmek, siteyi çalıştırmak ve kötüye kullanımı önlemek için kullanılır.
          Oyun sonuçları anonim istatistik olarak saklanır.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2>Haklarınız</h2>
        <p>
          6698 sayılı KVKK kapsamında verilerine erişme, düzeltilmesini veya silinmesini isteme hakkına sahipsin.
        </p>
      </section>
    </LegalPage>
  );
}
