# Über Klühspies — offene Fakten

Stand: 12.08.2026
Betrifft: `/mockups/ueber-kluehspies`

> Für das Klühspies-Entwicklerteam ist `HANDOVER.md` das führende Dokument.
> Dort stehen die drei Punkte, die vor dem Livegang zu klären sind, in
> knapper Form. Dieses Dokument ist die ausführliche Fassung mit Belegen.

Alle Punkte sind im Code an der betroffenen Zeile als `{{VERIFY: ...}}` bzw.
`{{TODO: ...}}` markiert und über `grep -rn "{{VERIFY\|{{TODO" components/mockups/ueber-kluehspies app/mockups/ueber-kluehspies`
auffindbar.

Regel für diese Seite: kein Claim ohne Beleg in der Bestandsseite, den AGB oder
einer Freigabe durch Klühspies. Wo ein Beleg fehlt, steht ein Platzhalter, keine
Zahl.

---

## A · Klühspies muss liefern

### A1 · Ansprechpartnerin der Seite

`{{VERIFY: Ansprechpartnerin}}` — `content.ts`, `contactSection.person`

Der Kontaktblock der Bestandsseite rotiert serverseitig. Der Cookie-Hinweis der
Seite nennt dafür ausdrücklich einen eigenen Zweck: „Darstellung von
Kontaktpersonen", Cookie `mindshape-cta-banner-currentperson`. Beim Abruf am
11.08.2026 stand dort **Jennifer Brawansky, Produktmanagerin**. Weder Kristina
Emde noch Felix Fernholz waren in diesem Durchlauf sichtbar.

Zu klären: Soll die Über-uns-Seite eine fest hinterlegte Ansprechpartnerin
bekommen, oder soll die Rotation auch im Redesign greifen? Der Name steht nicht
nur im Kontaktblock, sondern auch als `reviewedBy` im JSON-LD und in der
Verantwortlichkeitszeile am Seitenende. Eine falsche Person wäre dort ein
Autoritätssignal auf den falschen Namen.

Bis zur Antwort bleibt Kristina Emde im Entwurf stehen.

### A2 · Gründungsjahr

`{{VERIFY: exaktes Gründungsjahr}}` — `content.ts`, `organization.foundingDate`

Website und Impressum nennen ausschließlich „über 40 Jahre Erfahrung", kein
Jahr. `foundingDate` ist deshalb **nicht** im JSON-LD gesetzt. Aus „über 40
Jahre" ein Gründungsjahr zu rechnen wäre geraten.

Mit dem echten Jahr wird das Feld ergänzt; die Handelsregisternummer
(HR A 4957, Amtsgericht Iserlohn) betrifft die heutige Rechtsform und ist als
Gründungsdatum des Unternehmens nicht belastbar.

### A3 · Kostenlos-Zusage in den AGB

`{{VERIFY: Deckt die Leistungsbeschreibung in den AGB dieselbe Zusage?}}`
— `content.ts`, `uspSection.cards[1]`

Auf der Website belegt: „Ja, der gesamte Bezahlservice einschließlich des
digitalen Verwaltungsportals ist für Schulen und Teilnehmende vollständig
kostenfrei. Es entstehen weder Administrations- noch Transaktionskosten."
(`/service/bezahlservice/`, FAQ)

Damit ist die Aussage für die Seite belegt. Offen ist nur, ob die AGB bzw. die
Leistungsbeschreibung dieselbe Zusage tragen. Eine Kostenlos-Zusage, die nur im
Website-FAQ steht und im Vertragswerk fehlt, ist angreifbar.

### A4 · Mitgliedschaft im Reisenetz

`{{VERIFY: Ist Klühspies Mitglied im Reisenetz?}}` — `content.ts`,
`organization.memberOf`

Belegt ist das Gütesiegel: „Vom Kinder- und Jugendreiseverband Reisenetz
ausgezeichnet, erhielt Klühspies das Gütesiegel Geprüfte Reisenetz Qualität."
Eine Mitgliedschaft steht dort nicht.

