-- ─── KPI-Dashboard: Row Level Security ────────────────────────────────────────
-- Grundprinzip: Jede Zeile gehört einer Organisation. Zugriff besteht nur bei
-- Membership; Schreibrechte hängen an der Rolle. organization_id aus dem
-- Client kann keinen Fremdzugriff eröffnen, weil jede Policy (USING und
-- WITH CHECK) die Membership des angemeldeten Nutzers über auth.uid() prüft.
--
-- Rollen:
--   seeszn_admin      – alle Datensätze der eigenen Organisation erstellen/bearbeiten
--   kluehspies_editor – KPIs lesen; Tasks und Kommentare erstellen/bearbeiten
--   viewer            – nur lesen

-- Helper laufen als security definer, damit Policies auf memberships zugreifen
-- können, ohne deren eigene RLS-Policies rekursiv auszulösen.
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    where m.organization_id = org_id
      and m.user_id = (select auth.uid())
  );
$$;

create or replace function public.has_org_role(org_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    where m.organization_id = org_id
      and m.user_id = (select auth.uid())
      and m.role = any (allowed_roles)
  );
$$;

-- Sichtbarkeit von Profilen: nur das eigene Profil und Profile aus
-- gemeinsamen Organisationen (für Namen an Tasks/Kommentaren).
create or replace function public.shares_org_with(profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships me
    join public.memberships them
      on them.organization_id = me.organization_id
    where me.user_id = (select auth.uid())
      and them.user_id = profile_id
  );
$$;

revoke all on function public.is_org_member (uuid) from public, anon;
revoke all on function public.has_org_role (uuid, text[]) from public, anon;
revoke all on function public.shares_org_with (uuid) from public, anon;
grant execute on function public.is_org_member (uuid) to authenticated;
grant execute on function public.has_org_role (uuid, text[]) to authenticated;
grant execute on function public.shares_org_with (uuid) to authenticated;

-- RLS explizit aktivieren (unabhängig vom Projekt-Default für neue Tabellen).
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.data_sources enable row level security;
alter table public.sync_runs enable row level security;
alter table public.kpi_definitions enable row level security;
alter table public.kpi_snapshots enable row level security;
alter table public.pages enable row level security;
alter table public.gsc_daily_metrics enable row level security;
alter table public.tasks enable row level security;
alter table public.comments enable row level security;

-- ── organizations ─────────────────────────────────────────────────────────────
-- Kein INSERT/DELETE für Endnutzer: neue Organisationen entstehen nur über
-- Servercode (service_role) oder Migrationen.
create policy "organizations_select_member"
  on public.organizations for select
  to authenticated
  using (public.is_org_member(id));

create policy "organizations_update_admin"
  on public.organizations for update
  to authenticated
  using (public.has_org_role(id, array['seeszn_admin']))
  with check (public.has_org_role(id, array['seeszn_admin']));

-- ── profiles ──────────────────────────────────────────────────────────────────
create policy "profiles_select_self_or_shared_org"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or public.shares_org_with(id));

create policy "profiles_insert_self"
  on public.profiles for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ── memberships ───────────────────────────────────────────────────────────────
create policy "memberships_select_own_or_org"
  on public.memberships for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or public.is_org_member(organization_id)
  );

create policy "memberships_insert_admin"
  on public.memberships for insert
  to authenticated
  with check (public.has_org_role(organization_id, array['seeszn_admin']));

create policy "memberships_update_admin"
  on public.memberships for update
  to authenticated
  using (public.has_org_role(organization_id, array['seeszn_admin']))
  with check (public.has_org_role(organization_id, array['seeszn_admin']));

create policy "memberships_delete_admin"
  on public.memberships for delete
  to authenticated
  using (public.has_org_role(organization_id, array['seeszn_admin']));

