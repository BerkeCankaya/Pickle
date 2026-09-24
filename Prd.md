# Pickle – Ürün Gereksinim Dokümanı (PRD)

## 1. Proje Özeti

Pickle, Uwufufu tarzı bir turnuva quiz sitesidir. Kullanıcılar resim veya GIF'lerden oluşan eleme usulü quizler oluşturur, diğer kullanıcılar da her turda iki seçenekten birini seçerek oynar. Seçilmeyen elenir, sonunda tek bir kazanan kalır. Oyun bitince kullanıcı, diğer oyuncuların sonuçlarını gösteren istatistikleri görür.

- **Dil:** Sadece Türkçe (tüm arayüz metinleri, hata mesajları ve e-postalar Türkçe)
- **Hedef kitle:** Türkiye'deki genç kullanıcılar (15–30 yaş), ağırlıklı olarak mobil
- **Temel değer:** Hızlı, eğlenceli, paylaşılabilir "hangisini seçerdin" deneyimi

## 2. Teknoloji Yığını

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend / Veritabanı:** Supabase (PostgreSQL, Auth, Storage)
- **Giriş sistemi:** Supabase Auth – e-posta/şifre ve Google ile giriş
- **Dosya depolama:** Supabase Storage (quiz resimleri ve GIF'ler)
- **Yayın:** Vercel (ileride)
Benim açık onayım olmadan siteyi hiçbir yere yayınlama ve Vercel gibi servislere bağlanma.

Tüm veritabanı tablolarında Row Level Security (RLS) açık olmalı ve kurallar yazılmalıdır.

## 3. Kullanıcı Rolleri

- **Misafir (giriş yapmamış):** Quizleri gezebilir ve oynayabilir, sonuç istatistiklerini görebilir. Quiz oluşturamaz, beğenemez, şikayet edemez.
- **Kayıtlı kullanıcı:** Misafirin yapabildiği her şey + quiz oluşturma, kendi quizlerini silme, beğenme, şikayet etme.
- **Admin:** Kayıtlı kullanıcının yapabildiği her şey + şikayetleri görme, quizleri gizleme/silme, kullanıcıları engelleme.

## 4. Sayfalar

### 4.1 Ana Sayfa (`/`)
- Üstte logo, arama çubuğu, "Quiz Oluştur" butonu ve giriş/profil butonu
- "Popüler" (son 7 gündeki oynanma sayısına göre), "Yeni" ve "En Çok Beğenilen" sekmeleri
- Kategori filtreleri (ör. Yemek, Dizi & Film, Müzik, Spor, Oyun, Ünlüler, Hayvanlar, Diğer)
- Quiz kartları: kapak görseli, başlık, seçenek sayısı, oynanma sayısı, beğeni sayısı
- Sonsuz kaydırma veya "Daha fazla yükle" butonu

### 4.2 Quiz Detay / Başlangıç Sayfası (`/quiz/[id]`)
- Kapak görseli, başlık, açıklama, oluşturan kullanıcı, oynanma ve beğeni sayısı
- Tur seçimi: quizdeki seçenek sayısına göre kullanıcı kaç kişilik turnuva oynamak istediğini seçer (ör. 64 seçenekli bir quizde 8, 16, 32 veya 64). Daha küçük tur seçilirse seçenekler rastgele seçilir.
- "Oyna" butonu
- Beğen butonu (sadece giriş yapmış kullanıcılar) ve şikayet butonu

### 4.3 Oyun Ekranı (`/quiz/[id]/play`)
- Ekranda iki seçenek yan yana (mobilde üst üste) büyük kartlar halinde gösterilir
- Üstte tur bilgisi: "Son 16 – 3/8" gibi
- Kullanıcı bir karta tıklar, kısa bir seçim animasyonu olur, sonraki eşleşmeye geçilir
- Geri alma butonu yoktur; yapılan seçim kesindir
- Oyun durumu tarayıcıda tutulur; sayfa yenilense bile kaldığı yerden devam edebilmeli

### 4.4 Sonuç Sayfası (`/quiz/[id]/result`)
- Kazanan seçenek büyük ve kutlama animasyonuyla gösterilir
- Sıralama tablosu: tüm seçenekler için şampiyonluk sayısı ve kazanma oranı
- "Tekrar Oyna", "Başka Quizler" butonları

### 4.5 Quiz Oluşturma (`/create`) – sadece giriş yapmış kullanıcılar
- Başlık (zorunlu, en fazla 80 karakter), açıklama (isteğe bağlı, en fazla 300 karakter), kategori seçimi
- Kapak görseli yükleme (boş bırakılırsa ilk seçenek kapak olur)
- Seçenek ekleme: toplu resim/GIF yükleme (sürükle-bırak destekli), her seçeneğe bir isim verme
- Seçenek sayısı en az 8, en fazla 64 olmalı
- İzin verilen dosya türleri: JPG, PNG, WEBP, GIF. Resimler için en fazla 5 MB, GIF'ler için en fazla 10 MB
- Resimler yüklenmeden önce tarayıcıda sıkıştırılmalı
- Yükleme ilerlemesi gösterilmeli
- Taslak özelliği yoktur; quiz tek seferde oluşturulur ve "Yayınla" butonuyla yayınlanır
- Yayınlanan quiz hemen herkese görünür olur
- Yayınlanan quiz **düzenlenemez**; sahibi yalnızca `/my-quizzes` sayfasından silebilir

### 4.6 Giriş / Kayıt (`/login`, `/register`)
- E-posta + şifre ile kayıt ve giriş
- "Google ile devam et" butonu
- Şifremi unuttum akışı
- Kayıtta kullanıcı adı seçimi (benzersiz olmalı; 3–20 karakter, küçük harf, rakam ve alt çizgi)
- Google ile ilk kez giriş yapan kullanıcıya ek bir adım gösterilir: kullanıcı adı seçimi + kullanım koşullarını kabul. Bu adım tamamlanmadan quiz oluşturamaz, beğenemez, şikayet edemez.

### 4.7 Kullanıcının Quizleri (`/my-quizzes`)
- Kullanıcının oluşturduğu quizlerin listesi, oynanma ve beğeni sayılarıyla
- Sadece sil butonu (düzenleme yoktur)

### 4.8 Admin Paneli (`/admin`) – sadece admin
- Şikayet edilen quizlerin listesi (şikayet sayısı ve sebepleriyle)
- Quizi gizleme, silme veya şikayeti reddetme
- Kullanıcıyı engelleme: engellenen kullanıcı giriş yapıp oynayabilir ama quiz oluşturamaz, beğenemez, şikayet edemez. Daha önce yayınladığı quizler görünmeye devam eder.
- İlk admin, Supabase'de SQL ile elle atanır

## 5. Oyun Mantığı

- Turnuva boyutu her zaman 2'nin kuvveti olmalı: 8, 16, 32 veya 64
- Quizdeki seçenek sayısı 2'nin kuvveti olmak zorunda değildir; oynanabilecek turnuva boyutları, seçenek sayısından küçük veya ona eşit olan 8/16/32/64 değerleridir (ör. 20 seçenekte 8 veya 16)
- Küçük turnuvalarda oynanan eşleşmeler de istatistiklere sayılır
- Oyun başında seçilen seçenekler rastgele karıştırılır ve ikişerli eşleştirilir
- Her turda kazananlar bir sonraki tura geçer, yeniden rastgele eşleştirilir
- Son kalan seçenek şampiyondur
- Oyun bittiğinde sonuç veritabanına kaydedilir:
  - Quizin oynanma sayısı 1 artar
  - Şampiyon seçeneğin şampiyonluk sayısı 1 artar
  - Her eşleşmede kazanan seçeneğin galibiyet sayısı, kaybedenin mağlubiyet sayısı artar
- **Kazanma oranı** = galibiyet / (galibiyet + mağlubiyet)
- Misafirler de oynayabildiği için sonuç kaydetme işlemi sunucu tarafında yapılmalı ve kötüye kullanıma karşı basit bir sınırlama olmalı (ör. aynı tarayıcıdan aynı quiz için dakikada en fazla birkaç sonuç)

## 6. Beğenme ve Şikayet

- **Beğenme:** Sadece giriş yapmış kullanıcılar. Her kullanıcı bir quizi bir kez beğenebilir, tekrar tıklayınca beğeni geri alınır.
- **Şikayet:** Sadece giriş yapmış kullanıcılar. Sebep seçimi: Uygunsuz içerik, Telif hakkı ihlali, Spam, Diğer (isteğe bağlı açıklama). Bir kullanıcı aynı quizi bir kez şikayet edebilir.
- Belirli bir şikayet sayısına (ör. 5) ulaşan quiz otomatik olarak gizlenir ve admin incelemesine düşer.
- Admin şikayeti reddederse: açık şikayetler reddedildi olarak işaretlenir, quiz tekrar yayına döner ve şikayet sayacı sıfırlanır. Daha önce şikayet etmiş kullanıcılar aynı quizi tekrar şikayet edemez.

## 7. Veritabanı Tabloları (Taslak)

- **profiles:** id (auth kullanıcısıyla eşleşir), username, avatar_url, role (user/admin), is_banned, created_at
- **quizzes:** id, creator_id, title, description, category, cover_url, status (published/hidden), play_count, like_count, created_at, updated_at
- **quiz_options:** id, quiz_id, name, media_url, media_type (image/gif), wins, losses, championships
- **likes:** user_id, quiz_id, created_at (ikisi birlikte benzersiz)
- **reports:** id, quiz_id, reporter_id, reason, note, status (open/resolved/rejected), created_at

Bu yapı taslaktır; Claude daha iyi bir yapı önerirse tartışmaya açıktır.

## 8. Tasarım

- **Hava:** Koyu tema, neon parlamalar, oyunsu ve enerjik

### 8.1 Renk Paleti (60-30-10 Kuralı)

Sitenin tüm renkleri 60-30-10 kuralına göre dağıtılmalı. Bu renkler sabittir; skill'ler veya başka öneriler bu paletin yerine farklı renkler kullanmamalı.

| Oran | Renk | Kullanım Alanı |
| --- | --- | --- |
| %60 | `#090A0F` | Sayfa arka plan rengi ve genel boş alanlar |
| %30 | `#242656` | Kartlar, header, menüler, input alanları, paneller ve ikincil yüzeyler |
| %10 | `#6366F1` | Vurgu rengi: ana butonlar, linkler, aktif sekmeler, seçili durumlar, ikonlar ve neon parlama (glow) efektleri |

**Metin renkleri:**

| Renk | Kullanım Alanı |
| --- | --- |
| `#F1F5F9` | Ana metinler: başlıklar, gövde metinleri, buton yazıları |
| `#94A3B8` | İkincil metinler: açıklamalar, tarih, oynanma sayısı gibi yardımcı bilgiler, placeholder'lar |

- Bu renkler Tailwind yapılandırmasında (ör. `background`, `surface`, `accent`, `text-primary`, `text-secondary` gibi anlamlı isimlerle) tanımlanmalı ve kod içinde doğrudan hex değeri yazmak yerine bu isimler kullanılmalı
- Vurgu rengi `#6366F1` sayfanın yaklaşık %10'unu geçmemeli; her yere kullanılırsa etkisini kaybeder
- **Açık vurgu tonu `#818CF8` (`accent-soft`):** `#6366F1` küçük yazılarda yeterli kontrast sağlamadığı için (kart üstünde 3.2:1) linkler, aktif sekme yazısı gibi küçük vurgu **yazıları** bu tonla yazılır (arka planda 6.6:1, kart üstünde 4.7:1). Buton dolguları, parlamalar ve ikonlar `#6366F1` kalır. Paletin tek istisnasıdır.
- Hata, başarı ve uyarı mesajları için gerekirse ek durum renkleri (kırmızı, yeşil, sarı) sadece bu amaçla ve az miktarda kullanılabilir

### 8.2 Görsel Efektler ve Düzen

- Kartlarda `#6366F1` tonunda hafif parlama (glow) efektleri, butonlarda hover animasyonları
- Oyun ekranında seçim anında tatmin edici animasyonlar, sonuç sayfasında konfeti benzeri kutlama efekti
- Önce mobil tasarlanmalı (mobile-first), sonra masaüstüne uyarlanmalı
- Okunabilirlik korunmalı: vurgu rengi uzun metinler için değil vurgu için kullanılmalı, metin ve arka plan arasındaki kontrast yeterli olmalı

### 8.3 Kullanılacak Skill'ler

- **UI UX Pro Max:** Tasarım sistemini (font eşleşmeleri, boşluklar, bileşen stilleri, UX kuralları) oluşturmak için kullanılmalı. Renk önerisi yapmamalı, yukarıdaki sabit paleti kullanmalı. Oluşturulan tasarım sistemi `design-system/` klasörüne kaydedilmeli.
- **frontend-design:** Sayfaları ve bileşenleri kodlarken kullanılmalı; tasarımın jenerik ve şablon gibi görünmemesi, özgün ve özenli durması için.
- Tüm sayfalar `design-system/` klasöründeki kurallara ve bu bölümdeki renk paletine uymalı. İki skill'in önerileri çelişirse öncelik sırası şudur: 1) bu PRD'deki renkler ve kurallar, 2) `design-system/` klasörü, 3) skill önerileri.

