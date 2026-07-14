-- ─── GSC-Export-Import: Batches, Tageswerte, Dimensions-Snapshots ─────────────
-- Additives Datenmodell für den Import echter Search-Console-Exporte (ZIP mit
-- Chart.csv + Dimensionstabellen). Kernprinzipien:
--
--   1. Chart.csv ist eine tägliche Zeitreihe pro Scope
--      -> gsc_scope_daily_metrics (nach Datum, filterbar 7/28/90 Tage).
--   2. Queries/Pages/Devices/Countries/Search appearance sind Aggregate über
--      den GESAMTEN Exportzeitraum -> gsc_dimension_snapshots mit explizitem
--      period_start/period_end. Sie werden nie als Tagesdaten dargestellt.
--   3. gsc_active_datasets bestimmt je Scope genau einen aktiven Batch:
--      die einzige Wahrheit für KPI-Berechnungen. Demo-Daten (kpi_snapshots /
--      gsc_daily_metrics aus dem Demo-Sync) hängen an keinem Batch und fließen
--      damit in keine KPI-Berechnung mehr ein; sie werden nicht gelöscht.
--   4. Schreiben ausschließlich über Servercode (service_role) nach
--      Rollenprüfung; Endnutzer (auch Admins) lesen nur. Importierte Werte
--      sind unveränderlich, Korrekturen laufen über einen neuen Batch.

-- ── gsc_import_batches ────────────────────────────────────────────────────────
create table public.gsc_import_batches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  data_source_id uuid references public.data_sources (id) on delete set null,
  file_hash text not null,
  original_file_name text not null,
  scope_type text not null check (scope_type in ('sitewide', 'path_prefix', 'product_page')),
  scope_value text,
  period_start date not null,
  period_end date not null,
  imported_at timestamptz,
  imported_by uuid references public.profiles (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'validating', 'imported', 'failed', 'archived')),
  error_message text,
  row_counts jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (period_end >= period_start),
  -- Identischer Dateihash wird pro Organisation nie doppelt importiert.
  unique (organization_id, file_hash),
  -- Composite-FK-Anker für die Kind-Tabellen (Muster wie 20260712130000).
  unique (id, organization_id)
);

comment on table public.gsc_import_batches is
  'Ein importierter GSC-ZIP-Export. metadata enthält nie Dateiinhalte oder '
  'Secrets, nur flache Import-Diagnostik (z. B. Versuchszähler).';

create index gsc_import_batches_org_status_idx
  on public.gsc_import_batches (organization_id, status);

-- ── gsc_scope_daily_metrics (Chart.csv: tägliche Zeitreihe je Scope) ──────────
create table public.gsc_scope_daily_metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  import_batch_id uuid not null,
  scope_type text not null check (scope_type in ('sitewide', 'path_prefix', 'product_page')),
  scope_value text,
  date date not null,
  clicks numeric not null check (clicks >= 0),
  impressions numeric not null check (impressions >= 0),
  -- Anteil 0..1 (aus "2.62%" normalisiert), nicht Prozent.
  ctr numeric not null check (ctr >= 0 and ctr <= 1),
  position numeric not null check (position >= 0),
  created_at timestamptz not null default now(),
  foreign key (import_batch_id, organization_id)
    references public.gsc_import_batches (id, organization_id) on delete cascade,
  -- Keine doppelten Tageswerte innerhalb eines Batch.
  unique (import_batch_id, date)
);

create index gsc_scope_daily_metrics_org_idx
  on public.gsc_scope_daily_metrics (organization_id);

-- ── gsc_dimension_snapshots (Aggregate über den gesamten Exportzeitraum) ──────
create table public.gsc_dimension_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  import_batch_id uuid not null,
  scope_type text not null check (scope_type in ('sitewide', 'path_prefix', 'product_page')),
  scope_value text,
  dimension_type text not null
    check (dimension_type in ('query', 'page', 'device', 'country', 'search_appearance')),
  dimension_value text not null,
  clicks numeric not null check (clicks >= 0),
  impressions numeric not null check (impressions >= 0),
  ctr numeric not null check (ctr >= 0 and ctr <= 1),
  position numeric not null check (position >= 0),
  period_start date not null,
  period_end date not null,
  created_at timestamptz not null default now(),
  check (period_end >= period_start),
  foreign key (import_batch_id, organization_id)
    references public.gsc_import_batches (id, organization_id) on delete cascade,
  -- Keine doppelte Dimension innerhalb eines Batch.
  unique (import_batch_id, dimension_type, dimension_value)
);

create index gsc_dimension_snapshots_batch_type_idx
  on public.gsc_dimension_snapshots (import_batch_id, dimension_type);
create index gsc_dimension_snapshots_org_idx
  on public.gsc_dimension_snapshots (organization_id);

-- ── gsc_active_datasets (welcher Batch gilt aktuell je Scope) ─────────────────
create table public.gsc_active_datasets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  scope_type text not null check (scope_type in ('sitewide', 'path_prefix', 'product_page')),
  scope_value text,
  import_batch_id uuid not null,
  activated_at timestamptz not null default now(),
  activated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (import_batch_id, organization_id)
    references public.gsc_import_batches (id, organization_id) on delete cascade
);

-- Genau ein aktiver Batch je (Organisation, Scope); Aktivierung ist ein
-- einzelner Upsert und damit ein atomarer Umschaltpunkt ohne Zwischenzustand.
create unique index gsc_active_datasets_scope_key
  on public.gsc_active_datasets (organization_id, scope_type, coalesce(scope_value, ''));

