-- Pickle 5. aşama: oyunun ve istatistiklerin gerçek veriye bağlanması.
--   * quizzes.option_count: seçenek sayısı (tetikleyiciyle güncellenir)
--   * quiz_daily_plays: "Popüler" sekmesi için günlük oynanma sayıları
--   * list_quizzes(): ana sayfa listesi
--   * record_play(): oyun sonucunu doğrulayıp kaydeder (kötüye kullanım sınırıyla)

-- Test quizlerinin görseli yok; arayüz boş görselde yer tutucu gösterir.
-- 6. aşamadaki quiz oluşturma akışı görseli zorunlu tutacak.
alter table public.quiz_options alter column media_url drop not null;

-- ---------------------------------------------------------------------------
-- Seçenek sayısı
-- ---------------------------------------------------------------------------

alter table public.quizzes add column option_count integer not null default 0 check (option_count >= 0);

create function private.sync_option_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.quizzes set option_count = option_count + 1 where id = new.quiz_id;
  elsif tg_op = 'DELETE' then
    update public.quizzes set option_count = greatest(option_count - 1, 0) where id = old.quiz_id;
  end if;
  return null;
end;
$$;

create trigger quiz_options_sync_count
  after insert or delete on public.quiz_options
  for each row execute function private.sync_option_count();

-- ---------------------------------------------------------------------------
-- Günlük oynanma sayıları
-- ---------------------------------------------------------------------------

create table public.quiz_daily_plays (
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  day date not null default current_date,
  plays integer not null default 0 check (plays >= 0),
  primary key (quiz_id, day)
);

alter table public.quiz_daily_plays enable row level security;
revoke all on public.quiz_daily_plays from anon, authenticated;
grant select on public.quiz_daily_plays to anon, authenticated;

create policy "Görünen quizlerin günlük oynanması görünür"
  on public.quiz_daily_plays for select
  to anon, authenticated
  using (exists (select 1 from public.quizzes q where q.id = quiz_id));

-- ---------------------------------------------------------------------------
-- Ana sayfa listesi
-- ---------------------------------------------------------------------------

