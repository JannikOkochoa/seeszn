-- ─── Sync-Lock je Datenquelle statt je Organisation ──────────────────────────
-- claim_gsc_sync_run() sperrte bisher pro Organisation. Solange die Search
-- Console die einzige Quelle war, war das gleichbedeutend. Seit GA4 in
-- dieselbe sync_runs-Tabelle schreibt, ist es zu grob: Ein laufender
-- GA4-Sync hätte einen GSC-Sync abgewiesen, obwohl die beiden nichts
-- miteinander zu tun haben.
--
-- Die Sperre greift jetzt je data_source_id — dieselbe Semantik wie in
-- claim_sync_run(). Signatur und Rückgabewert bleiben unverändert, der
-- Anwendungscode braucht keine Anpassung.
--
-- In der Praxis wäre es kaum aufgefallen (GA4 läuft 04:30, GSC 06:00, ein Lauf
-- dauert Sekunden). Genau solche stillen Kopplungen sind aber der Grund,
-- warum ein Ausfall der einen Quelle die andere mitreißt.

create or replace function public.claim_gsc_sync_run(
  p_organization_id uuid,
  p_data_source_id uuid,
  p_trigger_source text,
  p_dispatch_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_run_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext('sync:' || p_data_source_id::text));

  update public.sync_runs
  set status = 'error',
      completed_at = now(),
      error_message = 'Lauf ohne Abschluss beendet (Zeitüberschreitung).'
  where data_source_id = p_data_source_id
    and status = 'running'
    and started_at <= now() - interval '15 minutes';

  if exists (
    select 1 from public.sync_runs
    where data_source_id = p_data_source_id and status = 'running'
  ) then
    return null;
  end if;

  insert into public.sync_runs (
    organization_id, data_source_id, status, trigger_source, dispatch_id
  )
  values (
    p_organization_id, p_data_source_id, 'running', p_trigger_source, p_dispatch_id
  )
  returning id into v_run_id;

  return v_run_id;
end;
$$;

revoke all on function public.claim_gsc_sync_run(uuid, uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.claim_gsc_sync_run(uuid, uuid, text, uuid) to service_role;
