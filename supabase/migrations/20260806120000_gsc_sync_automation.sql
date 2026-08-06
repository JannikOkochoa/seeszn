-- ─── GSC-Sync: Automatisierung in Supabase (pg_cron + pg_net + Vault) ─────────
-- Ersetzt den nie eingerichteten Hostinger-Cronjob. Der Scheduler lebt jetzt
-- in derselben Datenbank, die auch die Ergebnisse hält — es gibt keine zweite
-- Infrastruktur, die getrennt überwacht werden müsste.
--
-- Ablaufkette, die hinterher nachvollziehbar sein muss:
--
--   pg_cron  ──►  gsc_sync_dispatch()   ──►  net.http_post  ──►  /api/sync/gsc/cron
--      │               │                          │                    │
--      │               └─ gsc_sync_dispatches     └─ HTTP-Status       └─ sync_runs
--      │                  ("Scheduler ausgelöst")    ("API erreicht")     ("Sync
--      └─ cron.job_run_details                                            gestartet
--                                                                         /Ergebnis")
--
-- Secrets: Endpoint und Sync-Secret stehen ausschließlich im Supabase Vault.
-- Diese Migration legt die Namen fest, niemals die Werte — sie kann deshalb
-- bedenkenlos im Repository liegen. Die Werte werden außerhalb der Migration
-- gesetzt (siehe scripts/setup-gsc-automation.mjs).
--
-- Idempotent: mehrfaches Anwenden legt keine doppelten Jobs an.

-- ── Erweiterungen ─────────────────────────────────────────────────────────────
-- pg_cron liegt auf Supabase zwingend in pg_catalog, pg_net in extensions.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- ── Vault-Secret-Namen (Werte kommen out of band) ─────────────────────────────
-- gsc_sync_endpoint : vollständige URL des Cron-Endpunkts der Production-App
-- gsc_sync_secret   : Wert von GSC_SYNC_SECRET, identisch zur App-Env
--
-- Gesetzt werden sie über set_gsc_sync_config() weiter unten, aufgerufen von
-- scripts/setup-gsc-automation.mjs mit den Werten aus der lokalen Env. So
-- kennt weder diese Datei noch das Repository jemals einen Secret-Wert.

-- ── Herkunft eines Laufs: Scheduler oder Mensch ───────────────────────────────
alter table public.sync_runs
  add column if not exists trigger_source text
    check (trigger_source in ('scheduler', 'self_heal', 'admin', 'manual'));
alter table public.sync_runs
  add column if not exists dispatch_id uuid;

comment on column public.sync_runs.trigger_source is
  'Wer den Lauf ausgelöst hat. scheduler/self_heal = pg_cron, admin = '
  'angemeldeter seeszn_admin, manual = Secret von außen.';

-- ── gsc_sync_dispatches: was der Scheduler getan hat ──────────────────────────
-- Ein Eintrag je Auslösung, unabhängig davon, ob die App erreichbar war. Genau
-- diese Zeile fehlt sonst, wenn der Aufruf die App nie erreicht: ohne sie wäre
-- ein toter Scheduler von "es gab nichts zu tun" nicht zu unterscheiden.
create table if not exists public.gsc_sync_dispatches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  job_name text not null,
  /** 'scheduled' = täglicher Lauf, 'self_heal' = Nachholer nach einer Lücke. */
  reason text not null default 'scheduled' check (reason in ('scheduled', 'self_heal')),
  scheduled_at timestamptz not null default now(),
  /** Endpoint ohne Query-Parameter; enthält nie ein Secret. */
  endpoint text,
  /** Request-ID von pg_net; Grundlage der Zustellprüfung. */
  request_id bigint,
  http_status integer,
  /** true = App hat 2xx geantwortet und ok gemeldet. */
  delivered boolean,
  /** Kurzer, klartextfreier Fehlergrund; nie ein Stacktrace, nie ein Secret. */
  error_message text,
  reconciled_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists gsc_sync_dispatches_scheduled_idx
  on public.gsc_sync_dispatches (scheduled_at desc);
create index if not exists gsc_sync_dispatches_pending_idx
  on public.gsc_sync_dispatches (reconciled_at) where reconciled_at is null;

comment on table public.gsc_sync_dispatches is
  'Protokoll des Schedulers: eine Zeile je Auslösung des GSC-Syncs, inklusive '
  'Zustellstatus des HTTP-Aufrufs. Enthält niemals Secrets.';

alter table public.gsc_sync_dispatches enable row level security;

drop policy if exists "gsc_sync_dispatches_select_member" on public.gsc_sync_dispatches;
create policy "gsc_sync_dispatches_select_member"
  on public.gsc_sync_dispatches for select
  to authenticated
  using (organization_id is not null and public.is_org_member(organization_id));

-- Geschrieben wird ausschließlich von den SECURITY-DEFINER-Funktionen unten
-- bzw. service_role. Kein Insert/Update/Delete für Endnutzer.
grant select on public.gsc_sync_dispatches to authenticated;
-- Der Servercode (Statusendpunkt, Workspace-Loader) liest mit dem Secret Key.
grant select, insert, update on public.gsc_sync_dispatches to service_role;

-- ── Organisation der GSC-Datenquelle ──────────────────────────────────────────
-- Kein hart codierter Slug: maßgeblich ist, welche Organisation die
-- Search-Console-Datenquelle besitzt.
create or replace function public.gsc_sync_organization()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select organization_id
  from public.data_sources
  where provider = 'google_search_console'
  order by created_at
  limit 1;
$$;

-- ── Vault-Konfiguration setzen ────────────────────────────────────────────────
-- Einziger Weg, Endpoint und Secret zu hinterlegen. Ausführbar nur für
-- service_role, also ausschließlich serverseitig mit dem Secret Key —
-- angemeldete Nutzer (auch Admins) können weder schreiben noch lesen.
create or replace function public.set_gsc_sync_config(p_endpoint text, p_secret text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  select id into v_id from vault.secrets where name = 'gsc_sync_endpoint';
  if v_id is null then
    perform vault.create_secret(p_endpoint, 'gsc_sync_endpoint', 'Cron-Endpunkt des GSC-Syncs.');
  else
    perform vault.update_secret(v_id, p_endpoint, 'gsc_sync_endpoint', 'Cron-Endpunkt des GSC-Syncs.');
  end if;

  select id into v_id from vault.secrets where name = 'gsc_sync_secret';
  if v_id is null then
    perform vault.create_secret(p_secret, 'gsc_sync_secret', 'Shared Secret des GSC-Cron-Endpunkts.');
  else
    perform vault.update_secret(v_id, p_secret, 'gsc_sync_secret', 'Shared Secret des GSC-Cron-Endpunkts.');
  end if;
end;
$$;

revoke all on function public.set_gsc_sync_config(text, text) from public, anon, authenticated;
grant execute on function public.set_gsc_sync_config(text, text) to service_role;

/**
 * Die Search-Console-Property (z. B. "sc-domain:example.de" oder
 * "https://www.example.de/"). Kein Secret, aber umgebungsabhängig — und
 * genau deshalb hier: Ein Tippfehler in der Hosting-Umgebung lässt sonst
 * jede Google-Abfrage mit HTTP 400 auflaufen, ohne dass es sich von hier aus
 * korrigieren ließe. Der Vault-Wert dient als verlässlicher Rückfall, wenn
 * die Env-Variable fehlt oder offensichtlich unbrauchbar ist.
 */
create or replace function public.set_gsc_property(p_property text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_property !~ '^(sc-domain:|https?://)' then
    raise exception 'Property muss mit sc-domain: oder http(s):// beginnen.';
  end if;

  select id into v_id from vault.secrets where name = 'gsc_property';
  if v_id is null then
    perform vault.create_secret(p_property, 'gsc_property', 'Search-Console-Property.');
  else
    perform vault.update_secret(v_id, p_property, 'gsc_property', 'Search-Console-Property.');
  end if;
end;
$$;

revoke all on function public.set_gsc_property(text) from public, anon, authenticated;
grant execute on function public.set_gsc_property(text) to service_role;

/** Nur die Property lesen (kein Secret). */
create or replace function public.gsc_property()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'gsc_property';
$$;

revoke all on function public.gsc_property() from public, anon, authenticated;
grant execute on function public.gsc_property() to service_role;

/**
 * Zustand der Vault-Konfiguration, ohne die Werte preiszugeben. Damit lässt
 * sich prüfen, ob die Automatisierung eingerichtet ist, ohne ein Secret zu
 * lesen. Die Property ist kein Secret und wird deshalb im Klartext gemeldet.
 */
-- Rückgabetyp hat sich um die Property erweitert; CREATE OR REPLACE kann das
-- nicht, deshalb erst verwerfen.
drop function if exists public.gsc_sync_config_status();
create or replace function public.gsc_sync_config_status()
returns table (endpoint text, secret_configured boolean, property text)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select decrypted_secret from vault.decrypted_secrets where name = 'gsc_sync_endpoint'),
    exists (select 1 from vault.secrets where name = 'gsc_sync_secret'),
    (select decrypted_secret from vault.decrypted_secrets where name = 'gsc_property');
$$;

revoke all on function public.gsc_sync_config_status() from public, anon, authenticated;
grant execute on function public.gsc_sync_config_status() to service_role;

/**
 * Prüft ein vom Aufrufer vorgelegtes Secret gegen den Vault-Eintrag, ohne den
 * hinterlegten Wert je herauszugeben.
 *
 * Warum das gebraucht wird: Scheduler und App müssen dasselbe Secret kennen.
 * Lägen die Werte in zwei getrennten Umgebungen (Vault hier, Env im Hosting),
 * driften sie früher oder später auseinander — und der Sync fällt still aus.
 * Mit dieser Prüfung gibt es genau eine Quelle der Wahrheit, die beide Seiten
 * lesen. Der Vergleich läuft über Digests, damit er nicht am ersten
 * abweichenden Zeichen abbricht.
 */
create or replace function public.gsc_sync_secret_matches(p_candidate text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    extensions.digest(p_candidate, 'sha256')
      = extensions.digest(
          (select decrypted_secret from vault.decrypted_secrets where name = 'gsc_sync_secret'),
          'sha256'
        ),
    false
  );
$$;

revoke all on function public.gsc_sync_secret_matches(text) from public, anon, authenticated;
grant execute on function public.gsc_sync_secret_matches(text) to service_role;

-- ── Lauf beanspruchen: genau ein Sync gleichzeitig ────────────────────────────
-- Der Advisory Lock serialisiert die Prüfung, damit zwei gleichzeitige Aufrufe
-- (Scheduler + manueller Anstoß) nicht beide einen Lauf starten. Ein Lauf, der
-- seit über 15 Minuten "running" ist, gilt als abgebrochen: er wird als error
-- geschlossen und blockiert danach nicht weiter.
create or replace function public.claim_gsc_sync_run(
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
  perform pg_advisory_xact_lock(hashtext('gsc_sync:' || p_organization_id::text));

  update public.sync_runs
  set status = 'error',
      completed_at = now(),
      error_message = 'Lauf ohne Abschluss beendet (Zeitüberschreitung).'
  where organization_id = p_organization_id
    and status = 'running'
    and started_at <= now() - interval '15 minutes';

  if exists (
    select 1 from public.sync_runs
    where organization_id = p_organization_id and status = 'running'
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

comment on function public.claim_gsc_sync_run is
  'Beansprucht atomar einen Sync-Lauf. Gibt NULL zurück, wenn bereits einer '
  'läuft — der Aufrufer bricht dann sauber ab, statt parallel zu schreiben.';

-- Aufgerufen wird die Funktion ausschließlich vom Servercode der App über den
-- Secret Key. Angemeldete Nutzer dürfen keinen Sync-Lauf eröffnen.
revoke all on function public.claim_gsc_sync_run(uuid, uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.claim_gsc_sync_run(uuid, uuid, text, uuid) to service_role;

-- ── Scheduler-Auslösung ───────────────────────────────────────────────────────
create or replace function public.gsc_sync_dispatch(
  p_job_name text default 'kluehspies-gsc-daily-sync',
  p_reason text default 'scheduled'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_endpoint text;
  v_secret text;
  v_dispatch_id uuid;
  v_request_id bigint;
begin
  select decrypted_secret into v_endpoint
  from vault.decrypted_secrets where name = 'gsc_sync_endpoint';
  select decrypted_secret into v_secret
  from vault.decrypted_secrets where name = 'gsc_sync_secret';

  -- Fehlende Konfiguration wird protokolliert statt still verschluckt: sonst
  -- liefe der Scheduler jeden Tag ins Leere, ohne dass es jemand sieht.
  if v_endpoint is null or v_secret is null then
    insert into public.gsc_sync_dispatches (
      organization_id, job_name, reason, delivered, error_message, reconciled_at
    )
    values (
      public.gsc_sync_organization(), p_job_name, p_reason, false,
      'Vault-Eintrag gsc_sync_endpoint oder gsc_sync_secret fehlt.', now()
    )
    returning id into v_dispatch_id;
    return v_dispatch_id;
  end if;

  insert into public.gsc_sync_dispatches (organization_id, job_name, reason, endpoint)
  values (public.gsc_sync_organization(), p_job_name, p_reason, v_endpoint)
  returning id into v_dispatch_id;

  -- Das Secret reist ausschließlich im Header, nie in der URL: URLs landen in
  -- Server- und Proxy-Logs, Header nicht.
  select net.http_post(
    url := v_endpoint,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-gsc-sync-secret', v_secret
    ),
    body := jsonb_build_object('dispatchId', v_dispatch_id, 'triggerSource', p_reason),
    timeout_milliseconds := 120000
  ) into v_request_id;

  update public.gsc_sync_dispatches
  set request_id = v_request_id
  where id = v_dispatch_id;

  return v_dispatch_id;
end;
$$;

comment on function public.gsc_sync_dispatch is
  'Stößt den GSC-Sync über HTTP an und protokolliert die Auslösung. '
  'Endpoint und Secret kommen ausschließlich aus dem Vault.';

revoke all on function public.gsc_sync_dispatch(text, text) from public, anon, authenticated;

-- ── Zustellprüfung: hat der Aufruf die App erreicht? ──────────────────────────
-- pg_net arbeitet asynchron; die Antwort liegt erst später in net._http_response.
-- Ohne diesen Abgleich wüssten wir nur, dass gesendet wurde, nicht ob es ankam.
create or replace function public.gsc_sync_reconcile_dispatches()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row record;
  v_count integer := 0;
begin
  for v_row in
    select id, request_id
    from public.gsc_sync_dispatches
    where reconciled_at is null and request_id is not null
      and scheduled_at > now() - interval '2 days'
  loop
    update public.gsc_sync_dispatches d
    set http_status = r.status_code,
        delivered = (r.status_code between 200 and 299),
        error_message = case
          when r.error_msg is not null then left(r.error_msg, 300)
          when r.status_code not between 200 and 299
            then format('HTTP %s vom Sync-Endpunkt.', r.status_code)
          else null
        end,
        reconciled_at = now()
    from net._http_response r
    where d.id = v_row.id and r.id = v_row.request_id;

    if found then
      v_count := v_count + 1;
    end if;
  end loop;

  -- Aufrufe, zu denen pg_net nach zwei Stunden keine Antwort mehr hat (die
  -- Antworttabelle wird von Supabase regelmäßig geleert), gelten als nicht
  -- zustellbar. Besser ein ehrliches "unbekannt" als ein offener Zustand.
  update public.gsc_sync_dispatches
  set delivered = false,
      error_message = coalesce(error_message, 'Keine Antwort von der App erhalten.'),
      reconciled_at = now()
  where reconciled_at is null
    and request_id is not null
    and scheduled_at < now() - interval '2 hours';

  return v_count;
end;
$$;

revoke all on function public.gsc_sync_reconcile_dispatches() from public, anon, authenticated;

-- ── Self-Healing ──────────────────────────────────────────────────────────────
-- Läuft stündlich, tut aber fast immer nichts. Ausgelöst wird nur, wenn die
-- Daten tatsächlich zu alt sind UND gerade kein Versuch unterwegs ist. Damit
-- holt ein späterer Lauf einen ausgefallenen Tag nach, ohne dass jemand
-- eingreift — und ohne den Endpunkt im Fehlerfall in einer Schleife zu treffen.
create or replace function public.gsc_sync_self_heal()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid := public.gsc_sync_organization();
  v_available_until date;
begin
  if v_org is null then
    return null;
  end if;

  select max(period_end) into v_available_until
  from public.gsc_import_batches b
  join public.gsc_active_datasets a on a.import_batch_id = b.id
  where b.organization_id = v_org;

  -- Google gibt endgültige Tageswerte mit zwei bis drei Tagen Verzug frei;
  -- erst ab fünf Tagen Rückstand ist etwas wirklich liegen geblieben.
  if v_available_until is not null and v_available_until > current_date - 5 then
    return null;
  end if;

  -- Kein zweiter Versuch, solange einer unterwegs ist oder gerade erst war.
  if exists (
    select 1 from public.gsc_sync_dispatches
    where scheduled_at > now() - interval '90 minutes'
  ) then
    return null;
  end if;

  if exists (
    select 1 from public.sync_runs
    where organization_id = v_org and status = 'running'
      and started_at > now() - interval '15 minutes'
  ) then
    return null;
  end if;

  return public.gsc_sync_dispatch('kluehspies-gsc-self-heal', 'self_heal');
end;
$$;

revoke all on function public.gsc_sync_self_heal() from public, anon, authenticated;

-- ── Jobs einplanen (idempotent) ───────────────────────────────────────────────
-- cron.schedule legt bei gleichem Namen keinen zweiten Job an, sondern
-- aktualisiert ihn. Der vorherige unschedule-Durchlauf hält die Zeitplanung
-- trotzdem sauber, falls ein Job früher unter anderem Kommando lief.
do $$
declare
  v_job text;
begin
  foreach v_job in array array[
    'kluehspies-gsc-daily-sync',
    'kluehspies-gsc-self-heal',
    'kluehspies-gsc-reconcile'
  ] loop
    if exists (select 1 from cron.job where jobname = v_job) then
      perform cron.unschedule(v_job);
    end if;
  end loop;
end;
$$;

-- Täglicher Lauf 06:00 UTC. GSC-Daten des Vortags sind dann bereits final.
select cron.schedule(
  'kluehspies-gsc-daily-sync',
  '0 6 * * *',
  $$select public.gsc_sync_dispatch('kluehspies-gsc-daily-sync', 'scheduled');$$
);

-- Stündlicher Wächter; löst nur bei echtem Rückstand aus.
select cron.schedule(
  'kluehspies-gsc-self-heal',
  '30 * * * *',
  $$select public.gsc_sync_self_heal();$$
);

-- Zustellprüfung der offenen Aufrufe.
select cron.schedule(
  'kluehspies-gsc-reconcile',
  '*/5 * * * *',
  $$select public.gsc_sync_reconcile_dispatches();$$
);
