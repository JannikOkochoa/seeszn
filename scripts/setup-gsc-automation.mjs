#!/usr/bin/env node
// ─── Vault-Konfiguration des GSC-Syncs setzen ─────────────────────────────────
// Hinterlegt Endpoint und Shared Secret des Cron-Endpunkts im Supabase Vault.
// Der Scheduler (pg_cron) liest beides von dort; die Werte stehen dadurch
// weder in einer Migration noch sonst im Repository.
//
// Aufruf:
//   node scripts/setup-gsc-automation.mjs
//   node scripts/setup-gsc-automation.mjs --endpoint https://staging.example/api/sync/gsc/cron
//
// Benötigt in der Umgebung (bzw. .env.local):
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SECRET_KEY      – service_role, nur dieser darf set_gsc_sync_config
//   GSC_SYNC_SECRET          – identisch zur Env der Production-App
//
// Mehrfach ausführbar: bestehende Vault-Einträge werden aktualisiert, nicht
// dupliziert. Es wird niemals ein Secret-Wert ausgegeben.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** .env.local nachladen, ohne echte Env-Variablen zu überschreiben. */
function loadEnvLocal() {
  const file = join(ROOT, ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!match) continue;
    const [, key, raw] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = raw.trim().replace(/^["']|["']$/g, "");
  }
}

/**
 * Production-URL des Cron-Endpunkts. Reihenfolge bewusst: ausdrückliches
 * Argument, dann die Deployment-Env, zuletzt die kanonische Domain aus
 * lib/seo.ts. Keine Platzhalter-Domain.
 */
function resolveEndpoint() {
  const argIndex = process.argv.indexOf("--endpoint");
  if (argIndex !== -1 && process.argv[argIndex + 1]) {
    return process.argv[argIndex + 1];
  }
  const fromEnv = process.env.GSC_SYNC_ENDPOINT;
  if (fromEnv) return fromEnv;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  // Localhost taugt nicht als Ziel für einen Scheduler in der Cloud.
  if (appUrl && !/localhost|127\.0\.0\.1/.test(appUrl)) {
    return `${appUrl.replace(/\/$/, "")}/api/sync/gsc/cron`;
  }

  const seo = readFileSync(join(ROOT, "lib", "seo.ts"), "utf8");
  const match = seo.match(/export const SITE_URL\s*=\s*"([^"]+)"/);
  if (!match) {
    throw new Error("Production-URL nicht ermittelbar: SITE_URL fehlt in lib/seo.ts.");
  }
  return `${match[1].replace(/\/$/, "")}/api/sync/gsc/cron`;
}

async function rpc(url, key, fn, args) {
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${fn} → HTTP ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SECRET_KEY;
const syncSecret = process.env.GSC_SYNC_SECRET;
const property = process.env.GOOGLE_GSC_PROPERTY?.replace(/^GOOGLE_GSC_PROPERTY=/, "").trim();

const missing = [
  ["NEXT_PUBLIC_SUPABASE_URL", supabaseUrl],
  ["SUPABASE_SECRET_KEY", serviceKey],
  ["GSC_SYNC_SECRET", syncSecret],
  ["GOOGLE_GSC_PROPERTY", property],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missing.length > 0) {
  console.error(`Fehlende Umgebungsvariablen: ${missing.join(", ")}`);
  process.exit(1);
}

const endpoint = resolveEndpoint();
if (!/^https:\/\//.test(endpoint)) {
  console.error(`Endpoint muss über HTTPS laufen, ist aber: ${endpoint}`);
  process.exit(1);
}

await rpc(supabaseUrl, serviceKey, "set_gsc_sync_config", {
  p_endpoint: endpoint,
  p_secret: syncSecret,
});

if (!/^(sc-domain:|https?:\/\/)/.test(property)) {
  console.error(`GOOGLE_GSC_PROPERTY muss mit "sc-domain:" oder "https://" beginnen, ist aber: ${property}`);
  process.exit(1);
}
await rpc(supabaseUrl, serviceKey, "set_gsc_property", { p_property: property });

const status = await rpc(supabaseUrl, serviceKey, "gsc_sync_config_status", {});
const row = Array.isArray(status) ? status[0] : status;

console.log("Vault-Konfiguration gesetzt.");
console.log(`  Endpoint          : ${row?.endpoint ?? "–"}`);
console.log(`  Secret hinterlegt : ${row?.secret_configured ? "ja" : "nein"}`);
console.log(`  GSC-Property      : ${row?.property ?? "–"}`);
console.log("Der Scheduler (pg_cron) liest beides zur Laufzeit; Werte bleiben im Vault.");