-- p_tab: 'populer' (son 7 gün), 'yeni', 'begenilen'.
-- Çağıranın yetkileriyle çalışır (security invoker); RLS geçerlidir.
create function public.list_quizzes(
  p_tab text,
  p_category text default null,
  p_query text default null,
  p_limit integer default 12
)
returns table (
  id uuid,
  creator_id uuid,
  creator_name text,
  title text,
  description text,
  category text,
  cover_url text,
  play_count integer,
  like_count integer,
  option_count integer,
  recent_play_count integer,
  created_at timestamptz
)
language sql
stable
set search_path = ''
as $$
  select
    q.id, q.creator_id, p.username, q.title, q.description, q.category, q.cover_url,
    q.play_count, q.like_count, q.option_count, coalesce(r.plays, 0), q.created_at
  from public.quizzes q
  join public.profiles p on p.id = q.creator_id
  left join lateral (
    select sum(d.plays)::integer as plays
    from public.quiz_daily_plays d
    where d.quiz_id = q.id and d.day > current_date - 7
  ) r on true
  where q.status = 'published'
    and (p_category is null or q.category = p_category)
    and (
      p_query is null
      or q.title ilike '%' || replace(replace(replace(p_query, '\', '\\'), '%', '\%'), '_', '\_') || '%'
    )
  order by
    case when p_tab = 'populer' then coalesce(r.plays, 0) end desc nulls last,
    case when p_tab = 'populer' then q.play_count end desc nulls last,
    case when p_tab = 'begenilen' then q.like_count end desc nulls last,
    q.created_at desc
  limit least(greatest(p_limit, 1), 200);
$$;

grant execute on function public.list_quizzes(text, text, text, integer) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Oyun sonucunu kaydetme
-- ---------------------------------------------------------------------------

-- p_matches: [{ "winnerId": uuid, "loserId": uuid }, ...] oynanma sırasıyla.
-- Tarayıcıdan doğrudan çağrılır; IP adresi istek başlıklarından okunur ve
-- sadece özeti (sha256) saklanır. Aynı IP + quiz için dakikada en fazla 3 sonuç.
create function public.record_play(
  p_quiz_id uuid,
  p_size integer,
  p_champion_id uuid,
  p_matches jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_headers json := nullif(current_setting('request.headers', true), '')::json;
  client_ip text;
  key text;
  total_options integer;
  bad integer;
begin
  -- Temel kontroller
  if p_size is null or p_size not in (8, 16, 32, 64) then
    raise exception 'invalid_result';
  end if;

  select q.option_count into total_options
  from public.quizzes q
  where q.id = p_quiz_id and q.status = 'published';
  if not found then
    raise exception 'quiz_not_found';
  end if;
  if p_size > total_options then
    raise exception 'invalid_result';
  end if;

  if p_matches is null or jsonb_typeof(p_matches) <> 'array'
     or jsonb_array_length(p_matches) <> p_size - 1 then
    raise exception 'invalid_result';
  end if;

  -- Eşleşmeleri çöz; biçimi bozuksa uuid dönüşümü hata verir.
  begin
    create temp table if not exists pg_temp.play_matches (ord integer, winner uuid, loser uuid) on commit drop;
    truncate pg_temp.play_matches;
    insert into pg_temp.play_matches
    select t.ord, (t.e ->> 'winnerId')::uuid, (t.e ->> 'loserId')::uuid
    from jsonb_array_elements(p_matches) with ordinality as t(e, ord);
  exception when others then
    raise exception 'invalid_result';
  end;

  -- Turnuva tutarlılığı:
  --  * her eşleşmede iki farklı seçenek
  --  * her seçenek en fazla bir kez kaybeder, elenen bir daha oynamaz
  --  * toplam p_size farklı seçenek, hepsi bu quize ait
  --  * şampiyon hiç kaybetmez ve son eşleşmeyi kazanır
  select count(*) into bad from pg_temp.play_matches
  where winner is null or loser is null or winner = loser;
  if bad > 0 then raise exception 'invalid_result'; end if;

  if (select count(distinct loser) from pg_temp.play_matches) <> p_size - 1 then
    raise exception 'invalid_result';
  end if;

  select count(*) into bad
  from pg_temp.play_matches earlier
  join pg_temp.play_matches later on later.ord > earlier.ord
  where later.winner = earlier.loser;
  if bad > 0 then raise exception 'invalid_result'; end if;

  if (
    select count(*) from (
      select winner as option_id from pg_temp.play_matches
      union
      select loser from pg_temp.play_matches
    ) ids
    join public.quiz_options o on o.id = ids.option_id and o.quiz_id = p_quiz_id
  ) <> p_size then
    raise exception 'invalid_result';
  end if;

  if p_champion_id is distinct from (select winner from pg_temp.play_matches order by ord desc limit 1)
     or exists (select 1 from pg_temp.play_matches where loser = p_champion_id) then
    raise exception 'invalid_result';
  end if;

  -- Kötüye kullanım sınırı
  client_ip := coalesce(
    request_headers ->> 'cf-connecting-ip',
    nullif(btrim(split_part(request_headers ->> 'x-forwarded-for', ',', 1)), ''),
    'unknown'
  );
  key := encode(sha256(convert_to(client_ip || ':' || p_quiz_id::text, 'UTF8')), 'hex');

  if (
    select count(*) from public.play_logs l
    where l.quiz_id = p_quiz_id and l.client_key = key and l.created_at > now() - interval '1 minute'
  ) >= 3 then
    raise exception 'rate_limited';
  end if;

  -- Eski kayıtlar sadece sınır için tutulur; bir günden eskiler silinir.
  delete from public.play_logs where created_at < now() - interval '1 day';
  insert into public.play_logs (quiz_id, client_key) values (p_quiz_id, key);

  -- İstatistikleri güncelle
  update public.quizzes set play_count = play_count + 1 where id = p_quiz_id;

  insert into public.quiz_daily_plays (quiz_id, day, plays)
  values (p_quiz_id, current_date, 1)
  on conflict (quiz_id, day) do update set plays = public.quiz_daily_plays.plays + 1;

  update public.quiz_options o
  set wins = o.wins + w.total
  from (select winner, count(*)::integer as total from pg_temp.play_matches group by winner) w
  where o.id = w.winner;

  update public.quiz_options o
  set losses = o.losses + 1
  from pg_temp.play_matches m
  where o.id = m.loser;

  update public.quiz_options set championships = championships + 1 where id = p_champion_id;
end;
$$;

revoke all on function public.record_play(uuid, integer, uuid, jsonb) from public;
grant execute on function public.record_play(uuid, integer, uuid, jsonb) to anon, authenticated;
