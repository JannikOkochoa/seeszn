#!/usr/bin/env node
// ─── GSC-Export-Import (lokales Admin-Werkzeug) ───────────────────────────────
// Importiert die fünf privaten Search-Console-ZIP-Exporte aus
// private-imports/gsc/2026-07-13/ in das GSC-Import-Datenmodell
// (gsc_import_batches, gsc_scope_daily_metrics, gsc_dimension_snapshots,
// gsc_active_datasets). Läuft ausschließlich lokal; die ZIPs verlassen den
// Rechner nicht (kein Repo, kein Storage, keine API).
//
// Modi:
//   node --env-file=.env.local scripts/import-gsc-exports.mjs --validate-only
//     Nur lokale Validierung, kein Datenbankzugriff.
//   node --env-file=.env.local scripts/import-gsc-exports.mjs --dry-run
//     Validierung + Abgleich mit der Datenbank (Hash-Dedupe), keine Schreibzugriffe.
//   node --env-file=.env.local scripts/import-gsc-exports.mjs
//     Vollständiger Import mit atomarer Aktivierung je Scope.
//
// Sicherheit:
//   * nur die fünf erwarteten Dateien, feste Pfade, kein Path Traversal
//   * private-imports muss durch .gitignore ausgeschlossen sein (wird geprüft)
//   * Ziel nur localhost oder das freigegebene Dev-Projekt (Ref unten)
//   * Service Key nur aus der lokalen Env, nie im Repo
//   * ZIP-Bomb-Schutz über Größen-, Entry- und Zeilenlimits
//   * Audit-Event ohne Suchanfragen oder Kundendaten

