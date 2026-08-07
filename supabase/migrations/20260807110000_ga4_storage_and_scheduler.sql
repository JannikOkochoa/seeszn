-- ─── GA4: Speicherung und Automatisierung ────────────────────────────────────
-- Tageszeitreihen je Scope (Website gesamt + jede getrackte Landingpage), ein
-- Event-Katalog für das Conversion-Audit, und der Anschluss an denselben
-- Scheduler, der die Search Console bedient.
--
-- Bewusst schlanker als das GSC-Modell: GA4 braucht keine Import-Batches. Die
-- Tageswerte werden je (Scope, Tag) upsertet. Das macht jeden Lauf idempotent
-- und das Nachholen einer Lücke zum Normalfall statt zum Sonderweg – ein
-- erneuter Lauf über denselben Zeitraum schreibt dieselben Werte.
--
-- Trennung von GSC: eigene Tabellen, eigene data_sources-Zeile, eigene
-- sync_runs. Ein GA4-Ausfall lässt GSC unberührt und umgekehrt. Gemeinsam
-- genutzt wird nur, was ohnehin generisch ist: pg_cron, pg_net, der Vault und
-- die Dispatch-Protokollierung.

-- ── Tageswerte je Scope ──────────────────────────────────────────────────────
-- scope_key: 'site' oder 'page:<schlüssel aus TRACKED_PAGES>'.
create table if not exists public.ga4_daily_metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  scope_key text not null,
  date date not null,
  sessions numeric not null default 0 check (sessions >= 0),
  active_users numeric not null default 0 check (active_users >= 0),
  total_users numeric not null default 0 check (total_users >= 0),
  new_users numeric not null default 0 check (new_users >= 0),
  engaged_sessions numeric not null default 0 check (engaged_sessions >= 0),
  /** Summe der Interaktionszeit in Sekunden; Durchschnitte werden daraus abgeleitet. */
  user_engagement_duration numeric not null default 0 check (user_engagement_duration >= 0),
  screen_page_views numeric not null default 0 check (screen_page_views >= 0),
  /** Abgeschickte Anfragen (Lead). Siehe lib/ga4/events.ts. */
  primary_conversions numeric not null default 0 check (primary_conversions >= 0),
  /** Abgeschicktes Kontaktformular. */
  secondary_conversions numeric not null default 0 check (secondary_conversions >= 0),
  updated_at timestamptz not null default now(),
  unique (organization_id, scope_key, date)
);

create index if not exists ga4_daily_metrics_scope_date_idx
  on public.ga4_daily_metrics (organization_id, scope_key, date desc);

comment on table public.ga4_daily_metrics is
  'GA4-Tageswerte je Scope. Daten stehen in der Zeitzone der GA4-Property '
  '(Europe/Berlin), nicht in UTC – siehe ga4_property_state.time_zone.';

alter table public.ga4_daily_metrics enable row level security;
drop policy if exists "ga4_daily_metrics_select_member" on public.ga4_daily_metrics;
create policy "ga4_daily_metrics_select_member"
  on public.ga4_daily_metrics for select
  to authenticated
  using (public.is_org_member(organization_id));
grant select on public.ga4_daily_metrics to authenticated;
grant select, insert, update, delete on public.ga4_daily_metrics to service_role;

-- ── Event-Katalog (Conversion-Audit) ─────────────────────────────────────────
-- Ein Abbild dessen, was in der Property tatsächlich passiert. Grundlage der
-- Einordnung in lib/ga4/events.ts: Eventnamen werden nie erfunden, sondern
-- hier abgelesen.
create table if not exists public.ga4_event_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  event_name text not null,
  period_start date not null,
  period_end date not null,
  event_count numeric not null default 0,
  /** Wie GA4 selbst zählt – nicht als Lead verwendbar, nur zur Einordnung. */
  key_events numeric not null default 0,
  total_users numeric not null default 0,
  /** true = in GA4 als Key Event markiert. */
  is_key_event boolean not null default false,
  captured_at timestamptz not null default now(),
  unique (organization_id, event_name)
);

alter table public.ga4_event_snapshots enable row level security;
drop policy if exists "ga4_event_snapshots_select_member" on public.ga4_event_snapshots;
create policy "ga4_event_snapshots_select_member"
  on public.ga4_event_snapshots for select
  to authenticated
  using (public.is_org_member(organization_id));
grant select on public.ga4_event_snapshots to authenticated;
grant select, insert, update, delete on public.ga4_event_snapshots to service_role;

