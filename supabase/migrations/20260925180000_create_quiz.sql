-- Pickle 6. aşama: quiz oluşturma ve görsel yükleme.
--   * quiz-media deposu: herkes görür; kullanıcı sadece kendi klasörüne yükler
--   * create_quiz(): quiz + seçenekleri tek seferde, kontrol ederek oluşturur
--   * İstemcinin quizzes/quiz_options tablolarına doğrudan eklemesi kapatılır
--
-- media_url ve cover_url artık depodaki dosya yolunu tutar: "<kullanıcı id>/<dosya>".
-- Tam adresi uygulama üretir (src/lib/media.ts).

-- ---------------------------------------------------------------------------
-- Depo
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quiz-media',
  'quiz-media',
  true,
  10485760, -- 10 MB (GIF sınırı; resimler için 5 MB create_quiz'de kontrol edilir)
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

create policy "Katkı yapabilen kullanıcı kendi klasörüne yükleyebilir"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'quiz-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select private.can_contribute())
  );

-- Quiz silinince görseller de silinir: sahibi kendi dosyalarını, admin hepsini.
-- Silme işlemi dosyayı önce okumayı gerektirdiği için aynı kurallarla select de açılır
-- (depo zaten herkese açık olduğundan yeni bir şey göstermez).
create policy "Sahibi veya admin görselleri görebilir"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'quiz-media'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select private.is_admin())
    )
  );

create policy "Sahibi veya admin görselleri silebilir"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'quiz-media'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select private.is_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- Doğrudan ekleme kapatılır; quizler sadece create_quiz() ile oluşur.
-- ---------------------------------------------------------------------------

drop policy "Katkı yapabilen kullanıcı quiz oluşturabilir" on public.quizzes;
drop policy "Quiz sahibi seçenek ekleyebilir" on public.quiz_options;
revoke insert on public.quizzes from authenticated;
revoke insert on public.quiz_options from authenticated;

-- ---------------------------------------------------------------------------
-- create_quiz
-- ---------------------------------------------------------------------------

-- Yüklenmiş bir dosyayı kontrol eder ve türünü döner ('image' / 'gif').
-- Dosya çağıranın klasöründe olmalı, türü ve boyutu kurallara uymalı.
create function private.check_upload(p_path text, p_owner uuid)
returns public.media_type
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  mime text;
  size bigint;
begin
  if p_path is null or p_path not like p_owner::text || '/%' or p_path like '%..%' then
    raise exception 'invalid_media';
  end if;

  select o.metadata ->> 'mimetype', (o.metadata ->> 'size')::bigint
  into mime, size
  from storage.objects o
  where o.bucket_id = 'quiz-media' and o.name = p_path;

  if not found then
    raise exception 'invalid_media';
  end if;

  if mime = 'image/gif' then
    if size > 10485760 then raise exception 'file_too_large'; end if;
    return 'gif';
  elsif mime in ('image/jpeg', 'image/png', 'image/webp') then
    if size > 5242880 then raise exception 'file_too_large'; end if;
    return 'image';
  end if;

  raise exception 'invalid_media';
end;
$$;

revoke all on function private.check_upload(text, uuid) from public;

-- p_options: [{ "name": "Lahmacun", "path": "<uid>/<dosya>" }, ...]
-- Hata kodları (Türkçe mesaja uygulama çevirir): not_allowed, too_many_quizzes,
-- invalid_title, invalid_description, invalid_category, invalid_option_count,
-- invalid_option_name, duplicate_media, invalid_media, file_too_large.
create function public.create_quiz(
  p_title text,
  p_description text,
  p_category text,
  p_cover_path text,
  p_options jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  clean_title text := btrim(coalesce(p_title, ''));
  clean_description text := btrim(coalesce(p_description, ''));
  option_total integer;
  new_quiz_id uuid;
  item jsonb;
  option_name text;
  option_path text;
  first_path text;
begin
  if uid is null or not (select private.can_contribute()) then
    raise exception 'not_allowed';
  end if;

  -- Kötüye kullanım sınırı: 24 saatte en fazla 20 quiz.
  if (
    select count(*) from public.quizzes q
    where q.creator_id = uid and q.created_at > now() - interval '1 day'
  ) >= 20 then
    raise exception 'too_many_quizzes';
  end if;

  if char_length(clean_title) not between 1 and 50 then
    raise exception 'invalid_title';
  end if;
  if char_length(clean_description) > 300 then
    raise exception 'invalid_description';
  end if;
  if p_category is null or p_category not in
    ('yemek', 'dizi-film', 'muzik', 'spor', 'oyun', 'unluler', 'hayvanlar', 'diger') then
    raise exception 'invalid_category';
  end if;

  if p_options is null or jsonb_typeof(p_options) <> 'array' then
    raise exception 'invalid_option_count';
  end if;
  option_total := jsonb_array_length(p_options);
  if option_total not between 8 and 64 then
    raise exception 'invalid_option_count';
  end if;

  if (select count(distinct e ->> 'path') from jsonb_array_elements(p_options) e) <> option_total then
    raise exception 'duplicate_media';
  end if;

  if p_cover_path is not null then
    perform private.check_upload(p_cover_path, uid);
  end if;

  insert into public.quizzes (creator_id, title, description, category, cover_url)
  values (uid, clean_title, clean_description, p_category, p_cover_path)
  returning id into new_quiz_id;

  for item in select value from jsonb_array_elements(p_options) loop
    option_name := btrim(coalesce(item ->> 'name', ''));
    option_path := item ->> 'path';
    if char_length(option_name) not between 1 and 60 then
      raise exception 'invalid_option_name';
    end if;

    insert into public.quiz_options (quiz_id, name, media_url, media_type)
    values (new_quiz_id, option_name, option_path, private.check_upload(option_path, uid));

    first_path := coalesce(first_path, option_path);
  end loop;

  -- Kapak seçilmediyse ilk seçenek kapak olur.
  if p_cover_path is null then
    update public.quizzes set cover_url = first_path where id = new_quiz_id;
  end if;

  return new_quiz_id;
end;
$$;

revoke all on function public.create_quiz(text, text, text, text, jsonb) from public, anon;
grant execute on function public.create_quiz(text, text, text, text, jsonb) to authenticated;
