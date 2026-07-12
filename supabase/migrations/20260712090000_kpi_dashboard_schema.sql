-- ─── KPI-Dashboard: Schema ────────────────────────────────────────────────────
-- Vertikale Scheibe für den KPI "Organische Klicks auf Produktseiten".
-- Alle Tabellen sind organisationsbezogen; Zugriff wird über memberships und
-- RLS geregelt (siehe 20260712090100_kpi_dashboard_rls.sql). Grants folgen in
-- 20260712090200_kpi_dashboard_grants.sql, da neue Tabellen im Projekt nicht
-- automatisch über die Data API exponiert werden.

-- Organisationen (Mandanten). Anlage erfolgt ausschließlich über Servercode
-- oder Migrationen, nie durch Endnutzer.
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- Profile spiegeln auth.users in den public-Namespace; werden per Trigger
-- automatisch beim Signup angelegt.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('seeszn_admin', 'kluehspies_editor', 'viewer')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index memberships_user_id_idx on public.memberships (user_id);

create table public.data_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  provider text not null,
  status text not null default 'idle' check (status in ('idle', 'syncing', 'error')),
  last_successful_sync_at timestamptz,
  data_available_until date,
  last_error text,
  created_at timestamptz not null default now(),
  unique (organization_id, provider)
);

create table public.sync_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  data_source_id uuid not null references public.data_sources (id) on delete cascade,
  status text not null default 'running' check (status in ('running', 'success', 'error')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  records_processed integer,
  error_message text
);

create index sync_runs_data_source_started_idx
  on public.sync_runs (data_source_id, started_at desc);

-- KPI-Definitionen enthalten bewusst keinen current_value: Der aktuelle Wert
-- ist immer der neueste Eintrag in kpi_snapshots.
create table public.kpi_definitions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  metric_key text not null,
  target_value numeric,
  owner_id uuid references public.profiles (id) on delete set null,
  data_source_id uuid references public.data_sources (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (organization_id, metric_key)
);

create table public.kpi_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  kpi_definition_id uuid not null references public.kpi_definitions (id) on delete cascade,
  date date not null,
  value numeric not null,
  created_at timestamptz not null default now(),
  unique (kpi_definition_id, date)
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  url text not null,
  segment text,
  unique (organization_id, url)
);

-- GSC-Rohdaten. Die Dimensionsspalten sind not null mit leerem Default, damit
-- der Unique Constraint Duplikate zuverlässig verhindert (NULL wäre in Unique
-- Constraints nicht gleich NULL).
create table public.gsc_daily_metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  data_source_id uuid not null references public.data_sources (id) on delete cascade,
  date date not null,
  page_id uuid not null references public.pages (id) on delete cascade,
  query text not null default '',
  device text not null default '',
  country text not null default '',
  clicks numeric not null default 0,
  impressions numeric not null default 0,
  ctr numeric,
  position numeric,
  created_at timestamptz not null default now(),
  unique (data_source_id, date, page_id, query, device, country)
);

create index gsc_daily_metrics_org_date_idx
  on public.gsc_daily_metrics (organization_id, date);
create index gsc_daily_metrics_page_date_idx
  on public.gsc_daily_metrics (page_id, date);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  kpi_definition_id uuid references public.kpi_definitions (id) on delete set null,
  page_id uuid references public.pages (id) on delete set null,
  title text not null,
  description text,
  insight_context jsonb,
  owner_id uuid references public.profiles (id) on delete set null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'open' check (
    status in ('open', 'in_progress', 'waiting_for_approval', 'live', 'measuring', 'closed')
  ),
  due_date date,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_org_status_idx on public.tasks (organization_id, status);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  task_id uuid not null references public.tasks (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index comments_task_id_idx on public.comments (task_id);

-- updated_at automatisch pflegen.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();

-- Profil beim Signup automatisch anlegen.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', null))
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Realtime für kollaborative Tabellen und Sync-Status. postgres_changes
-- respektiert RLS, daher sehen Clients nur Zeilen ihrer Organisation.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table
      public.tasks,
      public.comments,
      public.data_sources,
      public.sync_runs,
      public.kpi_snapshots;
  end if;
end;
$$;
