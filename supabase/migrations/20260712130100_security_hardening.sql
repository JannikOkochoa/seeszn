-- ─── KPI-Dashboard: Sicherheitshärtung ────────────────────────────────────────
-- Additive Härtung nach dem Backend-Audit (PASS WITH GAPS):
--   1) Rest-Privilegien aus den Projekt-Default-Privilegien entfernen
--      (TRUNCATE/REFERENCES/TRIGGER für anon und authenticated)
--   2) EXECUTE auf Trigger-Funktionen entziehen
--   3) Default Privileges härten, damit künftige Tabellen sauber starten
--   4) organization_id nach dem Anlegen unveränderlich machen
--   5) Spalte für den Stale-Sync-Mechanismus (Timeout-Claim im Servercode)

-- ── 1) Rest-Privilegien entziehen ─────────────────────────────────────────────
-- TRUNCATE unterliegt nicht RLS und REFERENCES/TRIGGER werden von Endnutzern
-- nie gebraucht. anon zusätzlich komplett auf null setzen (Belt & Braces;
-- DML hatte anon ohnehin nicht).
revoke truncate, references, trigger on
  public.organizations,
  public.profiles,
  public.memberships,
  public.data_sources,
  public.sync_runs,
  public.kpi_definitions,
  public.kpi_snapshots,
  public.pages,
  public.gsc_daily_metrics,
  public.tasks,
  public.comments,
  public.kpi_targets,
  public.task_kpi_links,
  public.approvals,
  public.annotations,
  public.audit_events
from anon, authenticated;

revoke all on
  public.organizations,
  public.profiles,
  public.memberships,
  public.data_sources,
  public.sync_runs,
  public.kpi_definitions,
  public.kpi_snapshots,
  public.pages,
  public.gsc_daily_metrics,
  public.tasks,
  public.comments,
  public.kpi_targets,
  public.task_kpi_links,
  public.approvals,
  public.annotations,
  public.audit_events
from anon;

-- ── 2) Trigger-Funktionen: kein EXECUTE für Endnutzer ─────────────────────────
-- Trigger feuern unabhängig von EXECUTE-Rechten des aufrufenden Nutzers;
-- direkter Aufruf ist damit für niemanden außer postgres möglich.
revoke execute on function public.handle_new_user () from public, anon, authenticated;
revoke execute on function public.set_updated_at () from public, anon, authenticated;
revoke execute on function public.protect_decided_approvals () from public, anon, authenticated;

-- ── 3) Default Privileges härten ──────────────────────────────────────────────
-- Künftige Tabellen/Sequenzen/Funktionen von postgres erhalten keine
-- automatischen Rechte mehr für anon/authenticated bzw. PUBLIC; jede neue
-- Tabelle braucht dann wie hier explizite, minimale Grants.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon;

-- ── 4) organization_id unveränderlich ─────────────────────────────────────────
-- Verhindert das Verschieben fachlicher Datensätze zwischen Organisationen –
-- auch für Nutzer mit Memberships in mehreren Organisationen und auch für
-- Servercode (Umzüge wären, falls je nötig, delete + insert).
create or replace function public.prevent_org_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.organization_id is distinct from old.organization_id then
    raise exception 'organization_id darf nach dem Anlegen nicht geändert werden.';
  end if;
  return new;
end;
$$;

revoke execute on function public.prevent_org_change () from public, anon, authenticated;

create trigger memberships_lock_org before update on public.memberships
  for each row execute function public.prevent_org_change();
create trigger data_sources_lock_org before update on public.data_sources
  for each row execute function public.prevent_org_change();
create trigger sync_runs_lock_org before update on public.sync_runs
  for each row execute function public.prevent_org_change();
create trigger kpi_definitions_lock_org before update on public.kpi_definitions
  for each row execute function public.prevent_org_change();
create trigger kpi_snapshots_lock_org before update on public.kpi_snapshots
  for each row execute function public.prevent_org_change();
create trigger pages_lock_org before update on public.pages
  for each row execute function public.prevent_org_change();
create trigger gsc_daily_metrics_lock_org before update on public.gsc_daily_metrics
  for each row execute function public.prevent_org_change();
create trigger tasks_lock_org before update on public.tasks
  for each row execute function public.prevent_org_change();
create trigger comments_lock_org before update on public.comments
  for each row execute function public.prevent_org_change();
create trigger kpi_targets_lock_org before update on public.kpi_targets
  for each row execute function public.prevent_org_change();
create trigger task_kpi_links_lock_org before update on public.task_kpi_links
  for each row execute function public.prevent_org_change();
create trigger approvals_lock_org before update on public.approvals
  for each row execute function public.prevent_org_change();
create trigger annotations_lock_org before update on public.annotations
  for each row execute function public.prevent_org_change();
create trigger audit_events_lock_org before update on public.audit_events
  for each row execute function public.prevent_org_change();

-- ── 5) Stale-Sync-Mechanismus ─────────────────────────────────────────────────
-- Zeitstempel des Sync-Claims. Der Servercode (lib/gsc/sync.ts) übernimmt
-- einen 'syncing'-Status, dessen Claim älter als das Timeout ist, markiert
-- verwaiste sync_runs als error und protokolliert die Übernahme in
-- audit_events. Parallele aktive Syncs bleiben ausgeschlossen (atomares,
-- konditionales UPDATE).
alter table public.data_sources add column sync_claimed_at timestamptz;

comment on column public.data_sources.sync_claimed_at is
  'Zeitpunkt des letzten Sync-Claims. Claims älter als das Stale-Timeout '
  '(15 Minuten, siehe lib/gsc/sync.ts) dürfen von einem neuen Sync übernommen werden.';