-- ── Property-Zustand ─────────────────────────────────────────────────────────
-- Vor allem die Zeitzone: Sie entscheidet, was ein "Tag" in diesen Zahlen ist.
-- Sie wird bei jedem Lauf aus der API-Antwort übernommen statt angenommen.
create table if not exists public.ga4_property_state (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  property_id text,
  time_zone text,
  currency_code text,
  /** true = Google hat im letzten Lauf Werte aus Datenschutzgründen zurückgehalten. */
  subject_to_thresholding boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.ga4_property_state enable row level security;
drop policy if exists "ga4_property_state_select_member" on public.ga4_property_state;
create policy "ga4_property_state_select_member"
  on public.ga4_property_state for select
  to authenticated
  using (public.is_org_member(organization_id));
grant select on public.ga4_property_state to authenticated;
grant select, insert, update on public.ga4_property_state to service_role;

-- ── Lauf beanspruchen: je Datenquelle getrennt ───────────────────────────────
-- claim_gsc_sync_run sperrt pro Organisation. Für zwei unabhängige Quellen
-- wäre das zu grob: ein laufender GSC-Sync würde GA4 blockieren. Diese
-- Variante sperrt pro Datenquelle.
create or replace function public.claim_sync_run(
  p_organization_id uuid,
  p_data_source_id uuid,
  p_trigger_source text,
  p_dispatch_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_run_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext('sync:' || p_data_source_id::text));

  update public.sync_runs
  set status = 'error',
      completed_at = now(),
      error_message = 'Lauf ohne Abschluss beendet (Zeitüberschreitung).'
  where data_source_id = p_data_source_id
    and status = 'running'
    and started_at <= now() - interval '15 minutes';

  if exists (
    select 1 from public.sync_runs
    where data_source_id = p_data_source_id and status = 'running'
  ) then
    return null;
  end if;

  insert into public.sync_runs (
    organization_id, data_source_id, status, trigger_source, dispatch_id
  )
  values (
    p_organization_id, p_data_source_id, 'running', p_trigger_source, p_dispatch_id
  )
  returning id into v_run_id;

  return v_run_id;
end;
$$;

revoke all on function public.claim_sync_run(uuid, uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.claim_sync_run(uuid, uuid, text, uuid) to service_role;

-- ── Scheduler-Auslösung für GA4 ──────────────────────────────────────────────
-- Der Endpunkt wird aus dem bereits hinterlegten GSC-Endpunkt abgeleitet:
-- gleiche Anwendung, gleicher Host, anderer Pfad. Das erspart einen zweiten
-- Vault-Eintrag, der mit dem ersten auseinanderlaufen könnte – dieselbe
-- Überlegung wie beim geteilten Sync-Secret.
create or replace function public.ga4_sync_dispatch(
  p_job_name text default 'kluehspies-ga4-daily-sync',
  p_reason text default 'scheduled'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_base text;
  v_endpoint text;
  v_secret text;
  v_dispatch_id uuid;
  v_request_id bigint;
  v_org uuid := public.gsc_sync_organization();
begin
  select decrypted_secret into v_base
  from vault.decrypted_secrets where name = 'gsc_sync_endpoint';
  select decrypted_secret into v_secret
  from vault.decrypted_secrets where name = 'gsc_sync_secret';

  v_endpoint := replace(coalesce(v_base, ''), '/api/sync/gsc/cron', '/api/sync/ga4/cron');

  if v_base is null or v_secret is null or v_endpoint = coalesce(v_base, '') then
    insert into public.gsc_sync_dispatches (
      organization_id, job_name, reason, source, delivered, error_message, reconciled_at
    )
    values (
      v_org, p_job_name, p_reason, 'ga4', false,
      'GA4-Endpunkt nicht ableitbar: gsc_sync_endpoint fehlt oder hat einen unerwarteten Pfad.',
      now()
    )
    returning id into v_dispatch_id;
    return v_dispatch_id;
  end if;

  insert into public.gsc_sync_dispatches (organization_id, job_name, reason, source, endpoint)
  values (v_org, p_job_name, p_reason, 'ga4', v_endpoint)
  returning id into v_dispatch_id;

  select net.http_post(
    url := v_endpoint,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-gsc-sync-secret', v_secret
    ),
    body := jsonb_build_object('dispatchId', v_dispatch_id, 'triggerSource', p_reason),
    timeout_milliseconds := 120000
  ) into v_request_id;

  update public.gsc_sync_dispatches set request_id = v_request_id where id = v_dispatch_id;
  return v_dispatch_id;
end;
$$;

revoke all on function public.ga4_sync_dispatch(text, text) from public, anon, authenticated;

-- ── Self-Healing für GA4 ─────────────────────────────────────────────────────
-- GA4 verarbeitet Daten mit bis zu 48 Stunden Verzug; erst ab drei Tagen
-- Rückstand ist wirklich etwas liegen geblieben.
create or replace function public.ga4_sync_self_heal()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid := public.gsc_sync_organization();
  v_available_until date;
  v_source uuid;
begin
  if v_org is null then return null; end if;

  select id into v_source from public.data_sources
  where organization_id = v_org and provider = 'google_analytics_4';
  if v_source is null then return null; end if;

  select max(date) into v_available_until
  from public.ga4_daily_metrics where organization_id = v_org;

  if v_available_until is not null and v_available_until > current_date - 3 then
    return null;
  end if;

  if exists (
    select 1 from public.gsc_sync_dispatches
    where source = 'ga4' and scheduled_at > now() - interval '90 minutes'
  ) then
    return null;
  end if;

  if exists (
    select 1 from public.sync_runs
    where data_source_id = v_source and status = 'running'
      and started_at > now() - interval '15 minutes'
  ) then
    return null;
  end if;

  return public.ga4_sync_dispatch('kluehspies-ga4-self-heal', 'self_heal');
end;
$$;

revoke all on function public.ga4_sync_self_heal() from public, anon, authenticated;

-- ── Jobs einplanen (idempotent) ──────────────────────────────────────────────
-- 04:30 UTC, also vor dem GSC-Lauf um 06:00: GA4-Daten des Vortags sind dann
-- verarbeitet, und beide Läufe treffen sich nicht.
do $$
declare
  v_job text;
begin
  foreach v_job in array array['kluehspies-ga4-daily-sync', 'kluehspies-ga4-self-heal'] loop
    if exists (select 1 from cron.job where jobname = v_job) then
      perform cron.unschedule(v_job);
    end if;
  end loop;
end;
$$;

select cron.schedule(
  'kluehspies-ga4-daily-sync',
  '30 4 * * *',
  $$select public.ga4_sync_dispatch('kluehspies-ga4-daily-sync', 'scheduled');$$
);

select cron.schedule(
  'kluehspies-ga4-self-heal',
  '45 * * * *',
  $$select public.ga4_sync_self_heal();$$
);
