# Pickle Tasarım Sistemi

Tüm sayfalar bu kurallara uyar. Çelişki olursa öncelik: 1) `Prd.md`, 2) bu dosya, 3) skill önerileri.
Tokenların kod karşılığı: `src/app/globals.css` (`@theme`). Canlı önizleme: `/tasarim` (geçici).

## Yön

Koyu, neon, enerjik, "hangisini seçerdin" heyecanı. **Tek cesur öğe: indigo neon parlama.** Parlama sadece ana butonda, etkileşimli kartlarda ve seçili durumda kullanılır; geri kalan her şey sakin kalır.

## Renkler (Prd.md 8.1, sabit)

| Token | Hex | Tailwind | Kullanım |
| --- | --- | --- | --- |
| background | `#090A0F` | `bg-background` | Sayfa arka planı (%60) |
| surface | `#242656` | `bg-surface` | Kart, header, menü, input, panel (%30) |
| accent | `#6366F1` | `bg-accent`, `ring-accent`, `shadow-glow*` | Buton dolgusu, parlama, ikon, seçili durum (%10) |
| accent-soft | `#818CF8` | `text-accent-soft` | **Sadece** küçük vurgu yazıları: link, aktif sekme |
| primary | `#F1F5F9` | `text-primary` | Ana metin |
| secondary | `#94A3B8` | `text-secondary` | Açıklama, sayılar, placeholder |
| danger / success / warning | `#F87171` / `#4ADE80` / `#FBBF24` | `text-danger` vb. | Sadece durum mesajları |

Kontrast (WCAG): `secondary` arka planda 7.7:1, kartta 5.5:1. `accent-soft` arka planda 6.6:1, kartta 4.7:1.
`accent` yazı rengi olarak **kullanılmaz** (kartta 3.2:1). Ana buton yazısı (`primary` / `accent`) 4.1:1 olduğundan buton yazıları her zaman `font-semibold`.

Kodda hex yazılmaz, yalnızca token isimleri kullanılır. Durum rengi taşıyan mesajlar her zaman açıklayıcı metin içerir (renk tek başına anlam taşımaz).

## Yazı tipleri

- **Unbounded** (`font-display`): başlıklar, tur bilgisi ("Son 16"), kazanan adı. Kalınlık 600–700.
- **Rubik** (`font-sans`, varsayılan): tüm gövde metni, buton, form. Kalınlık 400 metin, 500 etiket, 600 buton.
- İkisi de `latin-ext` alt kümesiyle yüklenir (Türkçe karakterler).
- Ölçek (Tailwind): `text-sm` 14 · `text-base` 16 · `text-xl` 20 · `text-2xl` 24 · `text-3xl` 30 · `text-5xl` 48 · `text-6xl` 60.
- Mobilde gövde metni en az 16px, satır yüksekliği `leading-relaxed` (1.625), satır uzunluğu `max-w-prose`.
- Kısa başlıklarda `text-balance`. Sayılar değişen yerlerde (sayaç, istatistik) `tabular-nums`.
- Kaçınılacaklar: etiketlerde BÜYÜK HARF, başlıkta tek kelimeyi farklı renge boyamak, gereksiz üst etiketler, `·` ile birleştirilmiş meta metinleri, buton yazısına `→` eklemek.

## Boşluk ve düzen

- 4px tabanlı ölçek (Tailwind varsayılanı). Sık kullanılanlar: 2 (8px) öğe arası, 4–5 (16–20px) kart içi, 6 (24px) form alanları arası, 14 (56px) bölümler arası.
- Sayfa kenar boşluğu: mobil `px-4`, `sm:` ve üstü `px-6`. En geniş içerik `max-w-5xl`, ortalanmış; içerik sola hizalı.
- Kırılım noktaları: Tailwind varsayılanları (`sm` 640, `md` 768, `lg` 1024). Önce mobil yazılır.
- Yükseklik için `min-h-dvh` (100vh değil). Yatay kaydırma olmaz.

