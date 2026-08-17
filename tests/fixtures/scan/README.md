# Scan-Fixtures

Echte, einmal öffentlich gecrawlte Oberflächen. Sie existieren, damit sich
Änderungen am Klassifikator (`lib/first-move/diagnosis.ts`, `lib/first-move/qualify.ts`)
gegen dieselbe Evidenz prüfen lassen, ohne fremde Server erneut zu belasten und
ohne dass Netzschwankungen das Ergebnis verwackeln.

Erzeugt mit:

```
node --experimental-strip-types --import ./tests/register-ts.mjs \
  scripts/first-move-classify-lab.mjs crawl domains.txt
```

Ausgewertet mit `… classify-lab.mjs run` und von
`tests/first-move-diagnosis.test.mjs` als Regressionsnetz benutzt: fällt die
Verteilung über diese Domains wieder auf einen einzigen Zustand zusammen,
schlägt der Test fehl.

## Was bewusst nicht im Fixture steht

Die Dateien sind nach dem Crawl verkleinert worden. Entfernt wurde nur, was der
Klassifikator nie liest:

- `samples[].internalLinks` – ausgewertet wird ausschließlich `home.internalLinks`
- `h2` / `h3` – fließen nur als bereits gezähltes `questionHeadings` ein
- `home.internalLinks` ist auf 120 Einträge gekürzt; die einzige Schwelle, die
  darauf schaut, liegt bei 25
- `sitemap.urls` enthält die ersten 40 Einträge, die echte Gesamtzahl steht in
  `sitemapUrlCount` und wird beim Laden wieder aufgefüllt

Alles, was in eine Dimension oder eine Kandidatenregel eingeht, ist unverändert.
Es sind Fixtures, kein Rohdatenarchiv: für eine frische Momentaufnahme neu
crawlen.

`index.json` listet die Fixture-Namen für den Test.