import { createHash } from "node:crypto";
import { readFileSync, statSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { inflateRawSync } from "node:zlib";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";

/* ── Konfiguration ──────────────────────────────────────────────────────────── */

const ORG_SLUG = "kluehspies";
// Einziges freigegebenes Remote-Ziel (seeszn-kluehspies-dev). Kein Escape-Hatch.
const ALLOWED_PROJECT_REF = "rzbdbxgltbiutpxbyypv";
const IMPORT_DIR = path.join("private-imports", "gsc", "2026-07-13");
const DEFAULT_ACTOR_EMAIL = "jannik@seeszn.example.com";
const NEW_KPI_NAME = "Organische Klicks auf Städtereise-Produktseiten";
const KPI_METRIC_KEY = "organic_clicks_product_pages";

// Limits (die echten Dateien liegen bei ~10–50 KB).
const MAX_ZIP_BYTES = 5 * 1024 * 1024;
const MAX_ENTRY_BYTES = 20 * 1024 * 1024;
const MAX_TOTAL_UNCOMPRESSED = 40 * 1024 * 1024;
const MAX_ENTRIES = 16;
const MAX_CSV_ROWS = 100_000;
const CHUNK = 500;

/** Manifest: ausschließlich diese fünf Dateien, mit erwartetem Scope. */
export const MANIFEST = [
  {
    file: "sitewide.zip",
    scopeType: "sitewide",
    scopeValue: "https://www.klassenfahrten-kluehspies.de/",
    expectedPageFilter: null,
  },
  {
    file: "city-pages.zip",
    scopeType: "path_prefix",
    scopeValue: "/staedte-klassenfahrten/",
    expectedPageFilter: "/staedte-klassenfahrten/",
  },
  {
    file: "berlin.zip",
    scopeType: "product_page",
    scopeValue: "Berlin",
    expectedPageFilter: "/staedte-klassenfahrten/deutschland/berlin/",
  },
  {
    file: "hamburg.zip",
    scopeType: "product_page",
    scopeValue: "Hamburg",
    expectedPageFilter: "/staedte-klassenfahrten/deutschland/hamburg/",
  },
  {
    file: "muenchen.zip",
    scopeType: "product_page",
    scopeValue: "München",
    expectedPageFilter: "/staedte-klassenfahrten/deutschland/muenchen/",
  },
];

// Kontrollwerte (letzte 28 Tage bis zum letzten Exportdatum), fest an den
// SHA-256 der bekannten Dateien gebunden: reine Validierung, ersetzt nie die
// Berechnung und landet nie im Frontend oder in Seeds. Unbekannte Hashes
// (künftige Exporte) überspringen diese Kontrolle mit Hinweis.
const CONTROL_BY_HASH = {
  e5859862497dc95d7d4ca0e80797e7b8a9a11c67b7f7e9aa89e7141c8dc354db: { clicks: 2200, impressions: 209001 },
  "3bab3636fc0996eda57373ad816ceadb61ea75c9f1ffffe2a7177c4f04f0049d": { clicks: 82, impressions: 56292 },
  "0a3c35c7900b9736675a3f358b1e0515bbc858229e0b284b0333d18e8518708f": { clicks: 14, impressions: 8568 },
  ec7f1f19b5c10f07c6b59104fb90f5c89a064ffbcde9d1b115894eb6ab55e32e: { clicks: 6, impressions: 2247 },
  "4b0b6906ee758b6ca4b1b5db17ea3d83c3d35a1c1af293863e70f7b70a473f76": { clicks: 5, impressions: 2643 },
};

const REQUIRED_CSVS = ["Chart.csv", "Filters.csv", "Queries.csv", "Pages.csv", "Countries.csv", "Devices.csv"];
const OPTIONAL_CSVS = ["Search appearance.csv"];
const DIMENSION_FILES = {
  "Queries.csv": "query",
  "Pages.csv": "page",
  "Devices.csv": "device",
  "Countries.csv": "country",
  "Search appearance.csv": "search_appearance",
};

/* ── Kleine Helfer ──────────────────────────────────────────────────────────── */

const args = new Set(process.argv.slice(2).filter((a) => a.startsWith("--")));
const actorEmail =
  process.argv.slice(2).find((a) => a.startsWith("--actor-email="))?.split("=")[1] ??
  DEFAULT_ACTOR_EMAIL;
const VALIDATE_ONLY = args.has("--validate-only");
const DRY_RUN = args.has("--dry-run");

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function shortHash(hash) {
  return hash.slice(0, 12);
}

/* ── ZIP-Leser (nur Deflate/Store, mit Limits, ohne Shell) ──────────────────── */

export function readZip(buffer) {
  if (buffer.length > MAX_ZIP_BYTES) throw new Error(`ZIP größer als ${MAX_ZIP_BYTES} Bytes.`);
  // End of Central Directory suchen (Signatur 0x06054b50, von hinten).
  let eocd = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 22 - 65536); i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("Kein gültiges ZIP (End of Central Directory fehlt).");
  const entryCount = buffer.readUInt16LE(eocd + 10);
  const cdOffset = buffer.readUInt32LE(eocd + 16);
  if (entryCount > MAX_ENTRIES) throw new Error(`Zu viele ZIP-Einträge (${entryCount}).`);

  const entries = new Map();
  let offset = cdOffset;
  let totalUncompressed = 0;
  for (let i = 0; i < entryCount; i++) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) throw new Error("Beschädigtes Central Directory.");
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.subarray(offset + 46, offset + 46 + nameLength).toString("utf-8");

    // Path-Traversal- und Namensschutz: flache, erwartete CSV-Namen, sonst nichts.
    if (name.includes("/") || name.includes("\\") || name.includes("..")) {
      throw new Error(`Unerwarteter Pfad im ZIP: ${JSON.stringify(name)}`);
    }
    if (uncompressedSize > MAX_ENTRY_BYTES) throw new Error(`ZIP-Eintrag zu groß: ${name}`);
    totalUncompressed += uncompressedSize;
    if (totalUncompressed > MAX_TOTAL_UNCOMPRESSED) throw new Error("Entpackte Gesamtgröße über dem Limit.");

    // Lokalen Header lesen (Längen können dort abweichen).
    if (buffer.readUInt32LE(localOffset) !== 0x04034b50) throw new Error("Beschädigter lokaler ZIP-Header.");
    const lNameLength = buffer.readUInt16LE(localOffset + 26);
    const lExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + lNameLength + lExtraLength;
    const raw = buffer.subarray(dataStart, dataStart + compressedSize);
    let content;
    if (method === 0) content = Buffer.from(raw);
    else if (method === 8) content = inflateRawSync(raw, { maxOutputLength: MAX_ENTRY_BYTES });
    else throw new Error(`Nicht unterstützte ZIP-Kompression (${method}) für ${name}.`);
    if (content.length !== uncompressedSize) throw new Error(`Größen-Mismatch bei ${name}.`);
    entries.set(name, content.toString("utf-8"));

    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

