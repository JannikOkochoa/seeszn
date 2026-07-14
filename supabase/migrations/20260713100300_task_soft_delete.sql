-- ─── Maßnahmen: Soft Delete ───────────────────────────────────────────────────
-- Löschen ist ab jetzt ausschließlich ein Soft Delete (deleted_at gesetzt);
-- Kommentare, Freigaben und Aktivitätshistorie bleiben vollständig erhalten.
-- Abgrenzung im Produkt:
--   * Freigabe zurückziehen  → approvals.status = 'withdrawn' (bestehend)
--   * Maßnahme abschließen   → tasks.status = 'closed' (bestehend)
--   * Maßnahme löschen       → tasks.deleted_at (neu, dieser Abschnitt)
--
-- Rechtemodell (per Trigger erzwungen, nicht nur UX):
--   * seeszn_admin       löscht jede Maßnahme der eigenen Organisation und
--                        stellt gelöschte wieder her
--   * kluehspies_editor  löscht nur Maßnahmen, die er erstellt hat oder deren
--                        Owner er ist; Rückgängig nur für die eigene Löschung
--   * viewer             niemals (hat ohnehin kein UPDATE-Recht)
--   * Servercode         (service_role, auth.uid() null) bleibt frei

alter table public.tasks
  add column deleted_at timestamptz,
  add column deleted_by uuid references public.profiles (id) on delete set null,
  add column deletion_reason text;

comment on column public.tasks.deleted_at is
  'Soft Delete: gesetzt = aus normalen Listen ausgeblendet. Physisches '
  'Löschen ist für Endnutzer deaktiviert (Policy und Grant entfernt).';

-- Admin-Ansicht "Gelöschte Maßnahmen".
create index tasks_org_deleted_idx
  on public.tasks (organization_id, deleted_at desc)
  where deleted_at is not null;

-- Trigger statt Policy-Umbau: die eingefrorenen UPDATE-Policies bleiben
-- unangetastet, die Löschregeln gelten zusätzlich. Security definer, damit
-- die Rollenprüfung memberships lesen kann (Muster wie has_org_role).
create or replace function public.enforce_task_soft_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
begin
  if new.deleted_at is not distinct from old.deleted_at
    and new.deleted_by is not distinct from old.deleted_by
    and new.deletion_reason is not distinct from old.deletion_reason
  then
    return new;
  end if;

  -- Servercode ohne Endnutzer-Session (service_role) bleibt frei.
  if uid is null then
    return new;
  end if;

  if old.deleted_at is null and new.deleted_at is not null then
    -- Löschen
    if not (
      public.has_org_role(old.organization_id, array['seeszn_admin'])
      or (
        public.has_org_role(old.organization_id, array['kluehspies_editor'])
        and (old.created_by = uid or old.owner_id = uid)
      )
    ) then
      raise exception 'Keine Berechtigung, diese Maßnahme zu löschen.';
    end if;
    if new.deleted_by is distinct from uid then
      raise exception 'deleted_by muss der löschende Nutzer sein.';
    end if;
  elsif old.deleted_at is not null and new.deleted_at is null then
    -- Wiederherstellen: SEESZN Admin oder Rückgängig durch den Löschenden.
    if not (
      public.has_org_role(old.organization_id, array['seeszn_admin'])
      or (
        old.deleted_by = uid
        and public.has_org_role(old.organization_id, array['kluehspies_editor'])
      )
    ) then
      raise exception 'Gelöschte Maßnahmen stellt nur SEESZN wieder her.';
    end if;
    if new.deleted_by is not null or new.deletion_reason is not null then
      raise exception 'Beim Wiederherstellen werden deleted_by und deletion_reason geleert.';
    end if;
  elsif old.deleted_at is not null then
    -- Bestehender Löschvermerk (deleted_by/reason) ist unveränderlich.
    raise exception 'Der Löschvermerk einer Maßnahme ist unveränderlich.';
  else
    -- deleted_at bleibt null: Löschmetadaten ohne Löschung sind unzulässig.
    raise exception 'Löschmetadaten nur zusammen mit einer Löschung setzen.';
  end if;

  return new;
end;
$$;

revoke execute on function public.enforce_task_soft_delete () from public, anon, authenticated;

create trigger tasks_enforce_soft_delete
  before update on public.tasks
  for each row
  execute function public.enforce_task_soft_delete();

-- ── Hard Delete für Endnutzer abschalten ──────────────────────────────────────
-- Es gibt keinen Hard-Delete-Endpoint; auch direkt über die Data API kann
-- niemand mehr physisch löschen. service_role bleibt für Wartung möglich.
drop policy if exists "tasks_delete_admin" on public.tasks;
revoke delete on public.tasks from authenticated;