## 9. İlk Sürümde OLMAYACAKLAR

Bu özellikler ilk sürüme eklenmemeli, sonraya bırakılmalı:

- Yorum yapma
- Sonuç paylaşma linki / sosyal medya görselleri
- Herkese açık profil sayfaları ve takip sistemi
- YouTube videosu veya yazı seçenekleri (sadece resim ve GIF olacak)
- İngilizce veya başka dil desteği
- Bildirimler
- Reklam ve ödeme sistemleri

## 10. Yasal ve Güvenlik

- Kullanım koşulları ve KVKK aydınlatma metni sayfaları (şimdilik basit yer tutucu metinlerle)
- Kayıt sırasında kullanım koşullarının kabul edilmesi
- Kullanıcıların yüklediği içeriklerden kendilerinin sorumlu olduğu kullanım koşullarında belirtilmeli
- Tüm formlarda hem tarayıcı hem sunucu tarafında doğrulama
- Gizli anahtarlar (Supabase service key vb.) asla tarayıcı koduna konmamalı, `.env.local` dosyasında tutulmalı ve bu dosya git'e eklenmemeli

## 11. Geliştirme Aşamaları

1. **Kurulum:** Next.js + Tailwind projesi, klasör yapısı, git
2. **Tasarım sistemi:** Renkler, fontlar, temel bileşenler (buton, kart, input)
3. **Oyun (sahte verilerle):** Ana sayfa, quiz detay, oyun ekranı ve sonuç sayfası, veritabanı olmadan örnek verilerle
4. **Supabase:** Veritabanı tabloları, RLS kuralları, giriş/kayıt (e-posta + Google)
5. **Gerçek veri:** Oyunun ve istatistiklerin veritabanına bağlanması
6. **Quiz oluşturma:** Oluşturma sayfası, resim/GIF yükleme
7. **Topluluk:** Beğenme, şikayet, admin paneli
8. **Cila:** Animasyonlar, hata durumları, boş durumlar, yükleme ekranları, mobil testleri

## 12. Claude İçin Çalışma Kuralları

- Her aşamaya başlamadan önce ne yapacağını kısaca anlat ve onayımı bekle
- Anlamadığın veya eksik gördüğün bir şey olursa tahmin yürütmek yerine bana sor
- Bir seferde sadece bir aşama üzerinde çalış
- Her aşama bittiğinde siteyi nasıl çalıştırıp test edeceğimi söyle ve git commit at
- Açıklamaları Türkçe ve yeni başlayan birinin anlayacağı şekilde yap
- Kod içindeki değişken ve fonksiyon adları İngilizce olabilir, ama kullanıcıya görünen tüm metinler Türkçe olmalı