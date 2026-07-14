-- ─── Produktseiten: Import von klassenfahrten-kluehspies.de ───────────────────
-- Additive Erweiterung der bestehenden pages-Tabelle. Die Produktseiten werden
-- serverseitig über POST /api/sync/product-pages importiert (nur seeszn_admin,
-- nie beim Login). Quelle sind die beiden Städte-Listen (Deutschland/Europa);
-- die Europa-Liste lädt einen Teil der Ziele erst per "Mehr Reisen laden" nach,
-- deshalb vervollständigt der Provider über die Travel-Sitemap der Website
-- (lib/product-pages/provider.ts).
--
-- Verhalten des Syncs:
--   * idempotente Upserts über den bestehenden Unique Constraint
--     (organization_id, url)
--   * neue Ziele werden ergänzt (active = true, archived_at = null)
--   * nicht mehr gefundene Ziele werden archiviert (archived_at gesetzt,
--     active = false), niemals gelöscht

alter table public.pages
  add column city text,
  add column country text,
  add column region text check (region in ('deutschland', 'europa')),
  add column active boolean not null default true,
  add column source text,
  add column last_synced_at timestamptz,
  add column archived_at timestamptz;

comment on column public.pages.region is
  'Herkunftsliste auf der Klühspies-Website: deutschland oder europa. '
  'Null für Seiten, die nicht aus dem Produktseiten-Sync stammen.';
comment on column public.pages.source is
  'Herkunft des Datensatzes, z. B. ''kluehspies_website'' für den '
  'Produktseiten-Sync. Null für manuell gepflegte Seiten.';
comment on column public.pages.archived_at is
  'Gesetzt, wenn das Ziel bei einem Sync nicht mehr gefunden wurde. '
  'Archivierte Seiten bleiben für historische Tasks/Metriken referenzierbar.';

-- Auswahllisten filtern auf aktive Produktseiten einer Organisation.
create index pages_org_active_product_idx
  on public.pages (organization_id, region)
  where archived_at is null;
