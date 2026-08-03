-- ─── Leads: Source of Truth für eingehende Anfragen ───────────────────────────
-- Bis hierher existierte ein Lead nur als E-Mail. Fiel der Mail-Provider aus
-- (oder fehlte RESEND_API_KEY in Production), war die Anfrage unwiederbringlich
-- verloren. Diese Tabelle ist ab jetzt die Source of Truth: erst speichern,
-- dann versenden, danach den Versandstatus nachtragen.
--
-- Additive Migration: keine bestehende Tabelle wird angefasst, keine Daten
-- verändert oder gelöscht.
--
-- Zugriff: ausschließlich Servercode mit dem Secret Key (service_role).
-- anon und authenticated bekommen weder Grants noch Policies — RLS ist aktiv
-- und ohne Policy gilt Default Deny. Leads enthalten personenbezogene Daten
-- und dürfen nie über den Browser-Client erreichbar sein.

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Kontakt
  email text not null,
  email_domain text,
  name text,
  message text,

  -- Kontext der Anfrage
  company_domain text,
  source text not null,
  page text,
  locale text,

  -- Verarbeitung
  status text not null default 'received'
    check (status in ('received', 'spam_suspected')),

  -- Versandstatus der internen Lead-Benachrichtigung. Diese Mail entscheidet,
  -- ob die Anfrage im Postfach ankommt; 'failed' heißt: Lead liegt hier und
  -- muss manuell nachgefasst werden.
  email_delivery_status text not null default 'pending'
    check (email_delivery_status in ('pending', 'sent', 'failed', 'skipped')),

  -- Versandstatus der automatischen Auswertungs-Mail an den Nutzer.
  user_email_status text not null default 'pending'
    check (user_email_status in ('pending', 'sent', 'failed', 'skipped')),

  -- Letzte Fehlermeldung des Mail-Providers, gekürzt. Nur Provider-Text,
  -- keine personenbezogenen Daten.
  email_error text,

  -- Sanitisiertes Scan-Ergebnis, damit die Auswertung auch dann noch
  -- rekonstruierbar ist, wenn keine Mail rausging.
  scan_result jsonb
);

comment on table public.leads is
  'Eingehende Anfragen aus den öffentlichen Formularen (Sichtbarkeitsprüfung, '
  'KI-Sichtbarkeits-Brief). Wird vor jedem Mailversand geschrieben und ist die '
  'Source of Truth für Leads.';
comment on column public.leads.source is
  'Formular-Herkunft, z. B. ''diagnosis_result'' oder ''brief_ki_sichtbarkeit''.';
comment on column public.leads.company_domain is
  'Geprüfte Domain aus dem Scan-Ergebnis, sofern vorhanden.';
comment on column public.leads.email_delivery_status is
  'Versand der internen Lead-Benachrichtigung: pending | sent | failed | skipped. '
  '''failed'' bedeutet: Lead ist gespeichert, aber niemand wurde benachrichtigt.';
comment on column public.leads.user_email_status is
  'Versand der automatischen Auswertungs-Mail an den Nutzer.';

-- Neueste Leads zuerst; der übliche Blick ins Postfach-Backlog.
create index leads_created_at_idx on public.leads (created_at desc);

-- Offene Fälle: gespeichert, aber nicht benachrichtigt.
create index leads_undelivered_idx on public.leads (created_at desc)
  where email_delivery_status <> 'sent';

create trigger leads_set_updated_at
  before update on public.leads
  for each row
  execute function public.set_updated_at();

alter table public.leads enable row level security;

-- Keine Policies für anon/authenticated: Default Deny. service_role umgeht RLS.
grant select, insert, update on public.leads to service_role;
