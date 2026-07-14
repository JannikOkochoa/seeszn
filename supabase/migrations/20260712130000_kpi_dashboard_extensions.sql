-- ─── KPI-Dashboard: Erweiterung (kpi_targets, task_kpi_links, approvals, ──────
-- ─── annotations, audit_events) ───────────────────────────────────────────────
-- Additive Migration; die eingefrorenen Migrationen 20260712090000/090100/090200
-- bleiben unverändert. Enthält Schema, RLS, GRANTs und Realtime für die fünf
-- neuen Tabellen.
--
-- Organisations-Konsistenz wird deklarativ erzwungen: Eltern-Tabellen erhalten
-- einen zusätzlichen Unique Constraint (id, organization_id), Kind-Tabellen
-- referenzieren per zusammengesetztem Foreign Key. Damit kann eine Zeile nie
-- auf eine KPI-Definition oder einen Task einer anderen Organisation zeigen.

-- Für den Überlappungsschutz der Zielzeiträume (Exclusion Constraint mit uuid).
create extension if not exists btree_gist with schema extensions;

-- Composite-FK-Anker auf den Eltern-Tabellen (additiv, Bestandsdaten erfüllen
-- die Constraints, da id bereits primary key ist).
alter table public.kpi_definitions
  add constraint kpi_definitions_id_org_key unique (id, organization_id);
alter table public.tasks
  add constraint tasks_id_org_key unique (id, organization_id);

-- ── kpi_targets ───────────────────────────────────────────────────────────────
-- Historisierbare Zielwerte pro KPI und Zeitraum. Ab jetzt die einzige Wahrheit
-- für Ziele; kpi_definitions.target_value bleibt nur aus Kompatibilität stehen.
comment on column public.kpi_definitions.target_value is
  'DEPRECATED seit 2026-07-12: Zielwerte leben in kpi_targets (historisierbar). '
  'Nur noch lesend für Altbestand; neuer Code verwendet ausschließlich kpi_targets.';

create table public.kpi_targets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  kpi_definition_id uuid not null,
  target_value numeric not null,
  start_date date not null,
  end_date date,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date),
  foreign key (kpi_definition_id, organization_id)
    references public.kpi_definitions (id, organization_id) on delete cascade,
  -- Keine überlappenden Zielzeiträume je KPI; end_date null = offenes Ende.
  constraint kpi_targets_no_overlap exclude using gist (
    kpi_definition_id with =,
    daterange(start_date, end_date, '[]') with &&
  )
);

create index kpi_targets_org_idx on public.kpi_targets (organization_id);

create trigger kpi_targets_set_updated_at
  before update on public.kpi_targets
  for each row
  execute function public.set_updated_at();

-- ── task_kpi_links ────────────────────────────────────────────────────────────
-- n:m zwischen Tasks und KPIs. tasks.kpi_definition_id bleibt vorerst bestehen,
-- neuer Code bevorzugt diese Tabelle.
comment on column public.tasks.kpi_definition_id is
  'DEPRECATED seit 2026-07-12: KPI-Verknüpfungen leben in task_kpi_links (n:m). '
  'Bleibt vorerst aus Kompatibilität; neuer Code verwendet task_kpi_links.';

create table public.task_kpi_links (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  task_id uuid not null,
  kpi_definition_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (task_id, kpi_definition_id),
  foreign key (task_id, organization_id)
    references public.tasks (id, organization_id) on delete cascade,
  foreign key (kpi_definition_id, organization_id)
    references public.kpi_definitions (id, organization_id) on delete cascade
);

create index task_kpi_links_kpi_idx on public.task_kpi_links (kpi_definition_id);
create index task_kpi_links_org_idx on public.task_kpi_links (organization_id);

