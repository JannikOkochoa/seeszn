// ─── Tests: die Backlink-Mengenstufen ─────────────────────────────────────────
// Der Stückpreis entsteht nicht mehr aus einer Kurve durch Ankerpunkte, sondern
// aus festen Mengenstufen. Wählbar bleibt jede ganze Menge, deshalb bleiben zwei
// Eigenschaften prüfbedürftig und werden hier für JEDE Menge geprüft, nicht an
// Stichproben:
//
//   1. Der Gesamtpreis steigt streng. Wer eine Einheit mehr kauft, zahlt
//      insgesamt mehr. Andernfalls gäbe es eine Menge, die günstiger ist als
//      eine kleinere, und das ist ein Fehler im Katalog.
//   2. Der Stückpreis steigt nie. Er fällt nur an einer Stufenschwelle und
//      bleibt innerhalb einer Stufe konstant.
//
// Eigenschaft 1 folgt NICHT aus Eigenschaft 2. Fällt der Stückpreis an einer
// Schwelle zu stark, wird der Gesamtpreis dort billiger, obwohl die Menge
// steigt. Genau dieser Fall hat die alte Staffel unbrauchbar gemacht
// (49 × 17,50 € = 857,50 € gegen 50 × 16,98 € = 849,00 €) und wird hier
// ausdrücklich ausgeschlossen.
//
// Zusätzlich geprüft: der Stückpreis wechselt ausschließlich an den definierten
// Schwellen, nirgendwo sonst.

import assert from "node:assert/strict";

// Die Stufenwerte stehen hier bewusst noch einmal als unabhängige Kopie. Ein
// Test, der seine Erwartung aus derselben Datei liest wie die Implementierung,
// prüft nur, dass eine Datei sich selbst gleicht.
const ONCE_TIERS = [
  [5, 1980],
  [10, 1790],
  [20, 1775],
  [30, 1750],
  [50, 1720],
  [75, 1700],
  [100, 1690],
];
const MONTHLY_TIERS = [
  [10, 1610],
  [20, 1595],
  [30, 1575],
  [50, 1545],
  [75, 1525],
  [100, 1520],
];

/** Der erwartete Stückpreis aus der unabhängigen Kopie oben. */
const expectedUnit = (tiers, q) => {
  let unit = tiers[0][1];
  for (const [from, cents] of tiers) if (q >= from) unit = cents;
  return unit;
};