Im JSON-LD steht Reisenetz deshalb unter `award`, nicht unter `memberOf`.
Unter `memberOf` steht nur der Bundesverband führender Schulfahrtenveranstalter,
für den die Bestandsseite „Gründungsmitglied" wörtlich belegt.

Bei bestätigter Mitgliedschaft wandert Reisenetz zusätzlich in `memberOf`.

### A5 · Ziel-URL Freiplatzregelung — erledigt, Entscheidung offen

Auf `klassenfahrten-kluehspies.de` existiert weder eine eigene Seite zur
Freiplatzregelung noch ein Sitemap-Eintrag dazu.

**Umgesetzt:** Die Karte trägt keinen Link. Das ist ein abgeschlossener Zustand,
kein Platzhalter, und blockiert den Livegang nicht.

Offen bleibt nur die inhaltliche Frage, ob Klühspies eine Detailseite zur
Freiplatzregelung anlegen möchte. Wenn ja, bekommt die Karte den Link
nachträglich.

### A6 · Zielseiten der vier Auszeichnungen

Zu DSLV-Bewertung, Reisenetz-Siegel, Schulfahrtenverband und
DSV-Nachwuchsprojekt existiert keine Detailseite auf der Klühspies-Domain. Die
früheren „Mehr erfahren"-Links sind deshalb **entfernt** statt als tote Links
stehenzubleiben; die Siegel tragen ihre Aussage jetzt vollständig im eigenen
Text.

Wenn Detailseiten entstehen sollen, gehören die Links zurück.

### A7 · Zahlungsmechanik gegenprüfen

Die Seite nennt jetzt konkrete Fristen. Belegt aus zwei Quellen:

- Bestandsseite Über uns: „Drei Wochen vor Fahrtantritt überweisen Sie uns 80%
  der Gesamtsumme."
- `/service/keine-anzahlung-bei-buchung/`, FAQ: „Bei der Einzelzahlung wird der
  gesamte Reisepreis erst sechs Wochen vor Reisebeginn fällig. Bei der
  Gruppenzahlung erfolgt die erste Zahlung in Höhe von 80 % erst drei Wochen vor
  Reisebeginn."

**Wichtig:** Die 80 % gelten nur für die Gruppenzahlung. Die Seite nennt deshalb
beide Zahlungsarten. Eine Fassung, die nur „drei Wochen vorher 80 %" sagt, wäre
für alle Gruppen mit Einzelzahlung falsch.

Klühspies bestätigt bitte, dass beide Fristen aktuell sind und den Allgemeinen
Reisebedingungen entsprechen.

### A8 · Social-Profile und Facebook-Widerspruch

`{{VERIFY: Vollständige Profilliste und richtiger Facebook-Auftritt}}`
— `content.ts`, `organization.sameAs`

Die Bestandsseite führt **zwei verschiedene Facebook-Adressen** für dieselbe
Marke:

- Footer-Link: `facebook.com/Kluehspies/?locale=de_DE`
- eigenes JSON-LD (`sameAs`): `facebook.com/klassenfahrtenkluehspies`

Zwei Handles für eine Marke sind ein schwaches Entity-Signal. Klühspies benennt
den gültigen Auftritt, danach werden Footer und Schema angeglichen.

Weiter offen:

- Der dritte `sameAs`-Eintrag des Bestandsschemas ist ein
  `share.google`-Kurzlink. Er löst auf eine Google-Suchweiche auf, nicht auf ein
  stabiles Profil, und taugt deshalb nicht als `sameAs`. Gebraucht wird die
  kanonische Adresse des Google Business Profile.
- LinkedIn und YouTube waren unter den naheliegenden Handles nicht auffindbar
  (beide 404). Falls Profile existieren, gehören sie ins `sameAs`. Geraten wird
  nichts.

