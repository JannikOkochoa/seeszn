-- ─── KPI-Dashboard: Grants ────────────────────────────────────────────────────
-- "Automatically expose new tables" ist im Projekt deaktiviert: neue Tabellen
-- haben keinerlei Privilegien für anon, authenticated oder service_role.
-- Deshalb hier explizite, minimale Grants:
--   anon          – nichts (kein öffentlicher Zugriff auf KPI-Daten)
--   authenticated – nur was die RLS-Policies tatsächlich erlauben
--   service_role  – voller Zugriff für Servercode (Sync, Verwaltung)

-- service_role: kompletter Zugriff für den Backend-Sync und Admin-Servercode.
grant select, insert, update, delete on
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
  public.comments
to service_role;

-- authenticated: Lesen überall dort, wo eine SELECT-Policy existiert.
grant select on
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
  public.comments
to authenticated;

-- authenticated: Schreiben nur auf Tabellen mit Schreib-Policies.
-- Die tatsächliche Berechtigung (Rolle, eigene Organisation) erzwingt RLS.
grant update on public.organizations to authenticated;
grant insert, update on public.profiles to authenticated;
grant insert, update, delete on public.memberships to authenticated;
grant insert, update, delete on public.data_sources to authenticated;
grant insert, update, delete on public.kpi_definitions to authenticated;
grant insert, update, delete on public.pages to authenticated;
grant insert, update, delete on public.sync_runs to authenticated;
grant insert, update, delete on public.kpi_snapshots to authenticated;
grant insert, update, delete on public.gsc_daily_metrics to authenticated;
grant insert, update, delete on public.tasks to authenticated;
grant insert, update, delete on public.comments to authenticated;

-- anon erhält bewusst keinerlei Grants auf diesen Tabellen.
