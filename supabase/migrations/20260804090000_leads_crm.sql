-- ─── Leads: CRM-Erweiterung ───────────────────────────────────────────────────
-- public.leads war bisher reine Eingangsablage: ein Lead kam an, wurde
-- gespeichert, und danach passierte in der Datenbank nichts mehr. Das interne
-- CRM unter /admin/leads braucht darüber hinaus einen Bearbeitungszustand —
-- wer ist neu, wer ist kontaktiert, wer ist kein Fit, wann ist der nächste
-- Follow-up fällig.
--
-- Additive Migration. Keine Spalte wird entfernt, keine Zeile gelöscht, keine
-- personenbezogenen Daten verändert. Der einzige Schreibvorgang auf Bestand ist
-- die Umbenennung des Eingangsstatus 'received' → 'new'; sie läuft mit
-- deaktiviertem updated_at-Trigger, damit die Historie der Bestandszeilen
-- unangetastet bleibt.
--
-- Die Versandfelder (email_delivery_status, user_email_status, email_error)
-- bleiben unverändert und sind im CRM sichtbar: 'failed' heißt weiterhin, dass
-- der Lead da ist, aber niemand benachrichtigt wurde.
--
-- Zugriff bleibt wie gehabt: RLS ist aktiv, es gibt weiterhin keine Policy für
-- anon oder authenticated (Default Deny). Diese Migration legt bewusst KEINE
-- Browser-Lesepolicy an. Das CRM liest ausschließlich serverseitig mit dem
-- Secret Key, nachdem die Rolle seeszn_admin geprüft wurde.

-- ── 1) Statusmodell erweitern ─────────────────────────────────────────────────
-- Aus zwei Eingangswerten wird ein Bearbeitungszyklus. 'spam_suspected' bleibt
-- erhalten: der Honeypot-Pfad in /api/contact schreibt ihn weiterhin.

alter table public.leads alter column status drop default;

alter table public.leads drop constraint if exists leads_status_check;

-- Bestandszeilen übernehmen: 'received' war der Eingangszustand, das ist jetzt
-- 'new'. Der Trigger würde sonst updated_at aller Bestands-Leads auf den
-- Migrationszeitpunkt ziehen und damit echte Bearbeitungsspuren vortäuschen.
alter table public.leads disable trigger leads_set_updated_at;

update public.leads set status = 'new' where status = 'received';

alter table public.leads enable trigger leads_set_updated_at;

alter table public.leads
  add constraint leads_status_check
  check (status in ('new', 'contacted', 'qualified', 'not_a_fit', 'closed', 'spam_suspected'));

alter table public.leads alter column status set default 'new';

-- ── 2) CRM-Felder ─────────────────────────────────────────────────────────────
-- Bewusst schmal gehalten. Scores, Fanout und Signale werden NICHT als Spalten
-- dupliziert; sie stehen vollständig in scan_result (jsonb) und werden von der
-- Detailansicht von dort gelesen. Als Spalte kommt nur, was gefiltert,
-- sortiert oder exportiert werden muss.

alter table public.leads add column priority text
  check (priority in ('high', 'medium', 'low'));

alter table public.leads add column internal_notes text;

alter table public.leads add column last_contacted_at timestamptz;

alter table public.leads add column next_follow_up_at timestamptz;

comment on column public.leads.status is
  'Bearbeitungszustand im internen CRM: new | contacted | qualified | not_a_fit '
  '| closed | spam_suspected. ''new'' ist der Eingangszustand (früher '
  '''received''), ''spam_suspected'' setzt der Honeypot-Pfad in /api/contact.';
comment on column public.leads.priority is
  'Manuelle Priorisierung im CRM: high | medium | low. Null = nicht bewertet.';
comment on column public.leads.internal_notes is
  'Interne Notizen, ausschließlich für SEESZN. Wird chronologisch angehängt und '
  'nie an den Lead kommuniziert.';
comment on column public.leads.last_contacted_at is
  'Zeitpunkt der letzten manuellen Kontaktaufnahme, gesetzt über "Als kontaktiert '
  'markieren". Nicht zu verwechseln mit dem automatischen Mailversand.';
comment on column public.leads.next_follow_up_at is
  'Geplanter nächster Follow-up. Treibt die Wiedervorlage im CRM.';

-- ── 3) Indizes für die CRM-Ansichten ──────────────────────────────────────────
-- Die Liste filtert auf Status und sortiert absteigend nach Eingang; der
-- vorhandene leads_created_at_idx deckt die Sortierung bereits ab.
create index leads_status_created_at_idx on public.leads (status, created_at desc);

-- Offene Wiedervorlagen: der einzige Blick, der nach vorn statt zurück geht.
create index leads_next_follow_up_idx on public.leads (next_follow_up_at)
  where next_follow_up_at is not null;

-- ── 4) Rechte ─────────────────────────────────────────────────────────────────
-- Unverändert: service_role hat bereits select, insert, update (Migration
-- 20260803090000) und delete (20260803091000). anon und authenticated bekommen
-- weiterhin nichts. Hier steht bewusst kein grant und kein create policy.