### A9 · Erreichbarkeitszeiten bestätigen

Die Seite nennt „Erreichbar Montag bis Freitag von 8 bis 17 Uhr". Quelle ist
`openingHours: "Mo-Fr 08:00-17:00"` aus der bestehenden
`TravelAgency`-Auszeichnung der Produktionsseite.

Zu bestätigen: Meinen diese Zeiten auch die **telefonische** Erreichbarkeit?
Eine falsche Zeitangabe neben einer Telefonnummer ist schlechter als keine.

---

## B · SEESZN muss liefern

### B1 · Ziel-URL Anbieter-Vergleich

`{{TODO: Ziel-URL Anbieter-Vergleich}}` — `content.ts`, `hero.tertiaryCta` und
`compareSection`

Entschieden ist Variante A: Der Vergleich bekommt eine eigene Seite. Diese Seite
trägt nur noch einen Teaser mit sichtbarer Vorschau der vier Vergleichskriterien.
Der frühere Anker `#kb-vergleich` aus dem Hero ist entfallen, damit kein CTA mehr
auf die Section zeigt, in der der nächste CTA steht.

Offen ist die URL der Vergleichsseite. Bis dahin sind der sekundäre Hero-Button
und der Teaser-CTA nicht navigierende Schaltflächen, die den offenen Punkt beim
Klick benennen. **Das ist der einzige Punkt, der den Livegang blockiert.**

Zu klären ist außerdem, wo der Vergleich liegt: auf `klassenfahrten-kluehspies.de`
oder als SEESZN-Inhalt. Auf einer Klühspies-Seite dürfen laut CONTENT.md §1 keine
Wettbewerber genannt werden, ein Vergleich ohne Wettbewerber ist aber keiner.

### B2 · OG-Image im Klühspies-Branding

`{{TODO: OG-Image im Klühspies-Branding}}` — `app/mockups/ueber-kluehspies/page.tsx`

Die Seite hat aktuell **kein** `og:image`. Zuvor erbte sie das SEESZN-Standardbild
über `lib/seo#buildMetadata`, was zusammen mit einem Klühspies-Titel eine falsch
beschriftete Vorschaukarte ergeben hätte.

Gebraucht wird ein Klühspies-Motiv in 1200 × 630. Bis dahin ist kein Bild
besser als ein markenfremdes.

### B3 · CONTENT.md §7 ist überholt

`docs/mockups/ueber-kluehspies/CONTENT.md` §1 und §7 schließen ausdrücklich aus,
was diese Überarbeitung bewusst zurückholt:

- „Den bestehenden Claim ‚europaweit die Nr. 1 für Schulskifahrten' im Mockup
  NICHT verwenden."
- „Großzügige Freiplatzregelung" unter den nicht zu übernehmenden Inhalten.

Beides steht wörtlich auf der Bestandsseite und ist damit belegt, nicht erfunden.
Die Anweisung zur Überarbeitung hebt diesen Ausschluss auf. **CONTENT.md muss
nachgezogen werden**, sonst widersprechen sich Source of Truth und Umsetzung, und
der nächste Durchgang dreht die Änderung wieder zurück.

Ebenfalls nachzuziehen, weil vom Mockup inzwischen abweichend:

- §5 Hero: Eyebrow ist keine eigene Zeile mehr, sondern erste Zeile der H1.
- §5 Trust Bar: darunter steht jetzt ein Fließtext-Anker.
- §5 „Für welche Schulen": fünf statt drei Punkte, mit vorangestelltem Lead.
  §5 sagt „Keine zusätzlichen Texte unter den Mini Cards"; der Lead steht
  darüber, nicht darunter.
- §5 Trust Cards: zwei bis drei Sätze statt Einzeiler, CTAs entfallen.
- §8: vier H3 unter „Was Klühspies anders macht" sind jetzt fünf.

### B4 · Robots-Ausschluss bleibt bestehen

