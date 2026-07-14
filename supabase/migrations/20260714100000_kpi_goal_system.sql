-- ─── KPI-Zielsystem: versionierte Ziele + manuelle Check-ins ──────────────────
-- Additive Migration. Ersetzt den früheren Entwurf review_stats: statt einer
-- Sonderlösung nur für Bewertungen entsteht EIN kanonisches Modell:
--
--   • ZIELE   -> kpi_targets (additiv erweitert): versioniert, zeitraumgebunden,
--                mit Owner, Begründung, Herkunft und Status. Eine Zeile pro
--                Zielversion; Änderungen erzeugen eine neue Version, alte werden
--                superseded (nie überschrieben, nie hart gelöscht).
--   • IST-WERTE (manuell) -> kpi_manual_check_ins (append-only): datierte
--                Check-ins für manuelle KPIs (Google-Bewertungen). Automatisch
--                gemessene GSC-Ist-Werte laufen NIE über dieses Modell.
--
-- Warum kpi_targets erweitern statt einer zweiten Zieltabelle: kpi_targets
-- erfüllt Historisierung, RLS (Mitglied liest, seeszn_admin schreibt),
-- created_by und nicht-destruktives Schließen bereits sauber und ist leer
-- (kein Seed/Script legt Zeilen an). Eine zweite Zieltabelle würde eine zweite,
-- widersprüchliche Wahrheit schaffen. Bestehende, remote angewendete
-- Migrationen bleiben unverändert.

-- ── 1 · kpi_targets additiv zur versionierten Zieltabelle erweitern ───────────

alter table public.kpi_targets
  add column if not exists period_type text not null default 'rolling_days'
    check (period_type in ('rolling_days', 'calendar_week', 'calendar_month', 'current_state')),
  add column if not exists period_days integer,
  add column if not exists comparator text not null default 'at_least'
    check (comparator in ('at_least', 'at_most')),
  add column if not exists owner_id uuid references public.profiles (id) on delete set null,
  add column if not exists rationale text,
  add column if not exists source_type text not null default 'manual_confirmed'
    check (source_type in ('manual_confirmed', 'imported_legacy', 'demo', 'system')),
  add column if not exists status text not null default 'active'
    check (status in ('active', 'superseded', 'archived', 'draft')),
  add column if not exists supersedes_target_id uuid references public.kpi_targets (id) on delete set null,
  add column if not exists archived_at timestamptz;

-- Legacy-Ziele aus dem alten, unbestätigten Modell absichern. Erfasst wird der
-- gesamte Prä-Migrationsbestand (alle beim Anwenden bereits vorhandenen Zeilen)
-- – NICHT über einen Zahlenwert und NICHT über eine feste ID. Diese Migration
-- fügt selbst keine Zeilen ein; alle vorhandenen Zeilen sind daher per Definition
-- Legacy. Sie werden als archiviert markiert (nie aktiv), erhalten eine gültige
-- Zeitraumform und werden NICHT physisch gelöscht. Muss vor der neuen
-- period_shape-Regel und dem „ein aktives Ziel"-Index laufen. Später über die
-- UI erstellte Ziele entstehen erst nach dieser Migration und bleiben unberührt.
update public.kpi_targets
set
  period_type = 'current_state',
  period_days = null,
  comparator = 'at_least',
  status = 'archived',
  source_type = 'imported_legacy',
  archived_at = now(),
  end_date = coalesce(end_date, current_date);

-- Zeitraum-Konsistenz: rollierende Ziele brauchen einen fachlich erlaubten
-- period_days-Wert (7/28/90); Monats- und Zustandsziele haben keinen.
alter table public.kpi_targets
  drop constraint if exists kpi_targets_period_shape;
alter table public.kpi_targets
  add constraint kpi_targets_period_shape check (
    (period_type = 'rolling_days' and period_days in (7, 28, 90))
    or (period_type in ('calendar_week', 'calendar_month', 'current_state') and period_days is null)
  );

-- Die alte Überlappungssperre (eine Zielversion je KPI und Datumsfenster) wird
-- durch die klarere Regel „genau ein aktives Ziel je KPI und Zeitraumdefinition"
-- ersetzt. Dadurch kann ein KPI künftig z. B. ein 28-Tage- und ein
-- Monatsziel gleichzeitig aktiv haben.
alter table public.kpi_targets
  drop constraint if exists kpi_targets_no_overlap;

create unique index if not exists kpi_targets_one_active
  on public.kpi_targets (kpi_definition_id, period_type, coalesce(period_days, -1))
  where status = 'active';

