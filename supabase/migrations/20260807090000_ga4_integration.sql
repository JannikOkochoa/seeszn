-- ─── GA4: eigene Datenquelle und sichere Konfiguration ───────────────────────
-- Bereitet die Anbindung der Google Analytics Data API vor. Bewusst getrennt
-- von der Search Console:
--
--   * eigene Zeile in data_sources → eigene sync_runs, eigener Datenstand,
--     eigener Status. Ein GA4-Ausfall lässt GSC unberührt und umgekehrt.
--   * eigene Vault-Einträge für Refresh Token und Property-ID.
--
-- Gemeinsam genutzt wird nur, was ohnehin generisch ist: derselbe Scheduler
-- (pg_cron + pg_net), dieselbe Dispatch-Protokollierung, dieselbe
-- Lock-Mechanik. Es entsteht keine zweite Scheduler-Infrastruktur.
--
-- Wie bei GSC legt diese Migration ausschließlich Namen und Funktionen fest,
-- niemals Werte. Der Refresh Token wird out of band über
-- scripts/ga4-authorize.mjs gesetzt und verlässt die Datenbank nie.

-- ── Datenquelle ───────────────────────────────────────────────────────────────
-- Dieselbe Organisation wie die Search-Console-Quelle; kein hart codierter
-- Slug, sondern abgeleitet aus der bestehenden Quelle.
insert into public.data_sources (organization_id, provider, status)
select organization_id, 'google_analytics_4', 'idle'
from public.data_sources
where provider = 'google_search_console'
on conflict (organization_id, provider) do nothing;

-- ── Dispatches nach Quelle unterscheiden ─────────────────────────────────────
-- Die Tabelle protokolliert ab jetzt Auslösungen beider Quellen. Bestehende
-- Zeilen bekommen 'gsc', damit die Historie eindeutig bleibt.
alter table public.gsc_sync_dispatches
  add column if not exists source text not null default 'gsc';
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'gsc_sync_dispatches_source_check'
  ) then
    alter table public.gsc_sync_dispatches
      add constraint gsc_sync_dispatches_source_check check (source in ('gsc', 'ga4'));
  end if;
end;
$$;

create index if not exists gsc_sync_dispatches_source_idx
  on public.gsc_sync_dispatches (source, scheduled_at desc);

comment on column public.gsc_sync_dispatches.source is
  'Welche Datenquelle der Scheduler angestoßen hat: gsc oder ga4.';

-- ── Vault: Refresh Token und Property-ID ─────────────────────────────────────
-- Der Refresh Token ist ein Secret und wird nie zurückgegeben. Die Property-ID
-- ist keins (eine Kontonummer bei Google), aber umgebungsabhängig – sie liegt
-- aus demselben Grund hier wie die GSC-Property: damit sie sich ohne Zugriff
-- auf die Hosting-Oberfläche korrigieren lässt.
create or replace function public.set_ga4_config(p_refresh_token text, p_property_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_property_id !~ '^[0-9]+$' then
    raise exception 'GA4-Property-ID muss rein numerisch sein.';
  end if;
  if length(coalesce(p_refresh_token, '')) < 20 then
    raise exception 'GA4-Refresh-Token fehlt oder ist unplausibel kurz.';
  end if;

  select id into v_id from vault.secrets where name = 'ga4_refresh_token';
  if v_id is null then
    perform vault.create_secret(p_refresh_token, 'ga4_refresh_token', 'GA4 OAuth Refresh Token (analytics.readonly).');
  else
    perform vault.update_secret(v_id, p_refresh_token, 'ga4_refresh_token', 'GA4 OAuth Refresh Token (analytics.readonly).');
  end if;

  select id into v_id from vault.secrets where name = 'ga4_property_id';
  if v_id is null then
    perform vault.create_secret(p_property_id, 'ga4_property_id', 'GA4 Property-ID.');
  else
    perform vault.update_secret(v_id, p_property_id, 'ga4_property_id', 'GA4 Property-ID.');
  end if;
end;
$$;

revoke all on function public.set_ga4_config(text, text) from public, anon, authenticated;
grant execute on function public.set_ga4_config(text, text) to service_role;

/**
 * Nur den Refresh Token setzen. Nötig, wenn die Zustimmung erteilt ist, die
 * Property aber noch ausgewählt werden muss: Der Token ist dann bereits
 * gesichert und die Zustimmung muss nicht wiederholt werden.
 */
create or replace function public.set_ga4_refresh_token(p_refresh_token text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if length(coalesce(p_refresh_token, '')) < 20 then
    raise exception 'GA4-Refresh-Token fehlt oder ist unplausibel kurz.';
  end if;
  select id into v_id from vault.secrets where name = 'ga4_refresh_token';
  if v_id is null then
    perform vault.create_secret(p_refresh_token, 'ga4_refresh_token', 'GA4 OAuth Refresh Token (analytics.readonly).');
  else
    perform vault.update_secret(v_id, p_refresh_token, 'ga4_refresh_token', 'GA4 OAuth Refresh Token (analytics.readonly).');
  end if;
end;
$$;

revoke all on function public.set_ga4_refresh_token(text) from public, anon, authenticated;
grant execute on function public.set_ga4_refresh_token(text) to service_role;

/** Property-ID separat setzen, ohne den Token anzufassen. */
create or replace function public.set_ga4_property_id(p_property_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_property_id !~ '^[0-9]+$' then
    raise exception 'GA4-Property-ID muss rein numerisch sein.';
  end if;
  select id into v_id from vault.secrets where name = 'ga4_property_id';
  if v_id is null then
    perform vault.create_secret(p_property_id, 'ga4_property_id', 'GA4 Property-ID.');
  else
    perform vault.update_secret(v_id, p_property_id, 'ga4_property_id', 'GA4 Property-ID.');
  end if;
end;
$$;

revoke all on function public.set_ga4_property_id(text) from public, anon, authenticated;
grant execute on function public.set_ga4_property_id(text) to service_role;

/** Refresh Token für den Servercode. Nur service_role, nie an Endnutzer. */
create or replace function public.ga4_refresh_token()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'ga4_refresh_token';
$$;

revoke all on function public.ga4_refresh_token() from public, anon, authenticated;
grant execute on function public.ga4_refresh_token() to service_role;

/** Property-ID (kein Secret). */
create or replace function public.ga4_property_id()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'ga4_property_id';
$$;

revoke all on function public.ga4_property_id() from public, anon, authenticated;
grant execute on function public.ga4_property_id() to service_role;

/**
 * Ob GA4 eingerichtet ist – ohne den Token preiszugeben. Grundlage der
 * ehrlichen Statusanzeige im Dashboard: solange hier false steht, zeigt die
 * Oberfläche „nicht verbunden“ statt geschätzter Zahlen.
 */
create or replace function public.ga4_config_status()
returns table (token_configured boolean, property_id text)
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (select 1 from vault.secrets where name = 'ga4_refresh_token'),
    (select decrypted_secret from vault.decrypted_secrets where name = 'ga4_property_id');
$$;

revoke all on function public.ga4_config_status() from public, anon, authenticated;
grant execute on function public.ga4_config_status() to service_role;
