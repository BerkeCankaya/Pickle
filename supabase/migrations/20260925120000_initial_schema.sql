-- Pickle: ilk veritabanı yapısı (4. aşama).
-- Tablolar Prd.md 7. bölümdeki taslağı temel alır.
--
-- Güvenlik yaklaşımı:
--   * Tüm tablolarda RLS açık.
--   * İstemcilere (anon/authenticated) sadece gereken sütunlarda yetki verilir;
--     sayaçlar (oynanma, beğeni, galibiyet...) istemciden hiçbir zaman yazılamaz.
--   * Sayaçları tetikleyiciler (trigger) veya sunucu fonksiyonları günceller.
--   * Yardımcı fonksiyonlar API'ye açık olmayan "private" şemasında durur.

create schema if not exists private;
grant usage on schema private to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Türler
-- ---------------------------------------------------------------------------

create type public.user_role as enum ('user', 'admin');
create type public.quiz_status as enum ('published', 'hidden');
create type public.media_type as enum ('image', 'gif');
create type public.report_reason as enum ('inappropriate', 'copyright', 'spam', 'other');
create type public.report_status as enum ('open', 'resolved', 'rejected');

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- Google ile ilk girişte kullanıcı adı seçilene kadar boş kalır.
  username text unique check (username ~ '^[a-z0-9_]{3,20}$'),
  avatar_url text,
  role public.user_role not null default 'user',
  is_banned boolean not null default false,
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- quizzes
-- ---------------------------------------------------------------------------

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 50),
  description text not null default '' check (char_length(description) <= 300),
  -- src/types/quiz.ts içindeki CATEGORIES listesiyle aynı olmalı.
  category text not null check (
    category in ('yemek', 'dizi-film', 'muzik', 'spor', 'oyun', 'unluler', 'hayvanlar', 'diger')
  ),
  cover_url text,
  status public.quiz_status not null default 'published',
  play_count integer not null default 0 check (play_count >= 0),
  like_count integer not null default 0 check (like_count >= 0),
  -- Açık şikayet sayısı; 5'e ulaşınca quiz otomatik gizlenir.
  report_count integer not null default 0 check (report_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quizzes_creator_id_idx on public.quizzes (creator_id);
create index quizzes_status_created_at_idx on public.quizzes (status, created_at desc);

-- ---------------------------------------------------------------------------
-- quiz_options
-- ---------------------------------------------------------------------------

create table public.quiz_options (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  media_url text not null,
  media_type public.media_type not null default 'image',
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  championships integer not null default 0 check (championships >= 0)
);

create index quiz_options_quiz_id_idx on public.quiz_options (quiz_id);

-- ---------------------------------------------------------------------------
-- likes
-- ---------------------------------------------------------------------------

create table public.likes (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, quiz_id)
);

create index likes_quiz_id_idx on public.likes (quiz_id);

-- ---------------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------------

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  reporter_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  reason public.report_reason not null,
  note text check (char_length(note) <= 500),
  status public.report_status not null default 'open',
  created_at timestamptz not null default now(),
  -- Bir kullanıcı aynı quizi bir kez şikayet edebilir (reddedilse bile).
  unique (quiz_id, reporter_id)
);

create index reports_reporter_id_idx on public.reports (reporter_id);
create index reports_open_idx on public.reports (quiz_id) where status = 'open';

-- ---------------------------------------------------------------------------
-- play_logs: oyun sonucu kaydında kötüye kullanım sınırı için.
-- İstemci erişemez; 5. aşamadaki sunucu fonksiyonu yazar/okur.
-- ---------------------------------------------------------------------------

create table public.play_logs (
  id bigint generated always as identity primary key,
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  -- Tarayıcıyı tanımak için sunucuda üretilen özet (ham IP saklanmaz).
  client_key text not null,
  created_at timestamptz not null default now()
);