/* ── CSV-Parser (RFC-4180-Quoting, BOM-tolerant) ────────────────────────────── */

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  const s = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && s[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += ch;
    if (rows.length > MAX_CSV_ROWS) throw new Error("CSV-Zeilenlimit überschritten.");
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.length > 1 || row[0] !== "") rows.push(row);
  }
  return rows;
}

/* ── Normalisierung ─────────────────────────────────────────────────────────── */

function parseIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`Ungültiges Datum: ${JSON.stringify(value)}`);
  return value;
}

function parseCount(value) {
  const n = Number(value.replace(/\./g, "").replace(",", "."));
  const plain = Number(value);
  // GSC exportiert Ganzzahlen ohne Tausendertrenner; im Zweifel der strikte Wert.
  const result = Number.isFinite(plain) ? plain : n;
  if (!Number.isFinite(result) || result < 0) throw new Error(`Ungültige Zahl: ${JSON.stringify(value)}`);
  return result;
}

/** "2.62%" oder "2,62 %" -> 0.0262 (Anteil, nicht Prozent). */
function parseCtr(value) {
  const cleaned = value.replace("%", "").replace(",", ".").trim();
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0 || n > 100) throw new Error(`Ungültige CTR: ${JSON.stringify(value)}`);
  return n / 100;
}

function parsePosition(value) {
  const n = Number(value.replace(",", "."));
  if (!Number.isFinite(n) || n < 0 || n > 500) throw new Error(`Ungültige Position: ${JSON.stringify(value)}`);
  return n;
}

