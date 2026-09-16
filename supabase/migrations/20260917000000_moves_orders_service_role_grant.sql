-- ─── MOVES: fehlendes Grant für move_orders nachtragen ───────────────────────
-- Die ursprüngliche Migration hat anon und authenticated korrekt gesperrt, aber
-- kein explizites Grant für service_role gesetzt. Unter dem aktuellen Cloud-
-- Standard (auto_expose_new_tables nicht gesetzt) werden neue Tabellen nicht
-- mehr automatisch für die Data API freigegeben, auch nicht für service_role.
-- lib/moves/orders.ts scheitert dadurch an jedem Zugriff mit 42501 (permission
-- denied). Additive Korrektur, keine bestehenden Daten oder Policies betroffen.
--
-- Secret Key (service_role) umgeht RLS und braucht select, insert, update —
-- lib/moves/orders.ts löscht nie einen move_orders-Datensatz.

grant select, insert, update on public.move_orders to service_role;
