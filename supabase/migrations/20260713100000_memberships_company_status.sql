-- ─── Team & Owner: Unternehmenszugehörigkeit und Einladungsstatus ─────────────
-- Additive Erweiterung von memberships. Die Owner-Auswahl im Frontend lädt
-- Mitglieder aus profiles + memberships und gruppiert nach Unternehmen; nichts
-- davon ist im Client hart codiert.
--
--   company – 'seeszn' | 'kluehspies'; steuert die visuelle Gruppierung.
--             Nullable: Bestandszeilen ohne Wert werden im Frontend über die
--             Rolle zugeordnet (seeszn_admin → SEESZN, sonst Klühspies).
--   status  – 'active' | 'invited'; Einladungen über die Admin-API legen die
--             Membership als 'invited' an, der erste erfolgreiche Login setzt
--             sie serverseitig (Admin-Client) auf 'active'.

alter table public.memberships
  add column company text check (company in ('seeszn', 'kluehspies'));

alter table public.memberships
  add column status text not null default 'active'
    check (status in ('active', 'invited'));

comment on column public.memberships.company is
  'Unternehmenszugehörigkeit für die Gruppierung der Owner-Auswahl. '
  'Nullable für Bestandszeilen; Fallback im Frontend über die Rolle.';

comment on column public.memberships.status is
  '''invited'' = per Admin-API eingeladen, noch nie angemeldet. '
  'Wird beim ersten Login serverseitig auf ''active'' gesetzt.';