create index play_logs_rate_idx on public.play_logs (quiz_id, client_key, created_at desc);
create index play_logs_created_at_idx on public.play_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- Yardımcı fonksiyonlar (private şeması, API'den çağrılamaz)
-- ---------------------------------------------------------------------------

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Quiz oluşturma, beğenme ve şikayet için: kullanıcı adı seçilmiş,
-- koşullar kabul edilmiş ve engelli değil.
create function private.can_contribute()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and username is not null
      and terms_accepted_at is not null
      and not is_banned
  );
$$;

revoke all on function private.is_admin() from public;
revoke all on function private.can_contribute() from public;
grant execute on function private.is_admin() to anon, authenticated;
grant execute on function private.can_contribute() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Tetikleyiciler
-- ---------------------------------------------------------------------------

-- Yeni kayıt olan her kullanıcı için profil satırı oluşturur.
-- E-posta kaydında kullanıcı adı ve koşul onayı kayıt formundan gelir;
-- Google girişinde bunlar boş kalır ve ek adımda tamamlanır.
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  wanted_username text := lower(new.raw_user_meta_data ->> 'username');
  accepted boolean := coalesce((new.raw_user_meta_data ->> 'terms_accepted')::boolean, false);
begin
  if wanted_username is null or wanted_username !~ '^[a-z0-9_]{3,20}$' then
    wanted_username := null;
  end if;

  begin
    insert into public.profiles (id, username, terms_accepted_at)
    values (new.id, wanted_username, case when accepted then now() end);
  exception when unique_violation then
    -- Kullanıcı adı o arada alınmışsa kayıt yine de tamamlanır;
    -- kullanıcı adı ek adımda tekrar seçilir.
    insert into public.profiles (id, username, terms_accepted_at)
    values (new.id, null, case when accepted then now() end);
  end;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger quizzes_set_updated_at
  before update on public.quizzes
  for each row execute function private.set_updated_at();

-- Beğeni eklenince/silinince quizdeki beğeni sayacını günceller.
create function private.sync_like_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.quizzes set like_count = like_count + 1 where id = new.quiz_id;
  elsif tg_op = 'DELETE' then
    update public.quizzes set like_count = greatest(like_count - 1, 0) where id = old.quiz_id;
  end if;
  return null;
end;
$$;

create trigger likes_sync_count
  after insert or delete on public.likes
  for each row execute function private.sync_like_count();

-- Yeni şikayet gelince sayacı artırır; 5 açık şikayette quizi gizler.
create function private.handle_new_report()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.quizzes
  set report_count = report_count + 1,
      status = case when report_count + 1 >= 5 then 'hidden'::public.quiz_status else status end
  where id = new.quiz_id;
  return null;
end;
$$;

create trigger reports_after_insert
  after insert on public.reports
  for each row execute function private.handle_new_report();

-- ---------------------------------------------------------------------------
-- API fonksiyonları
-- ---------------------------------------------------------------------------

-- Giriş yapan kullanıcının tüm profil bilgisi (rol ve engel durumu dahil).
-- profiles tablosunda bu sütunlar herkese açık olmadığı için fonksiyonla okunur.
create function public.get_my_profile()
returns setof public.profiles
language sql
stable
security definer
set search_path = ''
as $$
  select * from public.profiles where id = (select auth.uid());
$$;