comment on table public.kpi_targets is
  'Versionierte, zeitraumgebundene KPI-Ziele (früher „targets"). Eine Zeile pro '
  'Zielversion; Änderung = neue Version, alte wird superseded. Kanonische '
  'Zielwahrheit für alle KPIs (Klicks, Bewertungen, künftig weitere).';

-- Kein eigener Org-Lock-Trigger: organization_id auf kpi_targets ist bereits
-- unveränderlich. Der Trigger kpi_targets_lock_org (→ prevent_org_change) wird
-- schon von der angewendeten Migration 20260712130100_security_hardening.sql
-- angelegt (kanonisch für alle Tabellen), und created_by ist über
-- kpi_targets_lock_author (20260712150000) geschützt. Ein zweiter Trigger
-- gleichen Namens würde nur kollidieren – daher hier bewusst keiner.

-- ── 2 · Deprecated Demo-Zielfeld entschärfen ─────────────────────────────────
-- Das alte, als DEPRECATED markierte Skalarfeld kpi_definitions.target_value
-- (Seed, vom Loader nicht gelesen) wird auf NULL gesetzt, damit kein Demo-Ziel
-- je aus dieser Altspalte auftaucht. Die zugehörige Legacy-Zielzeile in
-- kpi_targets wurde oben archiviert (nicht gelöscht). Idempotent.
update public.kpi_definitions set target_value = null where target_value is not null;

-- ── 3 · Manuelle Check-ins für manuell gepflegte KPIs (append-only) ───────────
-- Ausschließlich für manuelle KPIs (Google-Bewertungen). GSC-Ist-Werte werden
-- automatisch gemessen und dürfen hierüber niemals überschrieben werden.
create table public.kpi_manual_check_ins (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  kpi_definition_id uuid not null,
  value numeric not null,
  -- z. B. Gesamtzahl der Bewertungen neben der Sternebewertung.
  secondary_value numeric,
  -- Periodenschlüssel für calendar_month ("2026-07"); null bei current_state.
  period_key text,
  measured_at date not null,
  note text,
  source_type text not null default 'manually_entered'
    check (source_type in ('manually_entered', 'manual_confirmed', 'imported_legacy', 'system')),
  -- Wie bei den übrigen Urheberfeldern nullable + on delete set null, damit
  -- Profillöschungen möglich bleiben; per Trigger nach dem Anlegen gesperrt.
  entered_by uuid references public.profiles (id) on delete set null,
  supersedes_check_in_id uuid references public.kpi_manual_check_ins (id) on delete set null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (kpi_definition_id, organization_id)
    references public.kpi_definitions (id, organization_id) on delete cascade
);

create index kpi_manual_check_ins_kpi_idx
  on public.kpi_manual_check_ins (kpi_definition_id, measured_at desc);
create index kpi_manual_check_ins_org_idx
  on public.kpi_manual_check_ins (organization_id);

-- entered_by und organization_id sind nach dem Anlegen unveränderlich
-- (Übergang auf NULL bleibt erlaubt, damit Profillöschungen greifen).
create trigger kpi_manual_check_ins_lock_author
  before update on public.kpi_manual_check_ins
  for each row
  execute function public.prevent_author_change('entered_by', 'organization_id');

-- ── 4 · RLS + Grants ──────────────────────────────────────────────────────────
alter table public.kpi_manual_check_ins enable row level security;

-- Lesen: jedes Organisationsmitglied. Schreiben: ausschließlich seeszn_admin.
create policy "kpi_manual_check_ins_select_member"
  on public.kpi_manual_check_ins for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "kpi_manual_check_ins_insert_admin"
  on public.kpi_manual_check_ins for insert
  to authenticated
  with check (
    public.has_org_role(organization_id, array['seeszn_admin'])
    and entered_by = (select auth.uid())
  );

-- Append-only: kein UPDATE/DELETE für Endnutzer. Korrekturen sind neue Zeilen.
grant select, insert, update, delete on public.kpi_manual_check_ins to service_role;
grant select, insert on public.kpi_manual_check_ins to authenticated;

-- ── 5 · Realtime ──────────────────────────────────────────────────────────────
-- Ziele und Check-ins sollen live in den Room (KPI-Karte/Bewertungen sofort
-- aktualisieren). postgres_changes respektiert RLS.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table
      public.kpi_targets,
      public.kpi_manual_check_ins;
  end if;
end;
$$;
