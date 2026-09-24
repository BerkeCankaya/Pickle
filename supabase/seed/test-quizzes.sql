-- Test quizleri (5. aşama). Sahibi: whip. Görselsiz; istatistikler sıfırdan başlar.
-- Yayından önce bu quizler başlıklarına göre silinecek (seçenekler de birlikte silinir).
do $$
declare
  owner uuid := (select id from public.profiles where username = 'whip');
  qid uuid;
begin
  if owner is null then raise exception 'whip bulunamadı'; end if;

  insert into public.quizzes (creator_id, title, description, category, created_at, updated_at)
  values (owner, 'En iyi sokak lezzeti hangisi?', 'Gece yarısı acıktın, cebinde son 200 lira var. Hangisine koşarsın?', 'yemek', '2026-09-20T18:30:00Z', '2026-09-20T18:30:00Z')
  returning id into qid;
  insert into public.quiz_options (quiz_id, name, media_url, media_type)
  select qid, name, null, 'image' from unnest(array['Lahmacun', 'Kokoreç', 'Midye dolma', 'Döner', 'Islak hamburger', 'Çiğ köfte', 'Kumpir', 'Tantuni', 'Simit', 'Kestane', 'Balık ekmek', 'Pilav üstü nohut', 'Gözleme', 'Pide', 'Tost', 'Waffle']) as name;

  insert into public.quizzes (creator_id, title, description, category, created_at, updated_at)
  values (owner, 'Tüm zamanların en iyi Türk dizisi', 'Nostaljiden yeni nesle, tek bir şampiyon kalacak.', 'dizi-film', '2026-09-12T20:00:00Z', '2026-09-12T20:00:00Z')
  returning id into qid;
  insert into public.quiz_options (quiz_id, name, media_url, media_type)
  select qid, name, null, 'image' from unnest(array['Leyla ile Mecnun', 'Ezel', 'Behzat Ç.', 'Avrupa Yakası', 'Kurtlar Vadisi', 'Yaprak Dökümü', 'Aşk-ı Memnu', 'Çocuklar Duymasın', 'Kavak Yelleri', 'Bir Zamanlar Çukurova', 'Gibi', 'Masumlar Apartmanı', 'Yalı Çapkını', 'Diriliş Ertuğrul', 'Poyraz Karayel', 'Şahsiyet', 'Muhteşem Yüzyıl', 'Kuzey Güney', 'Bizimkiler', 'Arka Sokaklar']) as name;

  insert into public.quizzes (creator_id, title, description, category, created_at, updated_at)
  values (owner, 'Dünyanın en sevimli hayvanı', 'Kalbin hangisine dayanamıyor? Otuz iki tatlılık, tek kazanan.', 'hayvanlar', '2026-09-23T09:15:00Z', '2026-09-23T09:15:00Z')
  returning id into qid;
  insert into public.quiz_options (quiz_id, name, media_url, media_type)
  select qid, name, null, 'image' from unnest(array['Kırmızı panda', 'Kedi yavrusu', 'Golden retriever', 'Kuokka', 'Su samuru', 'Penguen', 'Fennek tilkisi', 'Koala', 'Tavşan', 'Alpaka', 'Hamster', 'Baykuş', 'Kirpi', 'Sincap', 'Panda', 'Kaplumbağa', 'Ördek yavrusu', 'Tembel hayvan', 'Corgi', 'Axolotl', 'Chinchilla', 'Fok yavrusu', 'Kanguru', 'Lama', 'Rakun', 'Shiba Inu', 'Tilki', 'Kuzu', 'Keçi yavrusu', 'Kuğu yavrusu', 'Van kedisi', 'Kangal']) as name;

  insert into public.quizzes (creator_id, title, description, category, created_at, updated_at)
  values (owner, 'Efsane video oyunu seçimi', 'Çocukluğunu çalan oyunlar kapışıyor.', 'oyun', '2026-08-30T14:45:00Z', '2026-08-30T14:45:00Z')
  returning id into qid;
  insert into public.quiz_options (quiz_id, name, media_url, media_type)
  select qid, name, null, 'image' from unnest(array['Minecraft', 'GTA San Andreas', 'Counter-Strike', 'The Witcher 3', 'League of Legends', 'Red Dead Redemption 2', 'The Sims', 'Metin2', 'Zelda: Breath of the Wild', 'FIFA', 'Age of Empires II', 'Half-Life 2']) as name;

  insert into public.quizzes (creator_id, title, description, category, created_at, updated_at)
  values (owner, 'Doksanların en iyi Türkçe pop şarkısı', 'Kaset çağının hitleri. Hangisi hâlâ dilinden düşmüyor?', 'muzik', '2026-09-05T11:00:00Z', '2026-09-05T11:00:00Z')
  returning id into qid;
  insert into public.quiz_options (quiz_id, name, media_url, media_type)
  select qid, name, null, 'image' from unnest(array['Şımarık', 'Kuzu Kuzu', 'Bana Bir Masal Anlat', 'Aşkın Kanunu', 'Yaz Yaz Yaz', 'Yalnızlar Rıhtımı', 'Deli Divane', 'Bir Derdim Var']) as name;

  insert into public.quizzes (creator_id, title, description, category, created_at, updated_at)
  values (owner, 'En güzel bayrak hangisi?', 'Altmış dört ülke bayrağı. Sadece tasarıma göre seç.', 'diger', '2026-07-18T08:00:00Z', '2026-07-18T08:00:00Z')
  returning id into qid;
  insert into public.quiz_options (quiz_id, name, media_url, media_type)
  select qid, name, null, 'image' from unnest(array['Türkiye', 'Japonya', 'Kanada', 'Brezilya', 'Güney Kore', 'Nepal', 'Bhutan', 'Galler', 'İsviçre', 'Yunanistan', 'Meksika', 'Arjantin', 'Jamaika', 'Güney Afrika', 'Kıbrıs', 'Hırvatistan', 'Portekiz', 'İspanya', 'İtalya', 'Fransa', 'Almanya', 'Norveç', 'İsveç', 'Finlandiya', 'Danimarka', 'İzlanda', 'İrlanda', 'Birleşik Krallık', 'ABD', 'Avustralya', 'Yeni Zelanda', 'Hindistan', 'Pakistan', 'Azerbaycan', 'Kazakistan', 'Kırgızistan', 'Özbekistan', 'Moğolistan', 'Çin', 'Vietnam', 'Tayland', 'Endonezya', 'Filipinler', 'Malezya', 'Singapur', 'Mısır', 'Fas', 'Tunus', 'Kenya', 'Nijerya', 'Gana', 'Etiyopya', 'Şili', 'Peru', 'Kolombiya', 'Küba', 'Ukrayna', 'Polonya', 'Macaristan', 'Romanya', 'Bosna-Hersek', 'Arnavutluk', 'Gürcistan', 'Lübnan']) as name;
end $$;
