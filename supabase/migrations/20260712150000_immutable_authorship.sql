-- ─── KPI-Dashboard: Unveränderliche Urheberschaft ─────────────────────────────
-- Additive Härtung: Ersteller- und Autorenfelder sind nach dem INSERT nicht
-- mehr umschreibbar – für alle Rollen inklusive Multi-Org-Nutzern und
-- service_role (Trigger feuern unabhängig von RLS und Rolle).
--
-- Erlaubt bleibt ausschließlich der Übergang auf NULL: Die Creator-FKs stehen
-- auf "on delete set null", beim Löschen eines Profils führt Postgres intern
-- ein UPDATE auf NULL aus. Ohne diese Ausnahme wäre keine Nutzerlöschung mehr
-- möglich. Ein NULL-Feld kann danach nicht neu beansprucht werden.
--
-- Geschützte Felder:
--   tasks.created_by, comments.profile_id, annotations.created_by,
--   kpi_targets.created_by, audit_events.actor_id
--
-- Bewusst nicht geschützt:
--   tasks.owner_id, kpi_definitions.owner_id  – Verantwortliche/Zuweisung,
--     fachlich änderbar
--   approvals.requested_by                    – bereits durch
--     protect_decided_approvals unveränderlich (offene wie entschiedene Runden)
--   approvals.decided_by                      – wird genau einmal bei der
--     Entscheidung gesetzt; entschiedene Runden sind komplett unveränderlich
--   memberships.user_id                       – administrativ, äquivalent zu
--     delete + insert durch den Org-Admin

create or replace function public.prevent_author_change()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  col text;
  old_j jsonb := to_jsonb(old);
  new_j jsonb := to_jsonb(new);
begin
  foreach col in array tg_argv loop
    -- Tippfehler in Trigger-Argumenten dürfen nicht stumm durchrutschen.
    if not (old_j ? col) then
      raise exception 'prevent_author_change: Spalte % existiert nicht auf %', col, tg_table_name;
    end if;
    if new_j -> col is distinct from old_j -> col
      and new_j -> col <> 'null'::jsonb
    then
      raise exception '%.% darf nach dem Anlegen nicht geändert werden.', tg_table_name, col;
    end if;
  end loop;
  return new;
end;
$$;

revoke execute on function public.prevent_author_change () from public, anon, authenticated;

create trigger tasks_lock_author
  before update on public.tasks
  for each row
  execute function public.prevent_author_change('created_by');

create trigger comments_lock_author
  before update on public.comments
  for each row
  execute function public.prevent_author_change('profile_id');

create trigger annotations_lock_author
  before update on public.annotations
  for each row
  execute function public.prevent_author_change('created_by');

create trigger kpi_targets_lock_author
  before update on public.kpi_targets
  for each row
  execute function public.prevent_author_change('created_by');

create trigger audit_events_lock_author
  before update on public.audit_events
  for each row
  execute function public.prevent_author_change('actor_id');
