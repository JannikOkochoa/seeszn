-- ─── First Move: Brücke zwischen Scan und Anfrage ─────────────────────────────
-- Der öffentliche Scan gibt an den Browser nur die redigierte Sicht. Die
-- vollständige Auswertung (Kandidat, betroffene URLs, Scope, Messhypothese,
-- alle Beobachtungen) entstand dabei bereits und wäre ohne Ablage verloren,
-- sobald der Request endet. Schickt der Besucher danach eine Anfrage, müsste
-- SEESZN bei null anfangen.
--
-- Vorher lag das in einem Prozessspeicher. Das hielt weder einen Neustart noch
-- eine zweite Instanz noch eine zweite Serverless-Invocation aus. Diese Tabelle
-- ist die kleinste haltbare Form davon.
--
-- Was sie NICHT ist:
--   - kein öffentliches Teilen von Ergebnissen. Es gibt keine Route, die diese
--     Zeilen nach ID ausliefert.
--   - kein Analytics-Speicher.
--   - keine Move Library.
--
-- Inhalt: ausschließlich öffentlich abrufbare Beobachtungen zu einer Domain.
-- Keine Zugangsdaten, keine Tokens, keine Rohseiten, keine personenbezogenen
-- Daten. Die Lebensdauer liegt bei 6 Stunden und damit weit unter der für
-- Scan-Daten zulässigen Obergrenze von 30 Tagen.
--
-- Additive Migration: keine bestehende Tabelle wird angefasst.

create table public.first_move_scan_context (
  -- Hoch entropische ID, in lib/first-move/scanStore.ts per randomUUID erzeugt.
  -- Sie ist zugleich die id des öffentlichen Findings, ist aber nicht erratbar
  -- und wird von keiner Leseroute akzeptiert.
  id text primary key,

  created_at timestamptz not null default now(),
  -- Logische Verfallszeit. Ein Lesen nach diesem Zeitpunkt gilt als "nicht
  -- vorhanden", auch wenn die Zeile physisch noch existiert.
  expires_at timestamptz not null,

  domain text not null,
  url text not null,
  route text not null,

  -- Genau das, was der Browser bekommen hat. Für den Abgleich im Nachhinein.
  public_finding jsonb not null,
  -- Die vollständige interne Auswertung. Verlässt den Server nur in die
  -- interne Benachrichtigung, nie in eine Kundenmail und nie in den Browser.
  internal_finding jsonb not null
);

comment on table public.first_move_scan_context is
  'Kurzlebige Brücke zwischen öffentlichem First-Move-Scan und späterer Anfrage. '
  'Nur Servercode, 6 Stunden Lebensdauer, keine öffentliche Leseroute.';
comment on column public.first_move_scan_context.internal_finding is
  'Vollständige interne Auswertung. Niemals an Browser oder Kunden ausliefern.';

-- Aufräumen und Verfallsprüfung laufen über diesen Index.
create index first_move_scan_context_expires_at_idx
  on public.first_move_scan_context (expires_at);

alter table public.first_move_scan_context enable row level security;

-- Keine Policies für anon/authenticated: Default Deny. Nur service_role
-- (Secret Key, ausschließlich Servercode) umgeht RLS und darf schreiben,
-- lesen und aufräumen.
grant select, insert, delete on public.first_move_scan_context to service_role;
