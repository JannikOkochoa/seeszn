# Gegenüberstellung: Bestandsseite und neue Seite

Vergleichsbasis: `https://www.klassenfahrten-kluehspies.de/ueber-kluehspies/`,
abgerufen am 11.08.2026.
Stand dieses Dokuments: 12.08.2026.

---

## 1 · Was inhaltlich hinzugekommen ist

| Neu | Warum |
|---|---|
| **Rechtsform und Sitz im Fließtext** („Die Klühspies Reisen GmbH & Co. KG hat ihren Sitz in Halver-Oberbrügge") | Standen bisher nur im Impressum und im Schema. Als sichtbarer Satz sind sie der Anker, der Klühspies von ähnlich benannten Anbietern unterscheidbar macht, und das erste, was eine Schulleitung prüft. |
| **Konkrete Zahlungstermine** (80 % drei Wochen vorher bei Gruppenzahlung, 100 % sechs Wochen vorher bei Einzelzahlung, Endabrechnung nach der Fahrt) | Stand auf der Bestandsseite in einem separaten Abschnitt „Kundenfreundliche Abwicklung", weit entfernt von „Keine Anzahlung bei Buchung". Wer die Anzahlung liest, fragt sofort „wann dann?". Die Antwort steht jetzt in derselben Karte. |
| **Fließtext-Anker unter der Stat-Leiste** | Vier Kacheln mit Zahl und Zwei-Wort-Label ergeben aus dem Kontext gerissen keine Aussage. Der Absatz bindet dieselben Zahlen in ganze Sätze. |
| **Frage-Block „Für welche Schulen ist Klühspies besonders interessant?"** mit Lead und fünf Punkten | Gab es auf der Bestandsseite nicht. Frageförmige Überschrift, die einer echten Suchanfrage entspricht, plus Selbsteinordnung in Sie-Form. |
| **Vergleichs-Teaser mit vier sichtbaren Kriterien** | Für Nutzerinnen im Auswahlmodus, die noch nicht wissen, woran sie Anbieter messen sollen. |
| **Erreichbarkeitszeiten und E-Mail-Adresse im Kontaktblock** | Eine Telefonnummer ohne Zeiten erzeugt Unsicherheit. Ein Teil der Zielgruppe ruft grundsätzlich nicht an. |
| **Mikrotext unter dem Hero-CTA** („Klühspies reserviert Ihre Reise. Die verbindliche Anmeldung senden Sie erst, wenn alle Genehmigungen vorliegen.") | Beantwortet die häufigste ungestellte Frage vor einer Anfrage: „binde ich mich damit schon?" Der Satz ist auf der Bestandsseite belegt, stand dort aber an einer Stelle, die niemand vor der Anfrage liest. |
| **Sichtbare Zeile „Stand" und „Inhaltlich verantwortlich"** | Aktualitäts- und Verantwortungssignal, gespiegelt als `dateModified` und `reviewedBy` im Schema. |
| **JSON-LD** (`TravelAgency`, `FAQPage`, `BreadcrumbList`) | Die Bestandsseite hat `Organization`, `TravelAgency` und `BreadcrumbList`, aber keine FAQ-Auszeichnung und keine Auszeichnungen und Mitgliedschaften im Schema. |
| **Aussagende Linktexte** statt fünfmal „Mehr erfahren" | Für Screenreader-Nutzung und als Themensignal. |

---

## 2 · Was entfernt wurde und warum

| Entfernt | Begründung |
|---|---|
| „sensationell gutes Preis-Leistungs-Verhältnis" | Nicht belegbar, nicht prüfbar, und für eine skeptische Zielgruppe ein Warnsignal statt eines Arguments. Der **Begriff** „Preis-Leistungs-Verhältnis" ist aus Rankingschutz erhalten, siehe §3. |
| „unschlagbares Preis-Leistungs-Verhältnis" (Freiplatz-Abschnitt) | Dasselbe. An seine Stelle tritt die Regelung selbst, die den Punkt tatsächlich belegt: Begleitpersonen tragen kaum eigene Kosten. |
| „maximale Flexibilität", „Rundum-Sorglos-Paket", „einzigartig" | Leere Verstärker. Sie kosten Zeile und liefern keine Information. |
| „Wir überzeugen mit speziell abgestimmten Reiseprogrammen, unserem einzigartigen Service …" | Selbstzuschreibung ohne Prüfbarkeit. Ersetzt durch die Sache selbst. |
| Abschnitt „Vorteile bei der Buchung über einen Reiseveranstalter" mit den Akkordeons „Alles aus einer Hand", „Sehr gutes Preis-Leistungs-Verhältnis", „Vielfältige Programmauswahl" | Argumentiert für die **Kategorie** Reiseveranstalter, nicht für Klühspies. Wer auf einer Über-uns-Seite gelandet ist, hat diese Entscheidung längst getroffen. Der einzige substanzielle Inhalt daraus, die 24/7-Notfallerreichbarkeit, ist in die Beratungskarte gewandert. |
| Eigenständiger Abschnitt „Kundenfreundliche Abwicklung" | Nicht gestrichen, sondern aufgelöst: die Zahlungsmechanik steht jetzt in der Karte „Keine Anzahlung bei Buchung", wo die Frage entsteht. |
| Vier „Mehr erfahren"-CTAs unter den Siegeln | Zu keiner der vier Auszeichnungen existiert eine Zielseite auf der Domain. Die Siegel tragen ihre Aussage stattdessen vollständig im eigenen Text. |
| Dritter Hero-CTA „Bezahlservice ansehen" | Drei gleichrangige Angebote im Hero erzwingen eine Entscheidung, die die Seite an dieser Stelle noch nicht vorbereitet hat. Der Link steht in der Bezahlservice-Karte, wo er hingehört. |
| Interner Sprunganker vom Hero auf den Vergleichs-Teaser | Zeigte auf die Sektion, deren eigener CTA dasselbe Ziel meint. Ein CTA, der auf einen zweiten CTA zeigt, verlängert nur den Weg. |

---

## 3 · Bewusst erhaltene Begriffe

Diese Formulierungen der Bestandsseite sind unverändert übernommen, weil sie
Suchbegriffe, Markenbegriffe oder belegte Claims sind. Ein Umformulieren wäre
ein Rankingrisiko ohne Gegenwert.

| Begriff | Grund |
|---|---|
| **„Keine Anzahlung bei Buchung"** | Wortgleich mit dem Titel der bestehenden Serviceseite und mit dem Footer-Link. Interne Verlinkung und Suchintention hängen an dieser Formulierung. |
| **„Bezahlservice"** | Produktname von Klühspies, so auf der Serviceseite und im Footer geführt. |
| **„Klassenfahrtanbieter vergleichen"** | Suchbegriff, unverändert als H2 des Teasers. |
| **„europaweit die Nr. 1 für Schulskifahrten"** (als „Nummer 1 für Schulskifahrten") | Der stärkste abgrenzbare Claim der Seite. Ein Superlativ mit klar begrenztem Geltungsbereich wird in Antwortsystemen übernommen, eine vage Größenangabe nicht. |
| **„Geprüfte Reisenetz Qualität"** | Eingetragener Siegelname, wörtlich zu führen. |
| **„Gründungsmitglied im Bundesverband führender Schulfahrtenveranstalter"** | Belegte Formulierung, im Wortlaut relevant. |
| **„DSV-Nachwuchsprojekt"** | Eigenname des Projekts. |
| **„Freiplatzregelung"** | Fachbegriff, nach dem Lehrkräfte gezielt suchen. Steht deshalb in der Überschrift, nicht nur im Fließtext. |
| **„110.000 Gäste pro Jahr", „über 40 Jahre"** | Die beiden Zahlen, die Klühspies durchgängig führt. Unverändert, auch in der Schreibweise. |
| **„24/7"** | Wörtlich von der Bestandsseite, nicht zu „rund um die Uhr" umformuliert. |
| **„mittelständischer Reiseveranstalter"** | Beide Begriffe waren im ersten Entwurf verloren. Zurückgeholt in den Fließtext unter der Stat-Leiste, wo sie zusammen mit Rechtsform und Sitz den Entity-Anker bilden. |
| **„Schulklassen"** | Zurückgeholt in denselben Absatz. |
| **„Reiseunterlagen"** | Zurückgeholt in Karte 5. Ohne das „optimal" der Bestandsseite. |
| **„Preis-Leistungs-Verhältnis"** | Zurückgeholt in Karte 3, aber ohne Superlativ: als sachliche Folge der Freiplatzregelung, nicht als Marktbehauptung. Ob diese abgeschwächte Form reicht, kann erst der GSC-Query-Export zeigen, siehe `HANDOVER.md` §B1. |

Der Ski-Claim taucht bewusst **zweimal** auf: im Hero als vollständiger Satz
und im DSV-Siegel. Auf der Bestandsseite stand er im Siegelblock nur als
Nebensatz („Als Nr. 1 für Ski-Klassenfahrten engagiert sich Klühspies …"), also
in einer Form, die isoliert nicht als Aussage funktioniert. Die Wiederholung ist
hier Absicht, kein Versehen.

---

## 4 · Welche Nutzerfrage jede Sektion beantwortet

Kalibriert auf die primäre Zielgruppe: eine zeitknappe Lehrkraft, die
Verantwortung für fremde Kinder und fremdes Geld trägt und nicht das schönste,
sondern das risikoärmste Angebot sucht.

| Sektion | Beantwortete Frage |
|---|---|
| **Hero** | „Wer ist das, und kann ich denen trauen?" Familienbetrieb, Größe, Ski-Position, 40 Jahre. Der Mikrotext nimmt zusätzlich die Angst vor der Anfrage. |
| **Stat-Leiste + Fließtext** | „Woran mache ich das fest?" Die vier Belege für die Vertrauensfrage, plus Rechtsform und Sitz für die formale Prüfung. |
| **Karte 1: Eltern zahlen direkt an Klühspies** | „Was passiert, wenn Eltern nicht zahlen?" und „wie viel Arbeit bleibt an mir hängen?" Die häufigste und unangenehmste Aufgabe zuerst. |
| **Karte 2: Keine Anzahlung bei Buchung** | „Was kostet mich das, und wann muss ich zahlen?" |
| **Karte 3: Freiplatzregelung für Begleitpersonen** | „Muss ich als Begleitperson selbst zahlen?" |
| **Karte 4: Sie sehen jederzeit, wer schon gezahlt hat** | „Behalte ich den Überblick, ohne eine Liste zu führen?" |
| **Karte 5: Persönliche Beratung, im Notfall 24/7 erreichbar** | „Was passiert, wenn unterwegs etwas passiert?" und „rede ich mit einem Menschen?" |
| **Für welche Schulen ist Klühspies interessant?** | „Bin ich hier richtig?" Selbsteinordnung statt Verkauf. |
| **Qualität, auf die Schulen vertrauen** | „Prüft das jemand von außen?" Adressiert vor allem Schulleitung und Sekretariat. |
| **Klassenfahrtanbieter vergleichen** | „Woran messe ich die Anbieter, zwischen denen ich schwanke?" |
| **Kontakt** | „Mit wem rede ich, und wie erreiche ich die Person?" Name, Gesicht, Zeiten, zwei Kanäle. |
| **Stand und Verantwortung** | „Ist das noch aktuell, und wer steht dafür ein?" |

Die Reihenfolge der Karten folgt der Entscheidungsrelevanz für die Lehrkraft,
nicht dem Aufwand für Klühspies. Auf der Bestandsseite stand die
Freiplatzregelung vor der Zahlungsabwicklung; das dreht die Prioritäten um.

---

## 5 · Prüfergebnisse

| Prüfung | Ergebnis |
|---|---|
| Satzlänge im Fließtext | 37 Sätze, Schnitt 12,0 Wörter, längster Satz 21 Wörter |
| Rankingschutz-Abgleich | 9 Legacy-Begriffe geprüft, alle 9 im neuen Text vorhanden |
| Ausgehende Link-Ziele | 8 verschiedene Ziele, 8 Links, kein Ziel doppelt |
| Verbotene Werbesprache | 0 Treffer |
| Gerade Anführungszeichen | 0 Treffer, durchgängig „…" |
| Geschützte Leerzeichen | 3 gesetzt: zweimal „110.000 Gäste", einmal „80 %" |
| Telefonnummer | eine Schreibweise an allen vier Stellen, ein `tel:`-Ziel |
| Ansprechpartnerin | durchgängig identisch an drei Stellen |
| H1 im DOM | genau eine, keine übersprungene Ebene |
| Absolute seeszn.com-Adressen im Markup | 0 |
| CTA auf die eigene Sektion | 0 |
| Externe Links | 40 Linkelemente, 27 verschiedene Ziele, alle HTTP 200 |
| Kontrast Fließtext | alle geprüften Paarungen ≥ 4,5:1 nach Korrektur der Weißtöne auf Blau |
| JSON-LD | 52 Properties gegen das schema.org-Vokabular geprüft, 0 Fehler |
| Build, Typecheck, Lint | grün |
