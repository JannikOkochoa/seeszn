# Über Klühspies Redesign
## BUILD SPEC / IMPLEMENTATION SOURCE OF TRUTH

Status: Mockup / Konzept, nicht live  
Stand: 11.08.2026

---

# 1. Ziel

Im bestehenden SEESZN-Klühspies-Dashboard soll ein neuer Bereich „Mockups“ entstehen.

Zielrouten:

- /mockups
- /mockups/ueber-kluehspies

Auf /mockups wird zunächst genau eine Mockup-Karte angezeigt:

Titel:
Über Klühspies

Status:
Redesign · Konzept

Beschreibung:
SEO / GEO / UX Redesign der aktuellen Über-uns-Seite

CTA:
Mockup öffnen

Die Detailroute /mockups/ueber-kluehspies zeigt eine echte responsive Web-Umsetzung des freigegebenen Mockups.

Wichtig:
Dies ist eine interne Konzeptansicht im SEESZN-Dashboard.
Keine Änderungen an der produktiven Klühspies-Website vornehmen.

---

# 2. Vier Sources of Truth und ihre Priorität

Bei Konflikten gilt diese Reihenfolge.

## SOURCE 1: CONTENT

Datei:
docs/mockups/ueber-kluehspies/CONTENT.md

Verbindlich für:
- alle sichtbaren Texte
- Claims
- Zahlen
- Überschriften
- CTA Labels
- CTA Ziele
- Section-Reihenfolge aus inhaltlicher Sicht
- Inhalte, die bewusst nicht übernommen werden

Keine Copy aus dem PNG per OCR übernehmen.

## SOURCE 2: VISUAL

Datei:
public/mockups/ueber-kluehspies/kluehspies-ueber-uns-redesign-mockup-v1.png

Verbindlich für:
- Gesamtkomposition
- Hero-Proportionen
- Reihenfolge und visuellen Rhythmus der Sections
- Weißraum
- Kartenaufbau
- CTA-Hierarchie
- Größenverhältnisse
- responsive Design-Intention
- Farbgewichtung
- visuelle Dichte

Das PNG ist NICHT die Quelle für Texte, Logos oder reale Assets.

## SOURCE 3: REAL BRAND / ASSET REFERENCE

Aktuelle Produktionsseite:
https://www.klassenfahrten-kluehspies.de/ueber-kluehspies/

Zusätzliche offizielle Klühspies-Seiten:
https://www.klassenfahrten-kluehspies.de/
https://www.klassenfahrten-kluehspies.de/service/bezahlservice/
https://www.klassenfahrten-kluehspies.de/service/keine-anzahlung-bei-buchung/

Verbindlich für:
- echtes Klühspies-Logo
- echtes Teamfoto
- echtes Kristina-Emde-Foto, sofern zugänglich
- echte Verbands- und Qualitätssiegel
- reale Markenfarben
- reale Unternehmensdaten
- real vorhandene Bildassets

Erst im bestehenden Repository nach identischen Assets suchen.
Nur wenn ein benötigtes Asset dort nicht vorhanden ist, darf es aus der offiziellen Klühspies-Seite übernommen und lokal für das Mockup gespeichert werden.

Keine dauerhaften Hotlinks auf externe Bilddateien verwenden.

Wenn ein echtes Asset nicht zuverlässig beschafft werden kann:
- keinen Fake erzeugen
- keinen generischen Ersatz erzeugen
- keine AI-generierte Person oder Logo-Variante verwenden
- stattdessen einen neutralen klar gekennzeichneten Placeholder einsetzen und im Abschlussbericht nennen

## SOURCE 4: EXISTING SEESZN REPOSITORY

Das bestehende Repository ist verbindlich für:
- Framework
- Routing
- Auth
- Dashboard Shell
- Header
- Navigation
- Design Tokens
- Fonts
- Button-Komponenten
- Grid-System
- Responsive Breakpoints
- bestehende Komponenten
- Code-Konventionen
- Linting
- TypeScript-Regeln

Bestehende Komponenten wiederverwenden, sofern sie das visuelle Ziel nicht sichtbar verschlechtern.

Keine parallele Design-System-Welt nur für dieses Mockup aufbauen.

---

# 3. Sicherheitsregeln

Vor dem Build:

1. Bestehendes Projekt vollständig analysieren.
2. Framework und Routing identifizieren.
3. Dashboard Header und Navigation finden.
4. Bestehende Mockup- oder Preview-Patterns suchen.
5. Design Tokens und wiederverwendbare Komponenten identifizieren.
6. Vor Änderungen kurz Implementierungsplan ausgeben.

Nicht verändern:

- produktive Klühspies-Website
- produktive Datenbank
- bestehende API-Verträge
- Auth-Logik, außer wenn für die neue interne Route zwingend nötig
- bestehende Kundenrouten
- bestehende Navigationseinträge außerhalb der Ergänzung „Mockups“

Keine Deployment-Aktion ausführen, bevor dies ausdrücklich angefordert wird.

---

# 4. Dashboard Navigation

Im passenden bestehenden Dashboard-Header einen Navigationseintrag ergänzen:

Mockups

Er soll auf:
 /mockups

führen.

Der Eintrag muss sich visuell exakt in die bestehende Dashboard-Navigation einfügen.

Keine neue globale Navigation erfinden.

---

# 5. Mockup Index

Route:
 /mockups

Ziel:
Sehr einfache Mockup Library.

Aktuell nur eine Karte.

Card:
- Titel: Über Klühspies
- Badge: Konzept
- Unterzeile: SEO / GEO / UX Redesign
- optional kleine Preview des Mockup-PNG
- Button: Mockup öffnen
- Link: /mockups/ueber-kluehspies

Die Architektur soll später mehrere Mockups aufnehmen können, aber aktuell keine leeren Platzhalter anzeigen.

---

# 6. Mockup Detailroute

Route:
 /mockups/ueber-kluehspies

Oberhalb der eigentlichen Klühspies-Website einen schmalen internen SEESZN-Hinweis anzeigen:

MOCKUP · NICHT LIVE
Über Klühspies · Konzeptstand 11.08.2026

Der Hinweis soll klar erkennbar, aber visuell zurückhaltend sein.

Darunter beginnt das eigentliche Website-Mockup.

---

# 7. Visuelle Umsetzung

Desktop-Referenz:
public/mockups/ueber-kluehspies/kluehspies-ueber-uns-redesign-mockup-v1.png

Ziel:
Sehr hohe visuelle Übereinstimmung, ohne das PNG einfach als Bild darzustellen.

Nicht erlaubt:
- Screenshot als Seitenhintergrund
- Text als Rasterbild
- ganze Sections als Screenshot
- manuelles Pixel-Overlay statt echter Komponenten

Erwartete Struktur:

1. Klühspies Header / Navigation
2. Breadcrumb
3. Hero mit Teamfoto
4. Trust Bar
5. „Was Klühspies anders macht“
6. Best-Fit Mini Cards
7. Qualitäts- und Trust-Signale
8. Klassenfahrtanbieter-Vergleich Teaser
9. Persönliche Kontakt-CTA
10. Footer

Designprinzipien:
- viel Weißraum
- klare Typografie
- hoher Kontrast
- Klühspies Blau als primäre Akzentfarbe
- subtile Borders
- sparsame Shadows
- Cards nicht überdekorieren
- keine unnötigen Animationen
- teacher-first und vertrauenswürdig
- nicht SaaS-artig überinszenieren

---

# 8. Real Assets

Asset-Zielordner für nur dieses Mockup:

public/mockups/ueber-kluehspies/assets/

Bevor neue Dateien hinzugefügt werden:
1. Repository nach vorhandenen Klühspies-Assets durchsuchen.
2. Duplikate vermeiden.
3. Bestehende echte Assets bevorzugen.

Benötigte reale Assets:
- Klühspies Logo
- Teamfoto aus der aktuellen Über-uns-Seite
- Kristina Emde Porträt aus der aktuellen Über-uns-Seite
- DSLV Logo
- Reisenetz Qualität Logo
- Bundesverband führender Schulfahrtenveranstalter Logo
- DSV-Nachwuchsprojekt Logo

SVG bevorzugen, wenn das Original als SVG vorhanden ist.
Rasterbilder nicht künstlich hochskalieren.

---

# 9. Responsive Verhalten

Das Mockup-Bild ist Desktop-Referenz, aber die Umsetzung muss responsive sein.

Mindestens prüfen:

Desktop:
1440px Breite

Laptop:
1280px Breite

Tablet:
768px Breite

Mobile:
390px Breite

Mobile Erwartungen:
- Header entsprechend bestehendem Projektverhalten
- Hero wird einspaltig
- CTA Buttons gut tappbar
- Trust Bar in 2x2 oder horizontal scrollfrei
- USP Cards einspaltig oder 2x2, je nach bestehendem System
- Trust Cards sauber gestapelt
- keine horizontalen Overflows
- Vergleichs-Teaser einspaltig
- Kontakt-CTA einspaltig
- Textgrößen nicht unter sinnvolle Lesbarkeit reduzieren

---

# 10. Accessibility

Mindestens:
- semantische Heading-Hierarchie
- echte Buttons oder Links
- sichtbarer Focus State
- sinnvolle alt-Texte
- decorative icons aria-hidden
- ausreichender Kontrast
- Keyboard-Navigation
- keine Interaktion ausschließlich über Hover

---

# 11. SEO / GEO Future Readiness

Dies ist eine interne Mockup-Route, aber der Markup-Aufbau soll eine spätere Produktionsübernahme erleichtern.

Deshalb:
- genau ein H1
- sichtbare Inhalte als HTML-Text
- logische H2/H3-Struktur
- keine relevanten Inhalte nur in JS-Tooltips
- keine zentralen Inhalte nur in Bildern
- saubere interne/externe Link-Komponenten
- aussagekräftige Anchor-Texte
- keine Keyword-Stuffing-Blöcke
- kein versteckter SEO-Text
- keine FAQ-Section hinzufügen, wenn sie nicht in CONTENT.md definiert ist
- keine erfundenen structured data

Auf der internen Mockup-Route:
- noindex setzen, wenn das Projekt solche Preview-Routen öffentlich erreichbar macht
- nicht in Sitemap aufnehmen

Die spätere Produktionsversion kann separat Organization Structured Data erhalten. Das ist nicht Teil dieses Mockup-Builds, außer bereits ein passendes Preview-Pattern existiert.

---

# 12. CTA-Verhalten im Mockup

Echte bereits definierte Klühspies-Ziele dürfen in neuem Tab geöffnet werden, sofern das zum bestehenden Dashboard-Pattern passt.

Für den noch nicht veröffentlichten „Klassenfahrtanbieter vergleichen“-CTA:
- keine erfundene URL
- visuell aktiv darstellen
- entweder preventDefault oder als clearly marked mock interaction behandeln
- keine Navigation auf 404 oder Fantasie-Route

---

# 13. Visual QA ist Pflicht

Nach dem ersten Build NICHT stoppen.

QA Ablauf:

1. Production Build oder stabilen Preview Build erzeugen.
2. /mockups/ueber-kluehspies rendern.
3. Full-page Desktop Screenshot erzeugen.
4. Mit dem Referenz-PNG vergleichen.
5. Abweichungen korrigieren.
6. Noch einmal rendern.
7. Mobile Screenshot bei 390px erzeugen.
8. Responsive Probleme korrigieren.
9. Abschließenden Build/Lint/Test gemäß Projektsetup ausführen.

Explizit vergleichen:
- Hero-Höhe und Bildgewicht
- Headline-Größe
- Textbreite
- CTA-Größen
- Trust-Bar-Höhe
- Section-Abstände
- Card-Breiten
- Card-Höhen
- Icon-Skalierung
- Border-Radius
- Trust-Logo-Größen
- Vergleichs-Banner
- Übergang in Kontakt-CTA
- Footer-Proportionen

Ziel:
Nicht „ähnlich“, sondern präsentationsreif.

---

# 14. Abschlussbericht

Nach Fertigstellung kurz berichten:

1. Welche Dateien wurden neu angelegt?
2. Welche Dateien wurden geändert?
3. Welche echten Assets wurden wiederverwendet?
4. Welche Assets mussten neu lokal übernommen werden?
5. Welche Assets fehlen eventuell noch?
6. Welche Routes wurden angelegt?
7. Build/Lint/Test Status
8. Wo liegen die QA Screenshots?
9. Wurde irgendein produktiver Bereich verändert? Erwartete Antwort: Nein.