const backlinks = await import("../lib/moves/backlinks.ts");
const { priceFor, MIN_QUANTITY, MAX_SELF_SERVICE, MIN_TERM_MONTHS, anchorQuantities } = backlinks;

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok    ${name}`);
  } catch (err) {
    failures++;
    console.log(`  FAIL  ${name}\n        ${err.message}`);
  }
};

// ── Grenzen ──────────────────────────────────────────────────────────────────
check("Einmalig beginnt bei 5", () => {
  assert.equal(MIN_QUANTITY.once, 5);
  assert.equal(priceFor(4, "once"), null);
  assert.ok(priceFor(5, "once"));
});

check("Monatlich beginnt bei 10", () => {
  assert.equal(MIN_QUANTITY.monthly, 10);
  assert.equal(priceFor(9, "monthly"), null);
  assert.ok(priceFor(10, "monthly"));
});

check("Selbstbedienung endet bei 100", () => {
  assert.equal(MAX_SELF_SERVICE, 100);
  assert.ok(priceFor(100, "once"));
  assert.equal(priceFor(101, "once"), null, "101 darf keinen berechneten Preis haben");
  assert.equal(priceFor(140, "monthly"), null, "über 100 rechnet die Seite nicht");
});

check("Keine Bruchmengen", () => {
  assert.equal(priceFor(17.5, "once"), null);
});

// ── Die beiden Staffeleigenschaften, über jede ganze Menge ───────────────────
for (const [mode, tiers, min] of [
  ["once", ONCE_TIERS, 5],
  ["monthly", MONTHLY_TIERS, 10],
]) {
  check(`${mode}: ${min} bis 100 vollständig, Gesamtpreis steigt streng`, () => {
    let previous = null;
    for (let q = min; q <= 100; q++) {
      const p = priceFor(q, mode);
      assert.ok(p, `Menge ${q} hat keinen Preis`);
      assert.ok(p.totalCents > 0, `Menge ${q}: Gesamtpreis nicht positiv`);
      assert.ok(p.unitCents > 0, `Menge ${q}: Stückpreis nicht positiv`);
      if (previous) {
        assert.ok(
          p.totalCents > previous.totalCents,
          `Menge ${q}: Gesamtpreis ${p.totalCents} nicht größer als ${previous.totalCents} bei ${q - 1}`,
        );
        assert.ok(
          p.unitCents <= previous.unitCents,
          `Menge ${q}: Stückpreis ${p.unitCents} höher als ${previous.unitCents} bei ${q - 1}`,
        );
      }
      previous = p;
    }
  });

  check(`${mode}: Stückpreis stimmt mit der Stufentabelle überein`, () => {
    for (let q = min; q <= 100; q++) {
      assert.equal(
        priceFor(q, mode).unitCents,
        expectedUnit(tiers, q),
        `Menge ${q}: falscher Stufenpreis`,
      );
    }
  });

  check(`${mode}: Stückpreis wechselt nur an den Schwellen`, () => {
    const thresholds = new Set(tiers.map(([from]) => from));
    for (let q = min + 1; q <= 100; q++) {
      const changed = priceFor(q, mode).unitCents !== priceFor(q - 1, mode).unitCents;
      if (changed) {
        assert.ok(thresholds.has(q), `Menge ${q}: Stückpreis wechselt außerhalb einer Schwelle`);
      } else {
        assert.ok(!thresholds.has(q), `Menge ${q}: Schwelle ohne Preiswechsel`);
      }
    }
  });

  check(`${mode}: Gesamtpreis ist immer Menge × angezeigtem Stückpreis`, () => {
    for (let q = min; q <= 100; q++) {
      const p = priceFor(q, mode);
      assert.equal(p.totalCents, p.unitCents * q, `Menge ${q}: ${p.unitCents} × ${q} ≠ ${p.totalCents}`);
    }
  });

  check(`${mode}: die Reglermarken sind die Stufenschwellen`, () => {
    assert.deepEqual([...anchorQuantities(mode)], tiers.map(([from]) => from));
  });
}

// ── Die abgestimmten Sollwerte ───────────────────────────────────────────────
check("Sollwerte einmalig stimmen auf den Cent", () => {
  const expected = {
    5: [1980, 9900],
    6: [1980, 11880],
    7: [1980, 13860],
    8: [1980, 15840],
    9: [1980, 17820],
    10: [1790, 17900],
    19: [1790, 34010],
    20: [1775, 35500],
    29: [1775, 51475],
    30: [1750, 52500],
    49: [1750, 85750],
    50: [1720, 86000],
    74: [1720, 127280],
    75: [1700, 127500],
    99: [1700, 168300],
    100: [1690, 169000],
  };
  for (const [q, [unit, total]] of Object.entries(expected)) {
    const p = priceFor(Number(q), "once");
    assert.equal(p.unitCents, unit, `Menge ${q}: Stückpreis ${p.unitCents} statt ${unit}`);
    assert.equal(p.totalCents, total, `Menge ${q}: Gesamtpreis ${p.totalCents} statt ${total}`);
  }
});

// ── Die Schwellen aus der Vorgabe, einzeln ───────────────────────────────────
check("an jeder Schwelle steigt der Gesamtpreis und fällt der Stückpreis", () => {
  for (const q of [10, 20, 30, 50, 75, 100]) {
    const before = priceFor(q - 1, "once");
    const after = priceFor(q, "once");
    assert.ok(
      after.totalCents > before.totalCents,
      `einmalig ${q - 1} → ${q}: Gesamtpreis fällt (${before.totalCents} → ${after.totalCents})`,
    );
    assert.ok(
      after.unitCents < before.unitCents,
      `einmalig ${q - 1} → ${q}: Stückpreis fällt nicht`,
    );
  }
  for (const q of [20, 30, 50, 75, 100]) {
    const before = priceFor(q - 1, "monthly");
    const after = priceFor(q, "monthly");
    assert.ok(
      after.totalCents > before.totalCents,
      `monatlich ${q - 1} → ${q}: Gesamtpreis fällt (${before.totalCents} → ${after.totalCents})`,
    );
    assert.ok(after.unitCents < before.unitCents, `monatlich ${q - 1} → ${q}: Stückpreis fällt nicht`);
  }
});

// ── Mindestlaufzeit ──────────────────────────────────────────────────────────
check("Mindestlaufzeit sind drei Monate", () => {
  assert.equal(MIN_TERM_MONTHS, 3);
});

// Die Mindestbindung als angezeigter Betrag ist entfallen. Der Rechenweg dafür
// existiert nicht mehr, und kein Modul darf ihn wieder einführen.
check("es gibt keine Mindestbindungs-Rechnung mehr", () => {
  assert.equal(
    backlinks.minimumCommitmentCents,
    undefined,
    "minimumCommitmentCents ist wieder da: die Mindestbindung darf nicht zurückkehren",
  );
});

// ── Monatlich ist immer günstiger als derselbe Einmalkauf ────────────────────
check("Monatspreis liegt unter dem Einmalpreis derselben Menge", () => {
  for (let q = 10; q <= 100; q++) {
    const m = priceFor(q, "monthly");
    const o = priceFor(q, "once");
    assert.ok(m.unitCents < o.unitCents, `Menge ${q}: Stückpreis monatlich nicht unter einmalig`);
    assert.ok(m.totalCents < o.totalCents, `Menge ${q}: monatlich ${m.totalCents} nicht unter ${o.totalCents}`);
    assert.ok(m.savingCents > 0, `Menge ${q}: keine Ersparnis ausgewiesen`);
    assert.equal(m.savingCents, o.totalCents - m.totalCents, `Menge ${q}: Ersparnis falsch`);
  }
});


// ─── Manuelle Mengeneingabe ────────────────────────────────────────────────
const { parseManualQuantity } = await import("../lib/moves/backlinks.ts");

const casesOnce = [
  ["5", { kind: "valid", quantity: 5 }],
  ["6", { kind: "valid", quantity: 6 }],
  ["17", { kind: "valid", quantity: 17 }],
  ["40", { kind: "valid", quantity: 40 }],
  ["76", { kind: "valid", quantity: 76 }],
  ["99", { kind: "valid", quantity: 99 }],
  ["100", { kind: "valid", quantity: 100 }],
  ["", { kind: "invalid" }],
  ["0", { kind: "valid", quantity: 5 }],
  ["1", { kind: "valid", quantity: 5 }],
  ["4", { kind: "valid", quantity: 5 }],
  ["101", { kind: "custom", requested: 101 }],
  ["150", { kind: "custom", requested: 150 }],
  ["999", { kind: "custom", requested: 999 }],
  ["-1", { kind: "valid", quantity: 5 }],
  ["17.5", { kind: "invalid" }],
  ["abc", { kind: "invalid" }],
  [" ", { kind: "invalid" }],
  ["17 ", { kind: "valid", quantity: 17 }],
  [" 17", { kind: "valid", quantity: 17 }],
];

check("manuelle Menge, einmalig: alle §58-Testfälle", () => {
  for (const [input, expected] of casesOnce) {
    const got = parseManualQuantity(input, "once");
    assert.deepEqual(got, expected, `Eingabe ${JSON.stringify(input)}: ${JSON.stringify(got)} statt ${JSON.stringify(expected)}`);
  }
});

check("manuelle Menge, monatlich: Mindestmenge 10, sonst gleiche Regeln", () => {
  assert.deepEqual(parseManualQuantity("9", "monthly"), { kind: "valid", quantity: 10 });
  assert.deepEqual(parseManualQuantity("10", "monthly"), { kind: "valid", quantity: 10 });
  assert.deepEqual(parseManualQuantity("17", "monthly"), { kind: "valid", quantity: 17 });
  assert.deepEqual(parseManualQuantity("100", "monthly"), { kind: "valid", quantity: 100 });
  assert.deepEqual(parseManualQuantity("101", "monthly"), { kind: "custom", requested: 101 });
});

console.log(
  failures === 0
    ? "\nMANUELLE MENGENEINGABE: ALLE TESTS BESTANDEN"
    : `\nMANUELLE MENGENEINGABE: ${failures} TEST(S) FEHLGESCHLAGEN`,
);
process.exit(failures === 0 ? 0 : 1);
