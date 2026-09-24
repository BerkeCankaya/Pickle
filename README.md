# Pickle

Uwufufu tarzı bir turnuva quiz sitesi: kullanıcılar resim/GIF'lerden eleme usulü quizler oluşturur, diğerleri her turda iki seçenekten birini seçerek oynar. Tüm gereksinimler için [Prd.md](Prd.md) dosyasına bak.

## Kurulum

Gerekenler: [Node.js](https://nodejs.org) 20 veya üzeri.

```bash
npm install        # bağımlılıkları kur (ilk seferde)
npm run dev        # geliştirme sunucusunu başlat → http://localhost:3000
```

Diğer komutlar:

- `npm run build` – siteyi yayına hazır hale getirir (hata varsa burada görünür)
- `npm run lint` – kod kalitesi kontrolü

Gizli anahtarlar için `.env.example` dosyasını `.env.local` adıyla kopyalayıp doldur. `.env.local` git'e eklenmez.

## Klasör yapısı

```
src/
  app/             Sayfalar (Next.js App Router: her klasör bir adres)
  components/      Sayfalarda kullanılan bileşenler
  components/ui/   Temel bileşenler: buton, kart, input
  lib/             Yardımcı fonksiyonlar, Supabase bağlantısı
  lib/game/        Turnuva / oyun mantığı
  data/            Veritabanı öncesi sahte örnek veriler
  types/           TypeScript tip tanımları
public/            Statik dosyalar (resimler, ikonlar)
design-system/     Tasarım sistemi kuralları
```

## Teknolojiler

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase
