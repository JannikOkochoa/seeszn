-- ─── Kollaborative KPIs: kpi_definitions erweitern + Rechte öffnen ────────────
-- Additive Migration. Jedes aktive Organisationsmitglied darf eigene (manuelle)
-- KPIs anlegen und Ziele/Check-ins zu KPIs erfassen, deren Ersteller oder Owner
-- es ist; SEESZN Admin darf alles. Es entsteht KEINE zweite KPI-Wahrheit:
-- System-KPIs (feste fachliche Definitionen, Einheit/Richtung aus der
-- Frontend-Spezifikation) und custom_manual-KPIs teilen sich kpi_definitions;
-- Ziele bleiben in kpi_targets, Ist-Werte manueller KPIs in kpi_manual_check_ins.
-- Keine bereits angewendete Migration wird verändert.

-- ── 1 · kpi_definitions additiv erweitern ─────────────────────────────────────
alter table public.kpi_definitions
  add column if not exists created_by uuid references public.profiles (id) on delete set null,
  add column if not exists kind text not null default 'system'
    check (kind in ('system', 'custom_manual')),
  add column if not exists unit text,
  add column if not exists direction text
    check (direction is null or direction in ('higher_is_better', 'lower_is_better')),
  add column if not exists description text,
  add column if not exists archived_at timestamptz;

-- Bestandsdefinitionen sind System-KPIs; ihre Einheit/Richtung liefert die
-- Frontend-Spezifikation KPI_SPECS. Nur nutzererstellte KPIs sind custom_manual
-- und tragen Einheit/Richtung/Beschreibung direkt auf der Zeile (default 'system'
-- deckt den Bestand ab). custom_manual-KPIs brauchen Einheit und Richtung.
alter table public.kpi_definitions
  drop constraint if exists kpi_definitions_custom_shape;
alter table public.kpi_definitions
  add constraint kpi_definitions_custom_shape check (
    kind = 'system'
    or (kind = 'custom_manual' and unit is not null and direction is not null)
  );

-- created_by ist nach dem Anlegen unveränderlich (Übergang auf null erlaubt,
-- damit Profillöschungen greifen). organization_id ist bereits über
-- kpi_definitions_lock_org (20260712130100) geschützt.
create trigger kpi_definitions_lock_author
  before update on public.kpi_definitions
  for each row
  execute function public.prevent_author_change('created_by');

-- ── 2 · RLS: Mitglieder erstellen custom KPIs; Ersteller/Owner/Admin schreiben ─
-- Bestehende Policies (kpi_definitions_write_admin, kpi_targets_write_admin,
-- kpi_manual_check_ins_insert_admin) bleiben; die folgenden erweitern additiv
-- (Policies sind permissiv / OR-verknüpft).

-- kpi_definitions: jedes Mitglied darf einen eigenen custom_manual-KPI anlegen.
create policy "kpi_definitions_insert_member_custom"
  on public.kpi_definitions for insert
  to authenticated
  with check (
    public.is_org_member(organization_id)
    and created_by = (select auth.uid())
    and kind = 'custom_manual'
  );

-- kpi_definitions: Ersteller oder Owner darf bearbeiten/archivieren.
create policy "kpi_definitions_update_creator_owner"
  on public.kpi_definitions for update
  to authenticated
  using (
    public.is_org_member(organization_id)
    and (created_by = (select auth.uid()) or owner_id = (select auth.uid()))
  )
  with check (
    public.is_org_member(organization_id)
    and (created_by = (select auth.uid()) or owner_id = (select auth.uid()))
  );

-- kpi_targets: jedes Mitglied darf eine Zielversion anlegen (created_by = self).
create policy "kpi_targets_insert_member"
  on public.kpi_targets for insert
  to authenticated
  with check (
    public.is_org_member(organization_id)
    and created_by = (select auth.uid())
  );

-- kpi_targets: Ersteller des Ziels oder Ersteller/Owner des KPI darf
-- superseden/archivieren.
create policy "kpi_targets_update_creator_owner"
  on public.kpi_targets for update
  to authenticated
  using (
    public.is_org_member(organization_id)
    and (
      created_by = (select auth.uid())
      or exists (
        select 1 from public.kpi_definitions d
        where d.id = kpi_targets.kpi_definition_id
          and d.organization_id = kpi_targets.organization_id
          and (d.created_by = (select auth.uid()) or d.owner_id = (select auth.uid()))
      )
    )
  )
  with check (
    public.is_org_member(organization_id)
    and (
      created_by = (select auth.uid())
      or exists (
        select 1 from public.kpi_definitions d
        where d.id = kpi_targets.kpi_definition_id
          and d.organization_id = kpi_targets.organization_id
          and (d.created_by = (select auth.uid()) or d.owner_id = (select auth.uid()))
      )
    )
  );

-- kpi_manual_check_ins: Ersteller/Owner des KPI darf Check-ins erfassen.
create policy "kpi_manual_check_ins_insert_creator_owner"
  on public.kpi_manual_check_ins for insert
  to authenticated
  with check (
    public.is_org_member(organization_id)
    and entered_by = (select auth.uid())
    and exists (
      select 1 from public.kpi_definitions d
      where d.id = kpi_manual_check_ins.kpi_definition_id
        and d.organization_id = kpi_manual_check_ins.organization_id
        and (d.created_by = (select auth.uid()) or d.owner_id = (select auth.uid()))
    )
  );
