-- ─── GSC: Scope-Typ "page" für die wiederverwendbare Seiten-Performance ───────
-- Bisher kannte das Import-Modell drei Scopes: 'sitewide' (ganze Property),
-- 'path_prefix' ("Alle Städtereisen") und 'product_page' (die drei Pilot-
-- Stadtseiten). Für die Seiten-Performance kommt ein vierter, generischer Typ
-- dazu:
--
--   'page'  – genau eine URL, scope_value ist die kanonische URL selbst.
--
-- Damit lässt sich jede beliebige Seite (Homepage, Blogartikel, Landingpage)
-- über denselben Weg tracken, ohne für jede neue Seite ein eigenes Konzept zu
-- erfinden. Die drei bestehenden Pilotseiten bleiben unverändert
-- 'product_page' – sie tragen die Winners/Losers-Ableitungen und werden nicht
-- migriert.
--
-- Rein additiv: bestehende Zeilen, Indizes, Trigger und RLS-Policies bleiben
-- unberührt. Die Check-Constraints heißen in allen vier Tabellen nach dem
-- Postgres-Standardmuster <tabelle>_scope_type_check.

alter table public.gsc_import_batches
  drop constraint if exists gsc_import_batches_scope_type_check;
alter table public.gsc_import_batches
  add constraint gsc_import_batches_scope_type_check
  check (scope_type in ('sitewide', 'path_prefix', 'product_page', 'page'));

alter table public.gsc_scope_daily_metrics
  drop constraint if exists gsc_scope_daily_metrics_scope_type_check;
alter table public.gsc_scope_daily_metrics
  add constraint gsc_scope_daily_metrics_scope_type_check
  check (scope_type in ('sitewide', 'path_prefix', 'product_page', 'page'));

alter table public.gsc_dimension_snapshots
  drop constraint if exists gsc_dimension_snapshots_scope_type_check;
alter table public.gsc_dimension_snapshots
  add constraint gsc_dimension_snapshots_scope_type_check
  check (scope_type in ('sitewide', 'path_prefix', 'product_page', 'page'));

alter table public.gsc_active_datasets
  drop constraint if exists gsc_active_datasets_scope_type_check;
alter table public.gsc_active_datasets
  add constraint gsc_active_datasets_scope_type_check
  check (scope_type in ('sitewide', 'path_prefix', 'product_page', 'page'));

comment on column public.gsc_active_datasets.scope_value is
  'Bei scope_type = ''page'' die kanonische Seiten-URL, sonst der fachliche '
  'Scope-Schlüssel (Pfad-Prefix bzw. Seitenname).';
