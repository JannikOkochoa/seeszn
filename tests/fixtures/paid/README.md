# Paid-Fixtures

Echte, einmal öffentlich gelesene Einstiegsseiten für den Paid Check. Gegenstück
zu `../scan/`, aber je Fixture nur EINE Seite: der Paid Check liest nicht mehr.

Erzeugt mit:

```
node --experimental-strip-types --import ./tests/register-ts.mjs \
  scripts/first-move-paid-lab.mjs crawl urls.txt [--performance]
```

Ausgewertet mit `… paid-lab.mjs run [--signals]`.

## Wozu die Auswahl

Die Sammlung ist bewusst nicht "schöne Landingpages". Sie deckt die Zustände ab,
an denen der Klassifikator vorher falsch lag:

- **sauber gebaute Seiten** (stripe.com, mailchimp.com, manufactum.de) – sie
  haben vor der Korrektur einen Befund erzeugt, allein weil im ausgelieferten
  HTML kein Ads-Tag und keine bekannte Consent-Plattform zu sehen war
- **clientseitig gerenderte Hüllen** (posthog.com, example.com) – dürfen nie
  bewertet werden, es entstünde eine Aussage über das Rendering
- **Bot-Schutz** (hornbach.de 406, idealo.de, immowelt.de, kleinanzeigen.de,
  autoscout24.de, tarifcheck.de, finanzen.net 403)
- **positiv belegbare Seiten** (viessmann.de, debeka.de, wetter.com) – erkennbare
  Consent-Plattform, eindeutige H1, sichtbarer Konversionspfad
- **echte Sackgasse** (danluu.com) – keine H1 und kein weiterführender Pfad, die
  einzige Seite der Sammlung, die einen Befund trägt
- **Grenzfälle** (gutenberg.org mit genau 3 internen Links, rfc-editor.org als
  text/plain ohne Title)

`tests/first-move-paid-diagnosis.test.mjs` prüft daran zweierlei: dass sich die
Zustände weiterhin verteilen und dass der Anteil der Seiten mit Befund klein
bleibt. Vor der Korrektur lag er bei 5 von 12.

## Was bewusst nicht im Fixture steht

Verkleinert wurde nur, was der Paid-Klassifikator nie liest: `h2`, `h3` und
`internalLinks` über die ersten 20 hinaus. Alles, was in eine Dimension oder eine
Regel eingeht, ist unverändert.

`performance` ist in den meisten Fixtures `null`: die PageSpeed-API läuft ohne
gesetzten `PAGESPEED_API_KEY` ins Tageskontingent. Genau dieser Zustand ist der
Produktionsfall, solange der Schlüssel nicht gesetzt ist, und die Fixtures bilden
ihn deshalb korrekt ab.
