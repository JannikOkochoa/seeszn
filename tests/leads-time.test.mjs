// ─── Tests: Wiedervorlage-Zeiten (lib/leads/time.ts) ─────────────────────────
// Läuft mit dem eingebauten Node-Testrunner und Type-Stripping:
//   node --test --experimental-strip-types tests/leads-time.test.mjs
//
// Der Punkt dieser Tests: das CRM zeigt Zeitpunkte in Europe/Berlin an, das
// Eingabefeld liefert aber eine nackte Ortszeit. Beide Richtungen müssen
// unabhängig von der Zeitzone des ausführenden Rechners stimmen — sonst
// verschiebt sich jede Wiedervorlage zwischen Entwicklungsrechner und Server.

import test from "node:test";
import assert from "node:assert/strict";
import { berlinInputToIso, isoToBerlinInput } from "../lib/leads/time.ts";

test("Sommerzeit: 10:30 Berlin sind 08:30 UTC", () => {
  assert.equal(berlinInputToIso("2026-09-15T10:30"), "2026-09-15T08:30:00.000Z");
});

test("Winterzeit: 10:30 Berlin sind 09:30 UTC", () => {
  assert.equal(berlinInputToIso("2026-01-15T10:30"), "2026-01-15T09:30:00.000Z");
});

test("Rückweg zeigt dieselbe Ortszeit", () => {
  assert.equal(isoToBerlinInput("2026-09-15T08:30:00.000Z"), "2026-09-15T10:30");
  assert.equal(isoToBerlinInput("2026-01-15T09:30:00.000Z"), "2026-01-15T10:30");
});

test("Hin und zurück bleibt stabil", () => {
  for (const local of ["2026-03-29T04:00", "2026-06-01T12:00", "2026-10-25T04:00", "2026-12-24T18:45"]) {
    const iso = berlinInputToIso(local);
    assert.ok(iso, `kein ISO für ${local}`);
    assert.equal(isoToBerlinInput(iso), local, `Rundlauf für ${local}`);
  }
});

test("Unbrauchbare Eingaben ergeben null", () => {
  for (const bad of ["", "morgen", "2026-09-15", "15.09.2026 10:30", "2026-13-45T99:99"]) {
    assert.equal(berlinInputToIso(bad), null, `sollte null sein: ${bad}`);
  }
});

test("Leerer oder kaputter Zeitpunkt ergibt leeres Feld", () => {
  assert.equal(isoToBerlinInput(null), "");
  assert.equal(isoToBerlinInput("keine Zeit"), "");
});
