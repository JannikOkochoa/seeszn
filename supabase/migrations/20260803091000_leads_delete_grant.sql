-- ─── Leads: Löschrecht für Servercode ─────────────────────────────────────────
-- Ohne DELETE lässt sich ein Lead nicht mehr entfernen, wenn jemand eine
-- Löschung seiner Daten verlangt (DSGVO Art. 17). Das Recht bleibt auf
-- service_role beschränkt; anon und authenticated haben weiterhin weder Grants
-- noch Policies auf public.leads.

grant delete on public.leads to service_role;