-- ── approvals ─────────────────────────────────────────────────────────────────
-- Eine Zeile pro Freigaberunde. Entschiedene Runden sind unveränderlich
-- (Trigger unten); eine neue Runde ist immer eine neue Zeile. Pro Task ist
-- höchstens eine Runde gleichzeitig offen.
create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  task_id uuid not null,
  requested_by uuid references public.profiles (id) on delete set null,
  decided_by uuid references public.profiles (id) on delete set null,
  status text not null default 'requested' check (
    status in ('requested', 'approved', 'changes_requested', 'withdrawn')
  ),
  note text,
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (task_id, organization_id)
    references public.tasks (id, organization_id) on delete cascade
);

create index approvals_task_idx on public.approvals (task_id, requested_at desc);
create index approvals_org_idx on public.approvals (organization_id);
create unique index approvals_one_open_per_task
  on public.approvals (task_id)
  where status = 'requested';

create trigger approvals_set_updated_at
  before update on public.approvals
  for each row
  execute function public.set_updated_at();

-- Entscheidungshistorie schützen: Sobald eine Runde entschieden ist
-- (approved / changes_requested / withdrawn), ist die Zeile unveränderlich.
-- Zusätzlich sind die Identitätsfelder einer offenen Runde (task_id,
-- requested_by, requested_at, created_at) nicht nachträglich manipulierbar;
-- editierbar bleiben nur status, note, decided_by und decided_at.
create or replace function public.protect_decided_approvals()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status <> 'requested' then
    raise exception
      'Entschiedene Freigaberunden sind unveränderlich. Neue Runde als neue Zeile anlegen.';
  end if;
  if new.task_id is distinct from old.task_id
    or new.requested_by is distinct from old.requested_by
    or new.requested_at is distinct from old.requested_at
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Identitätsfelder einer Freigaberunde sind unveränderlich.';
  end if;
  return new;
end;
$$;

create trigger approvals_protect_history
  before update on public.approvals
  for each row
  execute function public.protect_decided_approvals();

-- ── annotations ───────────────────────────────────────────────────────────────
-- Ereignis-Markierungen auf der KPI-Zeitachse (z. B. "Relaunch Produktseiten").
create table public.annotations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  kpi_definition_id uuid not null,
  date date not null,
  title text not null,
  description text,
  linked_task_id uuid,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (kpi_definition_id, organization_id)
    references public.kpi_definitions (id, organization_id) on delete cascade,
  -- Beim Löschen des Tasks nur die Verknüpfung lösen, nie organization_id.
  foreign key (linked_task_id, organization_id)
    references public.tasks (id, organization_id) on delete set null (linked_task_id)
);

create index annotations_kpi_date_idx on public.annotations (kpi_definition_id, date);
create index annotations_org_idx on public.annotations (organization_id);

create trigger annotations_set_updated_at
  before update on public.annotations
  for each row
  execute function public.set_updated_at();

-- ── audit_events ──────────────────────────────────────────────────────────────
-- Append-only-Protokoll. Schreiben ausschließlich über Servercode
-- (service_role); normale Nutzer können weder einfügen noch ändern noch
-- löschen (keine Policies, keine Grants). Keine Secrets in metadata.
create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_events_org_created_idx
  on public.audit_events (organization_id, created_at desc);

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.kpi_targets enable row level security;
alter table public.task_kpi_links enable row level security;
alter table public.approvals enable row level security;
alter table public.annotations enable row level security;
alter table public.audit_events enable row level security;

-- kpi_targets: Ziele liest jedes Mitglied, schreiben darf nur seeszn_admin
-- (Editor liest laut Rollenmodell nur).
create policy "kpi_targets_select_member"
  on public.kpi_targets for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "kpi_targets_write_admin"
  on public.kpi_targets for all
  to authenticated
  using (public.has_org_role(organization_id, array['seeszn_admin']))
  with check (public.has_org_role(organization_id, array['seeszn_admin']));