-- Ein aktiver Datensatz darf nur auf einen vollständig importierten Batch
-- desselben Scopes zeigen: keine zweite widersprüchliche Wahrheit.
create or replace function public.enforce_active_dataset_batch()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  batch record;
begin
  select status, scope_type, scope_value
    into batch
    from public.gsc_import_batches
    where id = new.import_batch_id;
  if batch is null then
    raise exception 'Import-Batch nicht gefunden.';
  end if;
  if batch.status <> 'imported' then
    raise exception 'Nur vollständig importierte Batches können aktiviert werden (Status: %).', batch.status;
  end if;
  if batch.scope_type <> new.scope_type
    or coalesce(batch.scope_value, '') <> coalesce(new.scope_value, '')
  then
    raise exception 'Batch-Scope und Aktivierungs-Scope stimmen nicht überein.';
  end if;
  return new;
end;
$$;

revoke execute on function public.enforce_active_dataset_batch () from public, anon, authenticated;

create trigger gsc_active_datasets_enforce_batch
  before insert or update on public.gsc_active_datasets
  for each row
  execute function public.enforce_active_dataset_batch();

-- ── Unveränderlichkeit ────────────────────────────────────────────────────────
-- Importierte Werte sind Fakten: kein UPDATE, für niemanden. Korrekturen
-- laufen über einen neuen Batch; fehlgeschlagene Batches räumen ihre Zeilen
-- per DELETE (cascade) und importieren neu.
create or replace function public.prevent_gsc_value_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception
    'Importierte GSC-Werte sind unveränderlich. Korrekturen über einen neuen Import-Batch.';
end;
$$;

revoke execute on function public.prevent_gsc_value_update () from public, anon, authenticated;

create trigger gsc_scope_daily_metrics_immutable
  before update on public.gsc_scope_daily_metrics
  for each row
  execute function public.prevent_gsc_value_update();

create trigger gsc_dimension_snapshots_immutable
  before update on public.gsc_dimension_snapshots
  for each row
  execute function public.prevent_gsc_value_update();

-- Batches: Identität ist ab Anlage fix; ein importierter Batch kann nur noch
-- archiviert werden (Statuswechsel imported -> archived), sonst nichts.
create or replace function public.protect_gsc_import_batches()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.file_hash is distinct from old.file_hash
    or new.original_file_name is distinct from old.original_file_name
    or new.scope_type is distinct from old.scope_type
    or new.scope_value is distinct from old.scope_value
    or new.period_start is distinct from old.period_start
    or new.period_end is distinct from old.period_end
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Identitätsfelder eines Import-Batch sind unveränderlich.';
  end if;
  if old.status = 'imported' and new.status not in ('imported', 'archived') then
    raise exception 'Ein importierter Batch kann nur archiviert werden.';
  end if;
  return new;
end;
$$;

revoke execute on function public.protect_gsc_import_batches () from public, anon, authenticated;

create trigger gsc_import_batches_protect
  before update on public.gsc_import_batches
  for each row
  execute function public.protect_gsc_import_batches();

-- organization_id bleibt wie überall unveränderlich; Urheber ebenso.
create trigger gsc_import_batches_lock_org before update on public.gsc_import_batches
  for each row execute function public.prevent_org_change();
create trigger gsc_scope_daily_metrics_lock_org before update on public.gsc_scope_daily_metrics
  for each row execute function public.prevent_org_change();
create trigger gsc_dimension_snapshots_lock_org before update on public.gsc_dimension_snapshots
  for each row execute function public.prevent_org_change();
create trigger gsc_active_datasets_lock_org before update on public.gsc_active_datasets
  for each row execute function public.prevent_org_change();

create trigger gsc_import_batches_lock_author
  before update on public.gsc_import_batches
  for each row execute function public.prevent_author_change('imported_by');

-- ── RLS ───────────────────────────────────────────────────────────────────────
-- Lesen: alle Mitglieder der Organisation (Viewer und Editor eingeschlossen).
-- Schreiben: ausschließlich service_role nach serverseitiger Rollenprüfung
-- (Import und Aktivierung nur SEESZN Admin); deshalb bewusst keine
-- INSERT/UPDATE/DELETE-Policies und keine Schreib-Grants für authenticated.
alter table public.gsc_import_batches enable row level security;
alter table public.gsc_scope_daily_metrics enable row level security;
alter table public.gsc_dimension_snapshots enable row level security;
alter table public.gsc_active_datasets enable row level security;

create policy "gsc_import_batches_select_member"
  on public.gsc_import_batches for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "gsc_scope_daily_metrics_select_member"
  on public.gsc_scope_daily_metrics for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "gsc_dimension_snapshots_select_member"
  on public.gsc_dimension_snapshots for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "gsc_active_datasets_select_member"
  on public.gsc_active_datasets for select
  to authenticated
  using (public.is_org_member(organization_id));

-- ── GRANTs (Default Privileges sind seit 20260712130100 leer) ─────────────────
grant select, insert, update, delete on
  public.gsc_import_batches,
  public.gsc_scope_daily_metrics,
  public.gsc_dimension_snapshots,
  public.gsc_active_datasets
to service_role;

grant select on
  public.gsc_import_batches,
  public.gsc_scope_daily_metrics,
  public.gsc_dimension_snapshots,
  public.gsc_active_datasets
to authenticated;
-- anon: nichts.