Solange die Seite unter `seeszn.com/mockups/` liegt, bleibt
`robots: index: false, follow: false, nocache: true` gesetzt, zusätzlich zum
`X-Robots-Tag`-Header der Route. Canonical und `og:url` sind bewusst leer: ein
Canonical auf die Live-Seite würde Mockup-Inhalte der Produktionsadresse
zuschreiben. `PRODUCTION_SEO.canonical` hält die spätere echte Adresse und wird
im JSON-LD verwendet.

---

## C · Geprüft und erledigt

Diese Punkte standen als offen im Auftrag und sind belegt. Sie brauchen keine
Rückfrage mehr.

| Aussage | Beleg |
|---|---|
| 24/7-Notrufservice | Bestandsseite Über uns, wörtlich: „Sollte während der Klassenfahrt doch mal etwas passieren, ist unser Notrufservice für Sie 24/7 erreichbar." Formulierung als Klühspies-Zusage („unser"), nicht als generischer Veranstalter-Vorteil. Steht zusätzlich in CONTENT.md §2 als verifizierter Kernfakt. |
| Zahlungsstand im Verwaltungsportal | `/service/bezahlservice/`: „sofort erkennbar, wer bereits gezahlt hat und wer noch nicht", „Namen, Beträge und Zahlungsstatus klar aufgelistet", „behalten dennoch stets den Überblick über offene Posten im Verwaltungsportal". Auch BuT-Zahlungen erscheinen dort. |
| Ski-Nr.-1-Claim | Bestandsseite Über uns, wörtlich: „Klühspies ist einer der führenden deutschen Klassenfahrtenveranstalter sowie europaweit die Nr. 1 für Schulskifahrten." |
| Freiplatzregelung | Bestandsseite Über uns, eigener Abschnitt „Großzügige Freiplatzregelung". Superlative daraus („äußerst vorteilhaft", „unschlagbares Preis-Leistungs-Verhältnis") sind bewusst nicht übernommen. |
| Alle externen Links | 17 Ziele auf `klassenfahrten-kluehspies.de` und `portal.klassenfahrten-kluehspies.de` am 11.08.2026 geprüft, alle HTTP 200. Kein toter Link im Markup. |
| NAP und Kontaktdaten | Impressum: Ohler Weg 10, 58553 Halver-Oberbrügge, Tel. +49 (0) 2351 / 97 86-0, Fax +49 (0) 2351 / 78 60 78, info@kluehspies.com. Identisch mit der bestehenden `TravelAgency`-Auszeichnung der Produktionsseite. |
| Erreichbarkeitszeiten „Montag bis Freitag von 8 bis 17 Uhr" | Aus der bestehenden `TravelAgency`-Auszeichnung der Produktionsseite: `"openingHours": "Mo-Fr 08:00-17:00"`. Für die Seite ausgeschrieben statt abgekürzt. Klühspies möge bestätigen, dass die Zeiten auch die telefonische Erreichbarkeit meinen. |
| Verbindlichkeit der Anfrage | Der Mikrotext unter dem Hero-CTA behauptet **nicht**, die Anfrage sei unverbindlich: das ist auf `/reiseanfrage/` nirgends belegt. Er nennt stattdessen die belegte Tatsache von der Bestandsseite: „Wir reservieren Ihre Reise, sodass Sie uns erst nach Einholung sämtlicher Genehmigungen die verbindliche Anmeldung schicken müssen." |

---

## D · Bewusst nicht ausgezeichnet

`aggregateRating` fehlt im JSON-LD und bleibt weg, solange keine öffentlich
einsehbare, belastbare Bewertungsgrundlage vorliegt. Die DSLV-Bewertung ist eine
Verbandsprüfung, keine aggregierte Nutzerbewertung, und taugt nicht als
`ratingValue`. Ein erfundenes oder umgedeutetes Rating wäre ein
Rich-Result-Verstoß und ein Grund für eine manuelle Maßnahme.
