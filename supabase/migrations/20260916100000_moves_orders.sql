-- ─── MOVES: Bestellungen und Briefings ────────────────────────────────────────
-- Die kommerzielle Schicht braucht eine eigene Source of Truth. Ein Kauf darf
-- nicht nur in Stripe existieren: das Briefing nach dem Kauf, der Status der
-- Umsetzung und die Zuordnung zur Fläche leben hier.
--
-- Reihenfolge im Kaufweg:
--   1) Bestellung mit status 'initiated' anlegen, bevor Stripe aufgerufen wird
--   2) Stripe-Checkout
--   3) Webhook setzt 'paid' und trägt die Stripe-Kennungen nach
--   4) Briefing setzt 'briefed' und legt die Angaben in brief ab
--
-- Additive Migration. Keine bestehende Tabelle wird angefasst.
--
-- Zugriff: ausschließlich Servercode mit dem Secret Key (service_role). anon und
-- authenticated bekommen weder Grants noch Policies, RLS ist aktiv und ohne
-- Policy gilt Default Deny. Die Tabelle enthält Kontaktdaten und darf nie über
-- den Browser-Client erreichbar sein.

create table public.move_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Eigene Referenz, die in Stripe als client_reference_id mitläuft. Sie steht
  -- auch in der Bestätigungsmail und ist die Kennung, die der Kunde nennt.
  order_ref text not null unique,

  -- Produkt. sku ist der Schlüssel aus lib/moves/catalog.ts.
  sku text not null,
  category text not null check (category in ('authority', 'press', 'mentions', 'content')),
  mode text not null check (mode in ('one', 'momentum', 'system')),
  billing text not null check (billing in ('once', 'monthly')),
  -- Listenpreis netto in Euro zum Zeitpunkt des Kaufs. Ändert sich der Katalog,
  -- bleibt hier stehen, was tatsächlich galt.
  price_eur integer,

  status text not null default 'initiated'
    check (status in ('initiated', 'paid', 'briefed', 'cancelled', 'failed')),

  -- Stripe-Kennungen. Erst nach dem Webhook vollständig.
  stripe_session_id text,
  stripe_payment_intent text,
  stripe_subscription_id text,
  stripe_customer_id text,
  -- Tatsächlich abgerechneter Betrag in der kleinsten Währungseinheit.
  amount_total_cents integer,
  currency text,

  -- Kontakt. Kommt aus Stripe, nicht aus einem eigenen Formular vor dem Kauf.
  email text,
  email_domain text,
  locale text not null default 'de',

  -- Das kurze Briefing nach der Zahlung: Domain, Ziel-URL, Markt, Sprache,
  -- Thema, Hinweise. Als jsonb, weil die Felder je Fläche leicht abweichen.
  brief jsonb,
  brief_submitted_at timestamptz
);

comment on table public.move_orders is
  'Bestellungen der MOVES-Fläche: Kauf über Stripe und das Briefing danach. '
  'Source of Truth für die Umsetzung, unabhängig von Stripe.';
comment on column public.move_orders.order_ref is
  'Eigene Referenz, läuft als client_reference_id in Stripe mit.';
comment on column public.move_orders.price_eur is
  'Listenpreis netto in Euro zum Kaufzeitpunkt, damit spätere Katalogänderungen '
  'die Historie nicht verfälschen.';
comment on column public.move_orders.brief is
  'Briefing nach der Zahlung: domain, targetUrl, market, language, topic, notes.';

create index move_orders_created_at_idx on public.move_orders (created_at desc);
create index move_orders_status_idx on public.move_orders (status);
create index move_orders_session_idx on public.move_orders (stripe_session_id);

alter table public.move_orders enable row level security;

-- Kein Grant für anon und authenticated. Nur der Secret Key schreibt und liest.
revoke all on public.move_orders from anon, authenticated;

create or replace function public.move_orders_touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger move_orders_touch
  before update on public.move_orders
  for each row execute function public.move_orders_touch_updated_at();
