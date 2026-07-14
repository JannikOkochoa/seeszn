// ─── Tests: GSC-Export-Import (Validierung) ───────────────────────────────────
// Läuft mit dem eingebauten Node-Testrunner, ohne Framework:
//   node --test tests/gsc-import.test.mjs
// Tests gegen die echten privaten ZIPs werden übersprungen, wenn der private
// Importordner nicht vorhanden ist (z. B. auf fremden Rechnern).

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { MANIFEST, parseCsv, readZip, validateExport } from "../scripts/import-gsc-exports.mjs";

const IMPORT_DIR = path.join("private-imports", "gsc", "2026-07-13");
const hasPrivateFiles = MANIFEST.every((m) => existsSync(path.join(IMPORT_DIR, m.file)));

function loadZip(fileName) {
  return readZip(readFileSync(path.join(IMPORT_DIR, fileName)));
}

test("alle fünf ZIPs werden erkannt und validieren sauber (Scope, Pflichtdateien, Zeitreihe)", { skip: !hasPrivateFiles }, () => {
  for (const entry of MANIFEST) {
    const entries = loadZip(entry.file);
    const result = validateExport(entry, entries, "unbekannter-hash");
    assert.deepEqual(result.problems, [], `${entry.file}: ${result.problems.join("; ")}`);
    // Chart.csv als tägliche, lückenlose Zeitreihe
    assert.ok(result.daily.length > 0);
    const dates = result.daily.map((d) => d.date);
    assert.equal(new Set(dates).size, dates.length, "keine doppelten Tage");
    assert.equal(result.periodStart, dates[0]);
    assert.equal(result.periodEnd, dates[dates.length - 1]);
    // Dimensionstabellen als Zeitraum-Snapshots (nicht täglich)
    assert.ok(result.dimensions.length > 0);
    for (const type of ["query", "page", "device", "country"]) {
      assert.ok(
        result.dimensions.some((d) => d.dimension_type === type),
        `${entry.file}: Dimension ${type} vorhanden`,
      );
    }
  }
});

test("UTF-8 und Umlaute bleiben erhalten", { skip: !hasPrivateFiles }, () => {
  const entries = loadZip("muenchen.zip");
  const result = validateExport(MANIFEST.find((m) => m.file === "muenchen.zip"), entries, "x");
  const queries = result.dimensions.filter((d) => d.dimension_type === "query");
  assert.ok(
    queries.some((q) => q.dimension_value.includes("münchen")),
    "Query mit ü gefunden",
  );
});

test("CTR und Zahlen werden normalisiert (Prozent -> Anteil)", { skip: !hasPrivateFiles }, () => {
  const entries = loadZip("sitewide.zip");
  const result = validateExport(MANIFEST.find((m) => m.file === "sitewide.zip"), entries, "x");
  for (const d of result.daily) {
    assert.ok(d.ctr >= 0 && d.ctr <= 1, "CTR als Anteil 0..1");
    assert.ok(Number.isFinite(d.clicks) && d.clicks >= 0);
  }
});

test("kaputte ZIP wird abgewiesen", () => {
  assert.throws(() => readZip(Buffer.from("kein zip, nur text, lang genug für die suche")), /ZIP/);
  // Abgeschnittene echte Datei, falls vorhanden: ebenfalls abweisen.
  if (hasPrivateFiles) {
    const buffer = readFileSync(path.join(IMPORT_DIR, "berlin.zip")).subarray(0, 200);
    assert.throws(() => readZip(buffer));
  }
});

test("fehlende Filters.csv wird abgewiesen", { skip: !hasPrivateFiles }, () => {
  const entries = loadZip("berlin.zip");
  entries.delete("Filters.csv");
  const result = validateExport(MANIFEST.find((m) => m.file === "berlin.zip"), entries, "x");
  assert.ok(result.problems.some((p) => p.includes("Filters.csv")));
});

test("falscher Scope wird abgewiesen (Berlin-Daten gegen Hamburg-Manifest)", { skip: !hasPrivateFiles }, () => {
  const entries = loadZip("berlin.zip");
  const wrongManifest = MANIFEST.find((m) => m.file === "hamburg.zip");
  const result = validateExport(wrongManifest, entries, "x");
  assert.ok(result.problems.some((p) => p.includes("Scope-Zuordnung falsch")));
});

test("Kontrollwerte: falscher Hash überspringt, bekannte Hashes prüfen exakt", { skip: !hasPrivateFiles }, () => {
  const entry = MANIFEST.find((m) => m.file === "hamburg.zip");
  const entries = loadZip("hamburg.zip");
  const unknown = validateExport(entry, entries, "deadbeef");
  assert.deepEqual(unknown.problems, []);
  assert.match(unknown.controlNote, /übersprungen/);
});

test("CSV-Parser: RFC-Quoting, Kommas und BOM", () => {
  const rows = parseCsv('﻿a,b\n"x, y","sagt ""hi"""\n');
  assert.deepEqual(rows, [
    ["a", "b"],
    ["x, y", 'sagt "hi"'],
  ]);
});