function addDaysIso(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/* ── Validierung eines Exports ──────────────────────────────────────────────── */

export function validateExport(entry, zipEntries, fileHash) {
  const problems = [];
  const present = [...zipEntries.keys()];

  for (const required of REQUIRED_CSVS) {
    if (!zipEntries.has(required)) problems.push(`Pflichtdatei fehlt: ${required}`);
  }
  for (const name of present) {
    if (![...REQUIRED_CSVS, ...OPTIONAL_CSVS].includes(name)) {
      problems.push(`Unerwartete Datei im ZIP: ${name}`);
    }
  }
  if (problems.length > 0) return { problems };

  // Scope aus Filters.csv bestimmen und gegen das Manifest prüfen.
  const filters = parseCsv(zipEntries.get("Filters.csv")).slice(1);
  const pageFilter = filters.find(([k]) => k === "Page")?.[1] ?? null;
  const searchType = filters.find(([k]) => k === "Search type")?.[1] ?? null;
  if (searchType !== "Web") problems.push(`Unerwarteter Suchtyp: ${searchType}`);
  const normalizedPage = pageFilter ? pageFilter.replace(/^\+/, "") : null;
  if (entry.expectedPageFilter === null) {
    if (normalizedPage !== null) problems.push(`Sitewide-Export enthält Seitenfilter: ${normalizedPage}`);
  } else if (normalizedPage !== entry.expectedPageFilter) {
    problems.push(
      `Scope-Zuordnung falsch: erwartet ${entry.expectedPageFilter}, gefunden ${normalizedPage ?? "kein Filter"}`,
    );
  }

  // Chart.csv: tägliche Zeitreihe.
  const chart = parseCsv(zipEntries.get("Chart.csv"));
  const chartHeader = chart[0].map((h) => h.trim().toLowerCase());
  if (chartHeader.join(",") !== "date,clicks,impressions,ctr,position") {
    problems.push(`Unerwarteter Chart-Header: ${chart[0].join(",")}`);
  }
  const daily = [];
  const seenDates = new Set();
  for (const row of chart.slice(1)) {
    const date = parseIsoDate(row[0]);
    if (seenDates.has(date)) problems.push(`Doppelte Datumszeile: ${date}`);
    seenDates.add(date);
    const clicks = parseCount(row[1]);
    const impressions = parseCount(row[2]);
    const ctr = parseCtr(row[3]);
    const position = parsePosition(row[4]);
    if (clicks > impressions) problems.push(`${date}: clicks > impressions`);
    if (impressions > 0 && Math.abs(ctr - clicks / impressions) > 0.006) {
      problems.push(`${date}: CTR passt nicht zu Klicks/Impressionen`);
    }
    daily.push({ date, clicks, impressions, ctr, position });
  }
  daily.sort((a, b) => a.date.localeCompare(b.date));
  const periodStart = daily[0]?.date;
  const periodEnd = daily[daily.length - 1]?.date;
  if (!periodStart || !periodEnd) problems.push("Chart.csv enthält keine Datenzeilen.");
  const expectedDays =
    periodStart && periodEnd
      ? Math.round((Date.parse(`${periodEnd}T00:00:00Z`) - Date.parse(`${periodStart}T00:00:00Z`)) / 86_400_000) + 1
      : 0;
  if (daily.length !== expectedDays) {
    problems.push(`Zeitreihe lückenhaft: ${daily.length} Zeilen, erwartet ${expectedDays}.`);
  }

  // Dimensionstabellen: Aggregate über den GESAMTEN Exportzeitraum.
  const dimensions = [];
  for (const [fileName, dimensionType] of Object.entries(DIMENSION_FILES)) {
    if (!zipEntries.has(fileName)) continue;
    const rows = parseCsv(zipEntries.get(fileName));
    const seen = new Set();
    for (const row of rows.slice(1)) {
      const value = row[0];
      if (value === undefined || value === "") {
        problems.push(`${fileName}: leere Dimensionszeile`);
        continue;
      }
      if (seen.has(value)) problems.push(`${fileName}: doppelte Dimension ${JSON.stringify(value).slice(0, 40)}`);
      seen.add(value);
      dimensions.push({
        dimension_type: dimensionType,
        dimension_value: value,
        clicks: parseCount(row[1]),
        impressions: parseCount(row[2]),
        ctr: parseCtr(row[3]),
        position: parsePosition(row[4]),
      });
    }
  }

  // Hash-gebundene Kontrollsummen (letzte 28 Tage bis zum letzten Exporttag).
  const control = CONTROL_BY_HASH[fileHash];
  let controlNote = "Kontrollwerte: unbekannter Dateihash, Kontrolle übersprungen.";
  if (control && periodEnd) {
    const windowStart = addDaysIso(periodEnd, -27);
    const win = daily.filter((d) => d.date >= windowStart && d.date <= periodEnd);
    const clicks = win.reduce((a, d) => a + d.clicks, 0);
    const impressions = win.reduce((a, d) => a + d.impressions, 0);
    if (clicks !== control.clicks || impressions !== control.impressions) {
      problems.push(
        `Kontrollwerte verfehlt (28 Tage bis ${periodEnd}): ` +
          `clicks ${clicks} (soll ${control.clicks}), impressions ${impressions} (soll ${control.impressions})`,
      );
    } else {
      controlNote = `Kontrollwerte OK (28 Tage bis ${periodEnd}: ${clicks} Klicks, ${impressions} Impressionen)`;
    }
  }

  return { problems, daily, dimensions, periodStart, periodEnd, controlNote };
}

/* ── Hauptablauf ────────────────────────────────────────────────────────────── */

async function main() {
  // 1) private-imports muss gitignored sein (kein Weg in Commits/Builds).
  try {
    execFileSync("git", ["check-ignore", "-q", "private-imports"], { cwd: process.cwd() });
  } catch {
    fail("private-imports ist NICHT durch .gitignore ausgeschlossen. Abbruch.");
  }

  // 2) Dateien lokal validieren.
  const validated = [];
  for (const entry of MANIFEST) {
    const filePath = path.join(IMPORT_DIR, entry.file);
    if (!existsSync(filePath)) fail(`Datei fehlt: ${filePath}`);
    const size = statSync(filePath).size;
    if (size > MAX_ZIP_BYTES) fail(`${entry.file}: Datei zu groß (${size} B).`);
    const buffer = readFileSync(filePath);
    const fileHash = createHash("sha256").update(buffer).digest("hex");
    let zipEntries;
    try {
      zipEntries = readZip(buffer);
    } catch (error) {
      fail(`${entry.file}: ${error.message}`);
    }
    const result = validateExport(entry, zipEntries, fileHash);
    if (result.problems.length > 0) {
      console.error(`✗ ${entry.file}:`);
      for (const p of result.problems) console.error(`    ${p}`);
      process.exit(1);
    }
    validated.push({ ...entry, fileHash, ...result });
    console.log(
      `✓ ${entry.file} [${shortHash(fileHash)}] scope=${entry.scopeType}:${entry.scopeValue} ` +
        `Zeitraum ${result.periodStart}..${result.periodEnd} ` +
        `täglich=${result.daily.length} Dimensionen=${result.dimensions.length}`,
    );
    console.log(`    ${result.controlNote}`);
  }

  if (VALIDATE_ONLY) {
    console.log("\n--validate-only: Validierung abgeschlossen, kein Datenbankzugriff.");
    return;
  }

  // 3) Datenbank-Guard.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) fail("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY fehlen.");
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(url);
  const projectRef = url.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1] ?? null;
  if (!isLocal && projectRef !== ALLOWED_PROJECT_REF) {
    fail(`Ziel ${url} ist weder lokal noch das freigegebene Dev-Projekt (${ALLOWED_PROJECT_REF}).`);
  }

  const admin = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const org = await admin.from("organizations").select("id").eq("slug", ORG_SLUG).maybeSingle();
  if (org.error || !org.data) fail(`Organisation '${ORG_SLUG}' nicht gefunden.`);
  const organizationId = org.data.id;

  // Import nur durch SEESZN Admin: Actor muss seeszn_admin der Organisation sein.
  const actorProfile = await admin.from("profiles").select("id").eq("email", actorEmail).maybeSingle();
  if (actorProfile.error || !actorProfile.data) fail(`Actor-Profil nicht gefunden: ${actorEmail}`);
  const actorId = actorProfile.data.id;
  const actorMembership = await admin
    .from("memberships")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", actorId)
    .maybeSingle();
  if (actorMembership.data?.role !== "seeszn_admin") {
    fail(`${actorEmail} ist kein seeszn_admin dieser Organisation. Import verweigert.`);
  }

  const dataSource = await admin
    .from("data_sources")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("provider", "google_search_console")
    .maybeSingle();
  const dataSourceId = dataSource.data?.id ?? null;

  for (const item of validated) {
    const existing = await admin
      .from("gsc_import_batches")
      .select("id, status")
      .eq("organization_id", organizationId)
      .eq("file_hash", item.fileHash)
      .maybeSingle();
    if (existing.error) fail(`Batch-Abfrage fehlgeschlagen: ${existing.error.message}`);

    if (existing.data?.status === "imported") {
      console.log(`= ${item.file}: identischer Hash bereits importiert, No-op.`);
      if (!DRY_RUN) await activate(admin, organizationId, item, existing.data.id, actorId);
      continue;
    }

    if (DRY_RUN) {
      console.log(
        `→ ${item.file}: würde importieren (${item.daily.length} Tageszeilen, ` +
          `${item.dimensions.length} Dimensionszeilen)${existing.data ? ` und Batch ${existing.data.id} (${existing.data.status}) wiederverwenden` : ""}.`,
      );
      continue;
    }

    // Batch anlegen oder fehlgeschlagenen Batch wiederverwenden (Kinder löschen).
    let batchId;
    if (existing.data) {
      batchId = existing.data.id;
      const cleanupDaily = await admin.from("gsc_scope_daily_metrics").delete().eq("import_batch_id", batchId);
      const cleanupDims = await admin.from("gsc_dimension_snapshots").delete().eq("import_batch_id", batchId);
      if (cleanupDaily.error || cleanupDims.error) fail(`Aufräumen des fehlgeschlagenen Batch scheiterte.`);
      const reset = await admin
        .from("gsc_import_batches")
        .update({ status: "validating", error_message: null, metadata: { retried: true } })
        .eq("id", batchId);
      if (reset.error) fail(`Batch-Reset fehlgeschlagen: ${reset.error.message}`);
    } else {
      const inserted = await admin
        .from("gsc_import_batches")
        .insert({
          organization_id: organizationId,
          data_source_id: dataSourceId,
          file_hash: item.fileHash,
          original_file_name: item.file,
          scope_type: item.scopeType,
          scope_value: item.scopeValue,
          period_start: item.periodStart,
          period_end: item.periodEnd,
          imported_by: actorId,
          status: "validating",
        })
        .select("id")
        .single();
      if (inserted.error) fail(`Batch-Anlage fehlgeschlagen: ${inserted.error.message}`);
      batchId = inserted.data.id;
    }

    const markFailed = async (message) => {
      await admin
        .from("gsc_import_batches")
        .update({ status: "failed", error_message: message.slice(0, 500) })
        .eq("id", batchId);
      fail(`${item.file}: ${message} (Batch ${batchId} als failed markiert, aktiver Datensatz unverändert.)`);
    };

    // Tageswerte und Dimensions-Snapshots einfügen (unsichtbar bis Aktivierung).
    const dailyRows = item.daily.map((d) => ({
      organization_id: organizationId,
      import_batch_id: batchId,
      scope_type: item.scopeType,
      scope_value: item.scopeValue,
      ...d,
    }));
    for (let i = 0; i < dailyRows.length; i += CHUNK) {
      const chunk = await admin.from("gsc_scope_daily_metrics").insert(dailyRows.slice(i, i + CHUNK));
      if (chunk.error) return markFailed(`Tageswerte-Insert fehlgeschlagen: ${chunk.error.message}`);
    }
    const dimensionRows = item.dimensions.map((d) => ({
      organization_id: organizationId,
      import_batch_id: batchId,
      scope_type: item.scopeType,
      scope_value: item.scopeValue,
      period_start: item.periodStart,
      period_end: item.periodEnd,
      ...d,
    }));
    for (let i = 0; i < dimensionRows.length; i += CHUNK) {
      const chunk = await admin.from("gsc_dimension_snapshots").insert(dimensionRows.slice(i, i + CHUNK));
      if (chunk.error) return markFailed(`Dimensions-Insert fehlgeschlagen: ${chunk.error.message}`);
    }

    // Summen gegen die Datenbank verifizieren, bevor irgendetwas aktiv wird.
    // Bewusst clientseitig summiert (487 Zeilen je Export, unter dem API-Limit).
    const check = await admin
      .from("gsc_scope_daily_metrics")
      .select("clicks, impressions")
      .eq("import_batch_id", batchId)
      .limit(1000);
    if (check.error) return markFailed(`Verifikation fehlgeschlagen: ${check.error.message}`);
    const dbCount = check.data.length;
    const dbClicks = check.data.reduce((a, r) => a + Number(r.clicks), 0);
    const dbImpressions = check.data.reduce((a, r) => a + Number(r.impressions), 0);
    const csvClicks = item.daily.reduce((a, d) => a + d.clicks, 0);
    const csvImpressions = item.daily.reduce((a, d) => a + d.impressions, 0);
    if (dbCount !== item.daily.length) {
      return markFailed(`Zeilenzahl weicht ab: DB ${dbCount}, CSV ${item.daily.length}`);
    }
    if (dbClicks !== csvClicks || dbImpressions !== csvImpressions) {
      return markFailed(
        `Summen weichen ab: DB ${dbClicks}/${dbImpressions}, CSV ${csvClicks}/${csvImpressions}`,
      );
    }

    const done = await admin
      .from("gsc_import_batches")
      .update({
        status: "imported",
        imported_at: new Date().toISOString(),
        row_counts: {
          daily: item.daily.length,
          dimensions: item.dimensions.length,
        },
      })
      .eq("id", batchId);
    if (done.error) return markFailed(`Statuswechsel fehlgeschlagen: ${done.error.message}`);

    await activate(admin, organizationId, item, batchId, actorId);

    // Audit ohne Suchanfragen oder Kundendaten.
    await admin.from("audit_events").insert({
      organization_id: organizationId,
      actor_id: actorId,
      entity_type: "gsc_import_batch",
      entity_id: batchId,
      action: "gsc.export_imported",
      metadata: {
        scope_type: item.scopeType,
        scope_value: item.scopeValue,
        period_start: item.periodStart,
        period_end: item.periodEnd,
        file_hash: shortHash(item.fileHash),
        daily_rows: item.daily.length,
        dimension_rows: item.dimensions.length,
        activated: true,
      },
    });

    console.log(`✓ ${item.file}: importiert und aktiviert (Batch ${batchId}).`);
  }

  if (DRY_RUN) {
    console.log("\n--dry-run: keine Schreibzugriffe ausgeführt.");
    return;
  }

  // Primären KPI fachlich umbenennen (idempotent, protokolliert).
  const kpi = await admin
    .from("kpi_definitions")
    .select("id, name")
    .eq("organization_id", organizationId)
    .eq("metric_key", KPI_METRIC_KEY)
    .maybeSingle();
  if (kpi.data && kpi.data.name !== NEW_KPI_NAME) {
    const rename = await admin.from("kpi_definitions").update({ name: NEW_KPI_NAME }).eq("id", kpi.data.id);
    if (!rename.error) {
      await admin.from("audit_events").insert({
        organization_id: organizationId,
        actor_id: actorId,
        entity_type: "kpi_definition",
        entity_id: kpi.data.id,
        action: "kpi.renamed",
        metadata: { to: NEW_KPI_NAME },
      });
      console.log(`✓ KPI umbenannt: „${NEW_KPI_NAME}“`);
    }
  }

  console.log("\nFertig. Aktive Datensätze zeigen ausschließlich auf importierte Batches.");
}

