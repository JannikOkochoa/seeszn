-- ─── KPI-Dashboard: Seed-Daten ────────────────────────────────────────────────
-- Demo-Daten für die vertikale Scheibe "Organische Klicks auf Produktseiten".
-- Idempotent: alle Inserts sind on-conflict-abgesichert und können mehrfach
-- laufen. Läuft lokal automatisch bei `supabase db reset`; gegen das
-- Dev-Projekt manuell über den SQL-Editor oder psql ausführen.
--
-- Feste UUIDs, damit Servercode und Tests stabil referenzieren können.

-- Organisation Klühspies
insert into public.organizations (id, name, slug)
values ('a1000000-0000-4000-8000-000000000001', 'Klühspies Reisen', 'kluehspies')
on conflict (slug) do nothing;

-- Search-Console-Datenquelle
insert into public.data_sources (id, organization_id, provider, status)
values (
  'a1000000-0000-4000-8000-000000000002',
  'a1000000-0000-4000-8000-000000000001',
  'google_search_console',
  'idle'
)
on conflict (organization_id, provider) do nothing;

-- KPI: Organische Klicks auf Produktseiten (Tagesziel als target_value).
-- Kein current_value: der aktuelle Wert ist immer der neueste Snapshot.
insert into public.kpi_definitions
  (id, organization_id, name, metric_key, target_value, data_source_id)
values (
  'a1000000-0000-4000-8000-000000000003',
  'a1000000-0000-4000-8000-000000000001',
  'Organische Klicks auf Produktseiten',
  'organic_clicks_product_pages',
  60,
  'a1000000-0000-4000-8000-000000000002'
)
on conflict (organization_id, metric_key) do nothing;

-- Produktseiten Berlin und Hamburg
insert into public.pages (id, organization_id, name, url, segment)
values
  (
    'a1000000-0000-4000-8000-000000000011',
    'a1000000-0000-4000-8000-000000000001',
    'Klassenfahrt Berlin',
    'https://www.kluehspies.de/klassenfahrten/berlin',
    'product'
  ),
  (
    'a1000000-0000-4000-8000-000000000012',
    'a1000000-0000-4000-8000-000000000001',
    'Klassenfahrt Hamburg',
    'https://www.kluehspies.de/klassenfahrten/hamburg',
    'product'
  )
on conflict (organization_id, url) do nothing;

-- 35 Tage GSC-Rohdaten (Query x Device), deterministisch generiert:
-- Wochenend-Einbruch, leichter Aufwärtstrend, md5-basierter Jitter.
with days as (
  select generate_series(current_date - 35, current_date - 1, interval '1 day')::date as day
),
page_queries (page_id, query, base_clicks, base_position) as (
  values
    ('a1000000-0000-4000-8000-000000000011'::uuid, 'klassenfahrt berlin',            9.0::numeric, 4.2::numeric),
    ('a1000000-0000-4000-8000-000000000011'::uuid, 'klassenfahrt berlin kosten',     5.0,          6.8),
    ('a1000000-0000-4000-8000-000000000011'::uuid, 'klassenfahrt berlin programm',   2.5,          8.9),
    ('a1000000-0000-4000-8000-000000000012'::uuid, 'klassenfahrt hamburg',           7.0,          4.9),
    ('a1000000-0000-4000-8000-000000000012'::uuid, 'klassenfahrt hamburg hafencity', 4.0,          7.4),
    ('a1000000-0000-4000-8000-000000000012'::uuid, 'klassenfahrt hamburg programm',  2.0,          9.6)
),
devices (device, device_factor) as (
  values ('DESKTOP', 0.8::numeric), ('MOBILE', 1.2::numeric)
),
raw as (
  select
    d.day,
    pq.page_id,
    pq.query,
    dev.device,
    -- Basisniveau * Gerät * Wochentag * Trend + Jitter
    greatest(0, round(
      pq.base_clicks * dev.device_factor
        * (case when extract(isodow from d.day) in (6, 7) then 0.45 else 1.0 end)
        * (1 + 0.007 * (d.day - (current_date - 35)))
      + ((('x' || substr(md5(pq.query || dev.device || d.day::text), 1, 8))::bit(32)::int % 4) - 1)
    )) as clicks,
    greatest(20, round(
      pq.base_clicks * dev.device_factor * 17
        * (case when extract(isodow from d.day) in (6, 7) then 0.55 else 1.0 end)
        * (1 + 0.005 * (d.day - (current_date - 35)))
      + abs(('x' || substr(md5(dev.device || pq.query || d.day::text), 1, 8))::bit(32)::int % 25)
    )) as impressions,
    round(
      pq.base_position
      + ((('x' || substr(md5(d.day::text || pq.query), 1, 8))::bit(32)::int % 100) / 100.0) * 1.4
      - 0.7
    , 1) as position
  from days d
  cross join page_queries pq
  cross join devices dev
)
insert into public.gsc_daily_metrics
  (organization_id, data_source_id, date, page_id, query, device, country,
   clicks, impressions, ctr, position)
select
  'a1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000002',
  r.day,
  r.page_id,
  r.query,
  r.device,
  'deu',
  r.clicks,
  r.impressions,
  round(r.clicks / nullif(r.impressions, 0), 4),
  r.position
from raw r
on conflict (data_source_id, date, page_id, query, device, country) do nothing;

-- KPI-Snapshots: aggregierte Klicks pro Tag über alle Produktseiten.
insert into public.kpi_snapshots (organization_id, kpi_definition_id, date, value)
select
  m.organization_id,
  'a1000000-0000-4000-8000-000000000003',
  m.date,
  sum(m.clicks)
from public.gsc_daily_metrics m
join public.pages p on p.id = m.page_id and p.segment = 'product'
where m.organization_id = 'a1000000-0000-4000-8000-000000000001'
group by m.organization_id, m.date
on conflict (kpi_definition_id, date) do update
  set value = excluded.value;

-- Datenstand der Quelle + ein protokollierter Seed-Sync
update public.data_sources
set
  status = 'idle',
  last_successful_sync_at = now(),
  data_available_until = (
    select max(date)
    from public.gsc_daily_metrics
    where data_source_id = 'a1000000-0000-4000-8000-000000000002'
  ),
  last_error = null
where id = 'a1000000-0000-4000-8000-000000000002';

insert into public.sync_runs
  (id, organization_id, data_source_id, status, started_at, completed_at, records_processed)
values (
  'a1000000-0000-4000-8000-000000000021',
  'a1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000002',
  'success',
  now() - interval '2 minutes',
  now(),
  (select count(*)::int from public.gsc_daily_metrics
   where data_source_id = 'a1000000-0000-4000-8000-000000000002')
)
on conflict (id) do nothing;

-- ── Memberships für echte Test-Nutzer ────────────────────────────────────────
-- Auth-Nutzer lassen sich nicht sinnvoll seeden. Nach dem Signup der drei
-- Test-Accounts einmalig ausführen (E-Mails anpassen):
--
-- insert into public.memberships (organization_id, user_id, role)
-- select 'a1000000-0000-4000-8000-000000000001', p.id, v.role
-- from (values
--   ('admin@seeszn.de',       'seeszn_admin'),
--   ('editor@kluehspies.de',  'kluehspies_editor'),
--   ('viewer@kluehspies.de',  'viewer')
-- ) as v(email, role)
-- join public.profiles p on p.email = v.email
-- on conflict (organization_id, user_id) do update set role = excluded.role;
