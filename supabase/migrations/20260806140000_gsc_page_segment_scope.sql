-- ─── GSC: Scope-Typ "page_segment" für Marken- und Nicht-Marken-Suchen ────────
-- Eine Seite lässt sich sinnvoll danach zerlegen, ob eine Suchanfrage den
-- Markennamen enthält. Marken-Suchen finden das Unternehmen, weil man es
-- bereits kennt; Nicht-Marken-Suchen sind die eigentliche SEO-Leistung. In
-- einer gemeinsamen Zahl verschwindet dieser Unterschied.
--
-- Umgesetzt als eigener Scope statt als nachträgliche Aufteilung der
-- Query-Tabelle: nur so bekommt jedes Segment eine echte Tageszeitreihe – und
-- damit einen belastbaren Vergleich zur Vorperiode statt einer Momentaufnahme
-- über den gesamten Exportzeitraum.
--
--   scope_type  = 'page_segment'
--   scope_value = '<seiten-key>:<branded|non_branded>', z. B. 'homepage:branded'
--
-- Welche Seiten zerlegt werden, steht ausschließlich in lib/gsc/pageScopes.ts
-- (TRACKED_PAGES.brandSplit). Rein additiv: bestehende Zeilen, Indizes,
-- Trigger und RLS-Policies bleiben unberührt.

alter table public.gsc_import_batches
  drop constraint if exists gsc_import_batches_scope_type_check;
alter table public.gsc_import_batches
  add constraint gsc_import_batches_scope_type_check
  check (scope_type in ('sitewide', 'path_prefix', 'product_page', 'page', 'page_segment'));

alter table public.gsc_scope_daily_metrics
  drop constraint if exists gsc_scope_daily_metrics_scope_type_check;
alter table public.gsc_scope_daily_metrics
  add constraint gsc_scope_daily_metrics_scope_type_check
  check (scope_type in ('sitewide', 'path_prefix', 'product_page', 'page', 'page_segment'));

alter table public.gsc_dimension_snapshots
  drop constraint if exists gsc_dimension_snapshots_scope_type_check;
alter table public.gsc_dimension_snapshots
  add constraint gsc_dimension_snapshots_scope_type_check
  check (scope_type in ('sitewide', 'path_prefix', 'product_page', 'page', 'page_segment'));

alter table public.gsc_active_datasets
  drop constraint if exists gsc_active_datasets_scope_type_check;
alter table public.gsc_active_datasets
  add constraint gsc_active_datasets_scope_type_check
  check (scope_type in ('sitewide', 'path_prefix', 'product_page', 'page', 'page_segment'));

comment on column public.gsc_active_datasets.scope_value is
  'Bei scope_type = ''page'' die kanonische Seiten-URL, bei ''page_segment'' '
  '''<seiten-key>:<segment>'', sonst der fachliche Scope-Schlüssel.';