-- ── data_sources / kpi_definitions / pages ────────────────────────────────────
-- Lesen: alle Mitglieder. Schreiben: nur seeszn_admin.
create policy "data_sources_select_member"
  on public.data_sources for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "data_sources_write_admin"
  on public.data_sources for all
  to authenticated
  using (public.has_org_role(organization_id, array['seeszn_admin']))
  with check (public.has_org_role(organization_id, array['seeszn_admin']));

create policy "kpi_definitions_select_member"
  on public.kpi_definitions for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "kpi_definitions_write_admin"
  on public.kpi_definitions for all
  to authenticated
  using (public.has_org_role(organization_id, array['seeszn_admin']))
  with check (public.has_org_role(organization_id, array['seeszn_admin']));

create policy "pages_select_member"
  on public.pages for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "pages_write_admin"
  on public.pages for all
  to authenticated
  using (public.has_org_role(organization_id, array['seeszn_admin']))
  with check (public.has_org_role(organization_id, array['seeszn_admin']));

-- ── sync_runs / kpi_snapshots / gsc_daily_metrics ─────────────────────────────
-- Werden regulär vom Server (service_role, an RLS vorbei) geschrieben.
-- Admin-Policies erlauben manuelle Korrekturen innerhalb der eigenen Org.
create policy "sync_runs_select_member"
  on public.sync_runs for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "sync_runs_write_admin"
  on public.sync_runs for all
  to authenticated
  using (public.has_org_role(organization_id, array['seeszn_admin']))
  with check (public.has_org_role(organization_id, array['seeszn_admin']));

create policy "kpi_snapshots_select_member"
  on public.kpi_snapshots for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "kpi_snapshots_write_admin"
  on public.kpi_snapshots for all
  to authenticated
  using (public.has_org_role(organization_id, array['seeszn_admin']))
  with check (public.has_org_role(organization_id, array['seeszn_admin']));

create policy "gsc_daily_metrics_select_member"
  on public.gsc_daily_metrics for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "gsc_daily_metrics_write_admin"
  on public.gsc_daily_metrics for all
  to authenticated
  using (public.has_org_role(organization_id, array['seeszn_admin']))
  with check (public.has_org_role(organization_id, array['seeszn_admin']));

-- ── tasks ─────────────────────────────────────────────────────────────────────
create policy "tasks_select_member"
  on public.tasks for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "tasks_insert_admin_or_editor"
  on public.tasks for insert
  to authenticated
  with check (
    public.has_org_role(organization_id, array['seeszn_admin', 'kluehspies_editor'])
    and created_by = (select auth.uid())
  );

create policy "tasks_update_admin_or_editor"
  on public.tasks for update
  to authenticated
  using (public.has_org_role(organization_id, array['seeszn_admin', 'kluehspies_editor']))
  with check (public.has_org_role(organization_id, array['seeszn_admin', 'kluehspies_editor']));

create policy "tasks_delete_admin"
  on public.tasks for delete
  to authenticated
  using (public.has_org_role(organization_id, array['seeszn_admin']));

-- ── comments ──────────────────────────────────────────────────────────────────
create policy "comments_select_member"
  on public.comments for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "comments_insert_admin_or_editor"
  on public.comments for insert
  to authenticated
  with check (
    public.has_org_role(organization_id, array['seeszn_admin', 'kluehspies_editor'])
    and profile_id = (select auth.uid())
  );

create policy "comments_update_own"
  on public.comments for update
  to authenticated
  using (
    profile_id = (select auth.uid())
    and public.has_org_role(organization_id, array['seeszn_admin', 'kluehspies_editor'])
  )
  with check (
    profile_id = (select auth.uid())
    and public.has_org_role(organization_id, array['seeszn_admin', 'kluehspies_editor'])
  );

create policy "comments_delete_own_or_admin"
  on public.comments for delete
  to authenticated
  using (
    profile_id = (select auth.uid())
    or public.has_org_role(organization_id, array['seeszn_admin'])
  );