-- task_kpi_links: Admin und Editor verknüpfen/lösen, alle Mitglieder lesen.
-- Kein UPDATE: eine Verknüpfung wird gelöscht und neu angelegt.
create policy "task_kpi_links_select_member"
  on public.task_kpi_links for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "task_kpi_links_insert_admin_or_editor"
  on public.task_kpi_links for insert
  to authenticated
  with check (public.has_org_role(organization_id, array['seeszn_admin', 'kluehspies_editor']));

create policy "task_kpi_links_delete_admin_or_editor"
  on public.task_kpi_links for delete
  to authenticated
  using (public.has_org_role(organization_id, array['seeszn_admin', 'kluehspies_editor']));

-- approvals: Admin und Editor fordern an und entscheiden; Viewer liest nur.
-- Kein DELETE für Endnutzer: die Historie bleibt vollständig.
create policy "approvals_select_member"
  on public.approvals for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "approvals_insert_admin_or_editor"
  on public.approvals for insert
  to authenticated
  with check (
    public.has_org_role(organization_id, array['seeszn_admin', 'kluehspies_editor'])
    and requested_by = (select auth.uid())
    and status = 'requested'
  );

create policy "approvals_update_admin_or_editor"
  on public.approvals for update
  to authenticated
  using (
    public.has_org_role(organization_id, array['seeszn_admin', 'kluehspies_editor'])
    and status = 'requested'
  )
  with check (
    public.has_org_role(organization_id, array['seeszn_admin', 'kluehspies_editor'])
    and (status = 'requested' or decided_by = (select auth.uid()))
  );

-- annotations: Admin und Editor erstellen/bearbeiten, löschen nur Admin.
create policy "annotations_select_member"
  on public.annotations for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "annotations_insert_admin_or_editor"
  on public.annotations for insert
  to authenticated
  with check (
    public.has_org_role(organization_id, array['seeszn_admin', 'kluehspies_editor'])
    and created_by = (select auth.uid())
  );

create policy "annotations_update_admin_or_editor"
  on public.annotations for update
  to authenticated
  using (public.has_org_role(organization_id, array['seeszn_admin', 'kluehspies_editor']))
  with check (public.has_org_role(organization_id, array['seeszn_admin', 'kluehspies_editor']));

create policy "annotations_delete_admin"
  on public.annotations for delete
  to authenticated
  using (public.has_org_role(organization_id, array['seeszn_admin']));

-- audit_events: nur lesen, für alle Mitglieder der Organisation.
-- Bewusst keine Insert-/Update-/Delete-Policies: schreiben kann nur
-- service_role (Servercode), und der umgeht RLS ohnehin.
create policy "audit_events_select_member"
  on public.audit_events for select
  to authenticated
  using (public.is_org_member(organization_id));

-- ── GRANTs ────────────────────────────────────────────────────────────────────
-- anon: nichts. authenticated: exakt die Fläche der Policies.
grant select, insert, update, delete on
  public.kpi_targets,
  public.task_kpi_links,
  public.approvals,
  public.annotations,
  public.audit_events
to service_role;

grant select on
  public.kpi_targets,
  public.task_kpi_links,
  public.approvals,
  public.annotations,
  public.audit_events
to authenticated;

grant insert, update, delete on public.kpi_targets to authenticated;
grant insert, delete on public.task_kpi_links to authenticated;
grant insert, update on public.approvals to authenticated;
grant insert, update, delete on public.annotations to authenticated;
-- audit_events: kein Schreib-Grant für authenticated (append-only via Server).

-- ── Realtime ──────────────────────────────────────────────────────────────────
-- approvals und annotations sind kollaborativ und gehören live in den Room.
-- audit_events (reines Protokoll, on demand gelesen) sowie kpi_targets und
-- task_kpi_links (kein Live-Bedarf im Frontend) bleiben bewusst draußen und
-- können bei Bedarf additiv ergänzt werden.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table
      public.approvals,
      public.annotations;
  end if;
end;
$$;