## Köşeler (hiyerarşiye göre farklı)

| Öğe | Değer | Sınıf |
| --- | --- | --- |
| Buton, sekme, rozet | tam yuvarlak (hap) | `rounded-full` |
| Kart, panel, modal | 20px | `rounded-card` |
| Input, textarea, küçük kutular | 12px | `rounded-field` |

## Parlama ve derinlik

- `shadow-glow-sm`: ana butonun normal hali, odaklanan input.
- `shadow-glow`: hover durumu (buton, etkileşimli kart).
- `shadow-glow-lg`: oyunda seçilen kart, kazanan.
- Kartlarda gri gölge yok; derinlik `ring-1 ring-accent/20` ince kenar ile verilir.

## Hareket

| Durum | Süre | Eğri |
| --- | --- | --- |
| Basma geri bildirimi (`active:scale-[0.97]`) | 100ms | `ease-out-soft` |
| Hover, odak, renk geçişleri | 200ms | `ease-out-soft` |
| Oyunda kart seçimi | 300–450ms | `ease-spring` |
| Çıkış animasyonları | girişin ~%65'i | `ease-out-soft` |

- Sadece `transform` ve `opacity` (ve gölge) animasyonu; genişlik/yükseklik animasyonu yok.
- Dikkat: Tailwind v4'te `scale-*` ve `translate-*` ayrı CSS özellikleri kullanır. Geçiş yazarken `transition-[transform]` değil `transition-[translate,scale,...]` yazılır, yoksa animasyon çalışmaz.
- Animasyonlar kullanıcıyı engellemez, her zaman kesilebilir.
- Kendiliğinden oynayan hareket az: sayfa başına en fazla 1–2 öğe. Büyük an oyun seçimi ve kazanan kutlamasıdır.
- `prefers-reduced-motion` açıksa animasyonlar kapanır (globals.css'te genel kural).

## Bileşenler (`src/components/ui/`)

### Button
- Türler: `primary` (sayfada tek ana eylem), `secondary`, `ghost` (düşük öncelik: şikayet, iptal).
- Boyutlar: `sm` 44px, `md` 48px, `lg` 48px yükseklik (lg daha büyük yazı ve geniş yan boşlukla ayrışır) (hepsi ≥44px dokunma hedefi).
- `loading` durumunda dönen gösterge + pasif. `disabled` %50 opaklık.
- Link olarak kullanmak için `buttonStyles()` fonksiyonu.
- Yazı eylemi söyler: "Oyna", "Quiz oluştur", "Yayınla" (belirsiz "Gönder" değil).

### Card
- `bg-surface rounded-card ring-1 ring-accent/20`.
- `interactive`: hover/odakta `shadow-glow` + 4px yükselme. Sadece tıklanabilir kartlarda.

### Input / Textarea
- Görünür etiket zorunlu (placeholder etiket yerine geçmez). Zorunlu alanlarda `*`.
- Yardım metni veya hata alanın hemen altında, `aria-describedby` ile bağlı.
- Hata: `ring-danger` + kırmızı açıklayıcı metin; ne olduğunu ve nasıl düzeltileceğini söyler.
- `showCount` + `maxLength` ile karakter sayacı (başlık 80, açıklama 300).
- Yükseklik 48px, yazı 16px (iOS otomatik yakınlaştırmayı önler).

## Erişilebilirlik kontrol listesi

- Klavye odağı görünür (`focus-visible:outline-accent-soft` veya `ring-accent`).
- Tüm dokunma hedefleri ≥44px, aralarında ≥8px boşluk.
- Sadece ikon içeren butonlarda `aria-label`.
- Görsellerde anlamlı `alt` metni (seçenek adı).
- Başlık sırası atlanmaz (h1 → h2 → h3).
- Görsellere `aspect-ratio` veya boyut verilir (sayfa kayması olmaz).
- İkonlar SVG olur, emoji ikon olarak kullanılmaz.