/** Aktivierung: ein einzelner Upsert je Scope = atomarer Umschaltpunkt. */
async function activate(admin, organizationId, item, batchId, actorId) {
  const existing = await admin
    .from("gsc_active_datasets")
    .select("id, import_batch_id")
    .eq("organization_id", organizationId)
    .eq("scope_type", item.scopeType)
    .eq("scope_value", item.scopeValue)
    .maybeSingle();
  if (existing.error) fail(`Aktivierungs-Abfrage fehlgeschlagen: ${existing.error.message}`);

  if (existing.data?.import_batch_id === batchId) return;

  if (existing.data) {
    const updated = await admin
      .from("gsc_active_datasets")
      .update({ import_batch_id: batchId, activated_at: new Date().toISOString(), activated_by: actorId })
      .eq("id", existing.data.id);
    if (updated.error) fail(`Aktivierung fehlgeschlagen: ${updated.error.message}`);
  } else {
    const inserted = await admin.from("gsc_active_datasets").insert({
      organization_id: organizationId,
      scope_type: item.scopeType,
      scope_value: item.scopeValue,
      import_batch_id: batchId,
      activated_by: actorId,
    });
    if (inserted.error) fail(`Aktivierung fehlgeschlagen: ${inserted.error.message}`);
  }
}

// Nur bei direktem Aufruf laufen; Tests importieren die reinen Funktionen.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
