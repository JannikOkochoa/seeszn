-- ─── Quick Wins: editierbare AI-/SEO-Maßnahmen im Klühspies Room ──────────────
-- Bisher waren die Quick-Win-Karten hartkodiert. Diese Tabelle macht sie im Room
-- editierbar (anlegen, ändern, löschen, sortieren) – ausschließlich für
-- seeszn_admin und kluehspies_editor, abgesichert über RLS wie die übrigen
-- Room-Inhalte. Gelesen wird von allen Organisationsmitgliedern.
--
-- `recommendation` speichert den Empfehlungstext zeilenweise (mit "\n"
-- verbunden); leere Zeilen erzeugen im Room einen Absatzabstand. Die Reihenfolge
-- steuert `sort_order` (aufsteigend). Der Seed entspricht den fünf kuratierten
-- Standardinhalten (defaultQuickWins.ts) und wird nur für die Klühspies-
-- Organisation angelegt.

create table public.kluehspies_quick_wins (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  what text not null default '',
  why text not null default '',
  recommendation text not null default '',
  sort_order integer not null default 0,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.kluehspies_quick_wins is
  'Editierbare Quick-Win-Karten der QUICK-WINS-Section im Klühspies Room. '
  'Inhalte werden im Room gepflegt; RLS beschränkt Schreibzugriff auf '
  'seeszn_admin und kluehspies_editor.';
comment on column public.kluehspies_quick_wins.recommendation is
  'Empfehlungstext, zeilenweise mit "\n" verbunden. Leere Zeilen = Absatz.';
comment on column public.kluehspies_quick_wins.sort_order is
  'Anzeigereihenfolge in der Section, aufsteigend.';

create index kluehspies_quick_wins_org_order_idx
  on public.kluehspies_quick_wins (organization_id, sort_order);

create trigger kluehspies_quick_wins_set_updated_at
  before update on public.kluehspies_quick_wins
  for each row
  execute function public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.kluehspies_quick_wins enable row level security;

create policy "kluehspies_quick_wins_select_member"
  on public.kluehspies_quick_wins for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "kluehspies_quick_wins_insert_editor"
  on public.kluehspies_quick_wins for insert
  to authenticated
  with check (
    public.has_org_role(organization_id, array['seeszn_admin', 'kluehspies_editor'])
    and created_by = (select auth.uid())
  );

create policy "kluehspies_quick_wins_update_editor"
  on public.kluehspies_quick_wins for update
  to authenticated
  using (public.has_org_role(organization_id, array['seeszn_admin', 'kluehspies_editor']))
  with check (public.has_org_role(organization_id, array['seeszn_admin', 'kluehspies_editor']));

create policy "kluehspies_quick_wins_delete_editor"
  on public.kluehspies_quick_wins for delete
  to authenticated
  using (public.has_org_role(organization_id, array['seeszn_admin', 'kluehspies_editor']));

-- ── Grants (Auto-Expose ist projektweit deaktiviert) ─────────────────────────
grant select, insert, update, delete on public.kluehspies_quick_wins to service_role;
grant select, insert, update, delete on public.kluehspies_quick_wins to authenticated;

-- ── Seed: fünf kuratierte Standard-Quick-Wins für die Klühspies-Organisation ──
insert into public.kluehspies_quick_wins (organization_id, title, what, why, recommendation, sort_order)
select o.id, seed.title, seed.what, seed.why, seed.recommendation, seed.sort_order
from public.organizations o
cross join (
  values
    (
      1,
      $qw$Zentralen „Was ist Klühspies?“-Block ergänzen$qw$,
      $qw$Die wichtigsten Unternehmensinformationen sind bereits auf der Startseite und der Über-uns-Seite vorhanden, stehen dort aber verteilt zwischen allgemeinen Marketingaussagen. Eine kurze, eindeutig zitierbare Definition von Klühspies fehlt.$qw$,
      $qw$AI-Systeme müssen Unternehmen, Leistungen, Zielgruppen und belegbare Kennzahlen eindeutig einer Entität zuordnen können. Ein kompakter Definitionsblock erleichtert es ChatGPT, Gemini und Google, Klühspies korrekt zu beschreiben und als Quelle zu verwenden.$qw$,
      $qw$Direkt unter dem ersten Startseitenbereich einen kompakten Entity-Block ergänzen und in ähnlicher Form auf der Über-uns-Seite, einer zukünftigen Zahlen-und-Fakten-Seite sowie im Organization-Markup verwenden:

Was ist Klühspies?
Klühspies Reisen GmbH & Co. KG ist ein familiengeführter deutscher Reiseveranstalter für Klassenfahrten und Gruppenreisen. Das Unternehmen organisiert seit 1978 Schulreisen nach Deutschland und Europa und betreut mehr als 110.000 Gäste pro Jahr. Zu den Leistungen gehören individuelle Reiseplanung, Transport, Unterkünfte, Programme, kostenlose Einzelzahlungen, ein digitales Verwaltungsportal für Lehrkräfte und ein 24/7-Notrufservice.

Hinweis: Die Jahreszahl 1978 basiert auf der intern bestätigten Unternehmenshistorie. Keine neuen oder abweichenden Kennzahlen erfinden.$qw$
    ),
    (
      2,
      $qw$Homepage-FAQ auf konkrete AI-Fragen erweitern$qw$,
      $qw$Die aktuelle Homepage-FAQ beantwortet überwiegend allgemeine Fragen zu Kosten, Taschengeld, Finanzierung und dem pädagogischen Wert von Klassenfahrten. Die wichtigsten Fragen zu den konkreten Leistungen und Unterschieden von Klühspies werden dort bislang nicht direkt beantwortet.$qw$,
      $qw$Konkrete Frage-Antwort-Paare entsprechen der Form, in der Nutzer AI-Systeme befragen. Klare Antworten zu Anzahlung, Einzelzahlungen, Lehrerportal, Erreichbarkeit und Erfahrung erhöhen die Chance, dass Klühspies in direkten Anbieter- und Servicefragen korrekt genannt und zitiert wird.$qw$,
      $qw$Die bestehenden allgemeinen Fragen beibehalten, aber davor folgende fünf Klühspies-spezifische Fragen ergänzen:

1. Was unterscheidet Klühspies von anderen Klassenfahrtanbietern?
Klühspies verlangt bei der Buchung keine unmittelbare Anzahlung, ermöglicht kostenlose Einzelzahlungen und stellt Lehrkräften bei aktiviertem Einzelzahlungsservice ein digitales Verwaltungsportal zur Verfügung. Darüber hinaus werden Reiseangebote individuell auf die jeweilige Schulgruppe zugeschnitten.

2. Können Eltern den Reisepreis einzeln bezahlen?
Ja. Eltern beziehungsweise Erziehungsberechtigte können ihren Reiseanteil ohne zusätzliche Kosten direkt an Klühspies überweisen. Klühspies erstellt die Einzelrechnungen, überwacht die Zahlungseingänge und versendet die erste Zahlungserinnerung automatisch.

3. Was zeigt das Klühspies-Portal?
Das Portal zeigt Teilnehmende, Rechnungsbeträge und den jeweiligen Zahlungsstatus. Gruppen mit aktiviertem Einzelzahlungsservice erhalten automatisch Zugang zum passwortgeschützten Verwaltungsportal.

4. Ist Klühspies während der Klassenfahrt erreichbar?
Ja. Für Probleme oder Notfälle während der Reise steht ein rund um die Uhr erreichbarer Notrufservice zur Verfügung.

5. Seit wann organisiert Klühspies Klassenfahrten?
Klühspies organisiert seit 1978 Klassenfahrten und Gruppenreisen und betreut jährlich mehr als 110.000 Gäste.$qw$
    ),
    (
      3,
      $qw$Seite „Klühspies in Zahlen & Fakten“ erstellen$qw$,
      $qw$Klühspies besitzt zahlreiche starke und zitierfähige Kennzahlen. Diese sind aktuell jedoch über Startseite, Über-uns-Seite, Reiseübersicht, Bezahlservice und weitere Unterseiten verteilt.$qw$,
      $qw$AI-Systeme zitieren besonders häufig Seiten, auf denen überprüfbare Zahlen, konkrete Leistungen und Quellen zentral gebündelt sind. Eine eigenständige Faktenseite schafft eine eindeutige Referenz für Unternehmens- und Anbieterfragen.$qw$,
      $qw$Eine kompakte Seite „Klühspies in Zahlen und Fakten“ erstellen und von Startseite, Über uns, Blogartikeln und Presseinformationen intern verlinken.

Vorgesehene Fakten:
Seit 1978: Organisation von Klassenfahrten und Gruppenreisen
Mehr als 110.000: Teilnehmende und Gäste pro Jahr
24/7: Notrufservice während der Reise
0 €: zusätzliche Kosten für den Einzelzahlungsservice
1 Portal: Zahlungs- und Teilnehmerübersicht für Lehrkräfte
148 Reiseangebote: aktuell auf der Reiseübersicht
Deutschland und Europa: Städte-, Aktiv- und Ski-Klassenfahrten
Anzahlung: grundsätzlich etwa drei Wochen vor Reisebeginn
Restzahlung: mit der Schlussrechnung nach der Reise

Unter den Zahlen sichtbar ergänzen: Quelle: interne Buchungs- und Produktdaten von Klühspies, Stand Juli 2026.

Wichtig: Die Zahl 148 ist dynamisch und muss entweder aus dem aktuellen Produktbestand geladen oder vor jeder Aktualisierung geprüft werden. Keine dauerhaft statische Zahl verwenden, wenn sich die Angebotsanzahl ändert.

Fachliche Korrektur: Nicht ungeprüft „80 % drei Wochen vor Reisebeginn“ einsetzen. Die aktuell öffentlich auffindbare Bezahlservice-Seite spricht von einer Anzahlung circa drei Wochen vor der Fahrt und der Restzahlung nach Rückkehr, nennt an dieser Stelle aber keine 80 %. 80 % nur verwenden, wenn dies durch aktuelle Vertragsunterlagen oder Klühspies intern ausdrücklich bestätigt wurde.$qw$
    ),
    (
      4,
      $qw$Planungsratgeber und neuen Hubartikel zusammenführen$qw$,
      $qw$Der bestehende Ratgeber „Klassenfahrt planen und durchführen“ beschreibt die Planung derzeit in sechs Schritten. Der neue vorbereitete Hubartikel arbeitet dagegen mit sieben Phasen. Werden beide Versionen parallel indexiert, veröffentlicht Klühspies zwei unterschiedliche Hauptantworten auf dieselbe Suchintention.$qw$,
      $qw$Mehrere konkurrierende Seiten können Rankings, interne Links, Backlinks und AI-Zitate aufteilen. Gleichzeitig entsteht für Suchmaschinen und AI-Systeme eine widersprüchliche Informationsbasis: sechs Schritte auf einer Seite und sieben Phasen auf einer anderen.$qw$,
      $qw$Den neuen vollständigen Hubartikel auf der bereits bestehenden URL veröffentlichen:
/ratgeber/organisation-einer-klassenfahrt/planung-der-klassenfahrt/

Den bisherigen Inhalt dort vollständig aktualisieren, statt eine zweite konkurrierende URL aufzubauen.

Vorteile:
vorhandene Rankings bleiben erhalten
bestehende interne Links bleiben gültig
vorhandene Autorität wird weitergenutzt
keine Keyword-Kannibalisierung
eine eindeutige Hauptquelle für „Klassenfahrt planen“

Falls der neue Artikel zwingend unter einer neuen Blog-URL veröffentlicht wird, die bisherige Seite sinnvoll abgrenzen oder per 301 auf die neue Hauptquelle weiterleiten.$qw$
    ),
    (
      5,
      $qw$OAI-SearchBot und technischen Bot-Zugriff prüfen$qw$,
      $qw$Ob OAI-SearchBot die Klühspies-Website aktuell vollständig crawlen kann, ist bislang nicht technisch dokumentiert. Es darf daher nicht behauptet werden, dass der Bot derzeit blockiert ist. Der Status muss direkt über robots.txt, HTTP-Antworten und gegebenenfalls Bot- oder Firewall-Logs geprüft werden.$qw$,
      $qw$OpenAI erklärt offiziell, dass OAI-SearchBot nicht blockiert sein darf, damit Website-Inhalte in ChatGPT-Zusammenfassungen und Snippets aufgenommen und klar verlinkt werden können. Eine robots.txt-Freigabe allein reicht nicht aus, falls Firewall, CDN, Bot-Schutz, Rate Limits oder Serverregeln den Crawler trotzdem blockieren.$qw$,
      $qw$Francesco soll folgenden technischen Check durchführen:

1. Live-Datei prüfen: https://www.klassenfahrten-kluehspies.de/robots.txt
2. Prüfen, ob OAI-SearchBot durch eine allgemeine oder spezifische Disallow-Regel blockiert wird.
3. Falls OAI-SearchBot bereits durch die allgemeinen Regeln Zugriff hat, ist keine zusätzliche Regel zwingend notwendig.
4. Falls er blockiert wird, ergänzen: User-agent: OAI-SearchBot / Allow: /
5. Vorhandene Sitemap-Zeile prüfen beziehungsweise ergänzen: Sitemap: https://www.klassenfahrten-kluehspies.de/sitemap.xml
6. Zusätzlich prüfen: CDN- oder Firewall-Regeln, Bot-Protection, 403-, 429- oder Challenge-Antworten, Erreichbarkeit der wichtigsten Seiten mit dem OAI-SearchBot-User-Agent sowie Server- und Access-Logs.
7. GPTBot separat behandeln. Eine Freigabe von OAI-SearchBot für ChatGPT Search bedeutet nicht automatisch, dass GPTBot ebenfalls freigegeben werden muss.

Wichtig: nicht behaupten „OAI-SearchBot ist blockiert“. Der Zugriff ist aktuell nicht verifiziert und deshalb technisch zu prüfen.$qw$
    )
) as seed(sort_order, title, what, why, recommendation)
where o.slug = 'kluehspies';