-- Google ile ilk girişteki ek adım: kullanıcı adı seçimi + koşulları kabul.
-- Kullanıcı adı zaten seçilmişse değiştirilmez.
create function public.complete_profile(p_username text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  clean text := lower(btrim(p_username));
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;

  if clean is null or clean !~ '^[a-z0-9_]{3,20}$' then
    raise exception 'invalid_username';
  end if;

  update public.profiles
  set username = coalesce(username, clean),
      terms_accepted_at = coalesce(terms_accepted_at, now())
  where id = uid;
exception when unique_violation then
  raise exception 'username_taken';
end;
$$;

revoke all on function public.get_my_profile() from public, anon;
revoke all on function public.complete_profile(text) from public, anon;
grant execute on function public.get_my_profile() to authenticated;
grant execute on function public.complete_profile(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Yetkiler (sütun bazında) ve RLS
-- ---------------------------------------------------------------------------

revoke all on public.profiles, public.quizzes, public.quiz_options,
  public.likes, public.reports, public.play_logs from anon, authenticated;

alter table public.profiles enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_options enable row level security;
alter table public.likes enable row level security;
alter table public.reports enable row level security;
alter table public.play_logs enable row level security;

-- profiles: kullanıcı adları herkese açık; rol/engel bilgisi değil.
-- Değişiklikler sadece complete_profile() ve admin işlemleriyle yapılır.
grant select (id, username, avatar_url, created_at) on public.profiles to anon, authenticated;

create policy "Profiller herkese açık"
  on public.profiles for select
  to anon, authenticated
  using (true);

-- quizzes
grant select on public.quizzes to anon, authenticated;
grant insert (title, description, category, cover_url) on public.quizzes to authenticated;
grant update (status) on public.quizzes to authenticated;
grant delete on public.quizzes to authenticated;

create policy "Yayındaki quizler herkese, gizliler sahibine ve admine açık"
  on public.quizzes for select
  to anon, authenticated
  using (
    status = 'published'
    or creator_id = (select auth.uid())
    or (select private.is_admin())
  );

create policy "Katkı yapabilen kullanıcı quiz oluşturabilir"
  on public.quizzes for insert
  to authenticated
  with check (
    creator_id = (select auth.uid())
    and (select private.can_contribute())
  );

create policy "Sadece admin quiz durumunu değiştirebilir"
  on public.quizzes for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Sahibi veya admin quizi silebilir"
  on public.quizzes for delete
  to authenticated
  using (
    creator_id = (select auth.uid())
    or (select private.is_admin())
  );

-- quiz_options: görünürlük bağlı olduğu quize göre (quizzes RLS'i burada da geçerli).
grant select on public.quiz_options to anon, authenticated;
grant insert (quiz_id, name, media_url, media_type) on public.quiz_options to authenticated;

create policy "Görünen quizlerin seçenekleri görünür"
  on public.quiz_options for select
  to anon, authenticated
  using (exists (select 1 from public.quizzes q where q.id = quiz_id));

create policy "Quiz sahibi seçenek ekleyebilir"
  on public.quiz_options for insert
  to authenticated
  with check (
    (select private.can_contribute())
    and exists (
      select 1 from public.quizzes q
      where q.id = quiz_id and q.creator_id = (select auth.uid())
    )
  );

-- likes: herkes sadece kendi beğenilerini görür; toplam sayı quizzes.like_count'ta.
grant select, delete on public.likes to authenticated;
grant insert (quiz_id) on public.likes to authenticated;

create policy "Kullanıcı kendi beğenilerini görür"
  on public.likes for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Katkı yapabilen kullanıcı yayındaki quizi beğenebilir"
  on public.likes for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and (select private.can_contribute())
    and exists (select 1 from public.quizzes q where q.id = quiz_id and q.status = 'published')
  );

create policy "Kullanıcı kendi beğenisini geri alabilir"
  on public.likes for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- reports: kullanıcı kendi şikayetlerini, admin hepsini görür.
grant select on public.reports to authenticated;
grant insert (quiz_id, reason, note) on public.reports to authenticated;
grant update (status) on public.reports to authenticated;

create policy "Kullanıcı kendi şikayetlerini, admin hepsini görür"
  on public.reports for select
  to authenticated
  using (
    reporter_id = (select auth.uid())
    or (select private.is_admin())
  );

create policy "Katkı yapabilen kullanıcı başkasının quizini şikayet edebilir"
  on public.reports for insert
  to authenticated
  with check (
    reporter_id = (select auth.uid())
    and (select private.can_contribute())
    and exists (
      select 1 from public.quizzes q
      where q.id = quiz_id
        and q.status = 'published'
        and q.creator_id <> (select auth.uid())
    )
  );

create policy "Sadece admin şikayet durumunu değiştirebilir"
  on public.reports for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- play_logs: istemciye hiçbir yetki verilmez (politika yok = erişim yok).
