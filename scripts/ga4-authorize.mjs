#!/usr/bin/env node
// ─── GA4-Autorisierung: Consent-Link erzeugen und Code eintauschen ────────────
// Google verlangt für analytics.readonly eine einmalige menschliche Zustimmung.
// Alles davor und alles danach läuft hier ab; der Mensch klickt genau einmal.
//
//   1) Link erzeugen:
//        node scripts/ga4-authorize.mjs
//   2) Nach der Zustimmung landet der Browser auf dem OAuth-Playground.
//      Die komplette URL aus der Adresszeile (oder nur den code-Parameter)
//      hierher zurückgeben:
//        node scripts/ga4-authorize.mjs --code "<URL oder Code>"
//
// Der Refresh Token wird ausschließlich serverseitig eingetauscht und direkt
// im Supabase Vault abgelegt. Er wird nie ausgegeben, nie protokolliert und
// landet nie im Repository.
//
// Warum der OAuth-Playground als Redirect-Ziel: Diese URI ist beim
// vorhandenen Google-OAuth-Client bereits registriert (geprüft). Jede andere
// URI müsste erst manuell in der Google Cloud Console eingetragen werden — ein
// zusätzlicher manueller Schritt, der so entfällt. Der Playground zeigt den
// Autorisierungscode lediglich an; eingetauscht wird er hier.
//
// Der bestehende Search-Console-Token bleibt unangetastet. Der neue Token
// trägt beide Read-only-Scopes, damit die Google-Anbindung nicht unnötig
// fragmentiert.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const REDIRECT_URI = "https://developers.google.com/oauthplayground";
export const SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/webmasters.readonly",
];

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

/** Env-Wert bereinigen (Hosting-Oberflächen kopieren gern "NAME=wert"). */
function envValue(name) {
  const raw = process.env[name];
  if (!raw) return undefined;
  let value = raw.trim().replace(/^["']|["']$/g, "");
  if (value.startsWith(`${name}=`)) value = value.slice(name.length + 1).trim();
  return value || undefined;
}

async function rpc(fn, args) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${fn} → HTTP ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

/** Der Code steckt entweder blank oder als code-Parameter in einer URL. */
function extractCode(input) {
  const trimmed = input.trim().replace(/^["']|["']$/g, "");
  if (trimmed.startsWith("http")) {
    const code = new URL(trimmed).searchParams.get("code");
    if (!code) throw new Error("In der übergebenen URL steckt kein code-Parameter.");
    return code;
  }
  return trimmed;
}

function buildConsentUrl(clientId) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPES.join(" "),
    // offline + consent erzwingt einen Refresh Token, auch wenn dieses Konto
    // der App schon einmal zugestimmt hat.
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/* ── Ablauf ─────────────────────────────────────────────────────────────────── */

loadEnvLocal();

const clientId = envValue("GA4_CLIENT_ID") ?? envValue("GOOGLE_GSC_CLIENT_ID");
const clientSecret = envValue("GA4_CLIENT_SECRET") ?? envValue("GOOGLE_GSC_CLIENT_SECRET");
if (!clientId || !clientSecret) {
  console.error("GOOGLE_GSC_CLIENT_ID / GOOGLE_GSC_CLIENT_SECRET fehlen.");
  process.exit(1);
}

const codeIndex = process.argv.indexOf("--code");
const propertyIndex = process.argv.indexOf("--property");

// Nachträgliche Property-Auswahl: Der Autorisierungscode ist einmalig gültig,
// die Auswahl darf ihn deshalb nicht erneut brauchen.
if (codeIndex === -1 && propertyIndex !== -1 && process.argv[propertyIndex + 1]) {
  await rpc("set_ga4_property_id", { p_property_id: process.argv[propertyIndex + 1] });
  const st = await rpc("ga4_config_status", {});
  const r = Array.isArray(st) ? st[0] : st;
  console.log(`Property-ID gesetzt: ${r?.property_id}`);
  console.log(`Token bereits hinterlegt: ${r?.token_configured ? "ja" : "nein"}`);
  process.exit(0);
}

if (codeIndex === -1) {
  console.log("Consent-Link (einmalig im Browser öffnen, richtiges Google-Konto wählen, Zugriff bestätigen):\n");
  console.log(buildConsentUrl(clientId));
  console.log("\nDanach die Adresszeile zurückgeben:");
  console.log('  node scripts/ga4-authorize.mjs --code "<URL aus der Adresszeile>"');
  process.exit(0);
}

const code = extractCode(process.argv[codeIndex + 1] ?? "");
if (!code) {
  console.error("Kein Code übergeben.");
  process.exit(1);
}

// 1) Code gegen Tokens tauschen – ausschließlich hier, nie im Browser.
const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
  }),
});
const token = await tokenRes.json();
if (!tokenRes.ok || !token.refresh_token) {
  console.error(`Token-Tausch fehlgeschlagen (HTTP ${tokenRes.status}): ${token.error ?? "unbekannt"}`);
  if (token.error === "invalid_grant") {
    console.error("Der Code ist abgelaufen oder wurde bereits benutzt. Bitte den Link erneut öffnen.");
  }
  if (tokenRes.ok && !token.refresh_token) {
    console.error("Google hat keinen Refresh Token geliefert. Link mit prompt=consent erneut öffnen.");
  }
  process.exit(1);
}

// 2) Token SOFORT sichern – vor jeder weiteren Prüfung.
//    Der Autorisierungscode ist einmalig gültig. Schlägt irgendetwas danach
//    fehl (eine nicht freigeschaltete API, ein Netzwerkfehler), ist der Token
//    ohne diesen Schritt unwiederbringlich weg und die Zustimmung muss erneut
//    eingeholt werden. Genau das ist hier einmal passiert.
await rpc("set_ga4_refresh_token", { p_refresh_token: token.refresh_token });
console.log("Refresh Token im Supabase Vault gesichert.\n");

// 3) Scopes prüfen: lieber jetzt scheitern als bei der ersten Abfrage.
const granted = String(token.scope ?? "").split(/\s+/).filter(Boolean);
const missingScopes = SCOPES.filter((s) => !granted.includes(s));
console.log("Gewährte Scopes:");
for (const s of granted) console.log(`  · ${s}`);
if (missingScopes.includes("https://www.googleapis.com/auth/analytics.readonly")) {
  console.error("\nanalytics.readonly wurde NICHT gewährt. Ohne diesen Scope ist GA4 nicht abrufbar.");
  process.exit(1);
}
if (missingScopes.length > 0) {
  console.log(`\nHinweis: nicht gewährt: ${missingScopes.join(", ")}`);
  console.log("Die Search Console läuft unverändert über ihren eigenen, bestehenden Token weiter.");
}

// 4) Properties auflisten, auf die dieses Konto Zugriff hat.
//    Ab hier darf nichts mehr hart abbrechen: der Token liegt bereits sicher,
//    alles Weitere ist nachholbar.
const ENABLE_URL =
  "https://console.cloud.google.com/flows/enableapi?apiid=analyticsadmin.googleapis.com,analyticsdata.googleapis.com&project=550529285709";

const admin = async (path) => {
  const res = await fetch(`https://analyticsadmin.googleapis.com/v1beta/${path}`, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const body = await res.json();
  if (!res.ok) {
    const message = body?.error?.message ?? `HTTP ${res.status}`;
    const err = new Error(message);
    err.disabled = /has not been used in project|is disabled/i.test(message);
    throw err;
  }
  return body;
};

const candidates = [];
let discoveryError = null;
try {
  const summaries = await admin("accountSummaries?pageSize=200");
  for (const account of summaries.accountSummaries ?? []) {
    for (const property of account.propertySummaries ?? []) {
      candidates.push({
        account: account.displayName,
        propertyId: String(property.property ?? "").replace("properties/", ""),
        name: property.displayName,
      });
    }
  }
} catch (err) {
  discoveryError = err;
}

if (discoveryError) {
  console.log(
    discoveryError.disabled
      ? "Die Google Analytics Admin API ist im Cloud-Projekt nicht freigeschaltet — automatische\n" +
          "Property-Erkennung ist deshalb nicht möglich. Einmalig freischalten:\n  " +
          ENABLE_URL
      : `Property-Erkennung fehlgeschlagen: ${discoveryError.message}`,
  );
  console.log("\nAlternativ die Property-ID direkt setzen:");
  console.log("  node scripts/ga4-authorize.mjs --property <ID>");
} else if (candidates.length === 0) {
  console.log("\nDas autorisierte Konto hat auf keine GA4-Property Zugriff.");
}

// 5) Data Streams je Property holen: erst die Domain macht die Zuordnung eindeutig.
for (const c of candidates) {
  try {
    const streams = await admin(`properties/${c.propertyId}/dataStreams?pageSize=50`);
    c.streams = (streams.dataStreams ?? [])
      .filter((s) => s.webStreamData?.defaultUri)
      .map((s) => ({ name: s.displayName, uri: s.webStreamData.defaultUri }));
  } catch {
    c.streams = [];
  }
  try {
    const prop = await admin(`properties/${c.propertyId}`);
    c.timeZone = prop.timeZone ?? null;
    c.currency = prop.currencyCode ?? null;
  } catch {
    c.timeZone = null;
  }
}

const DOMAIN_HINTS = ["klassenfahrten-kluehspies.de", "kluehspies.com", "kluehspies.de"];
const matches = candidates.filter((c) =>
  c.streams.some((s) => DOMAIN_HINTS.some((h) => s.uri.toLowerCase().includes(h))),
);

if (candidates.length > 0) console.log(`\nGefundene GA4-Properties: ${candidates.length}`);
for (const c of candidates) {
  const mark = matches.includes(c) ? "→" : " ";
  console.log(
    `${mark} ${c.propertyId.padEnd(12)} ${c.name} (Konto: ${c.account}, Zeitzone: ${c.timeZone ?? "?"})`,
  );
  for (const s of c.streams) console.log(`     Stream: ${s.name} — ${s.uri}`);
}

// 6) Die Property nur setzen, wenn sie eindeutig ist: raten wäre schlimmer
//    als nachfragen.
const explicitProperty = propertyIndex !== -1 ? process.argv[propertyIndex + 1] : null;

if (explicitProperty) {
  await rpc("set_ga4_property_id", { p_property_id: explicitProperty });
  console.log(`Property-ID gesetzt (ausdrücklich): ${explicitProperty}`);
} else if (matches.length === 1) {
  await rpc("set_ga4_property_id", { p_property_id: matches[0].propertyId });
  console.log(`Eindeutige Property erkannt und gesetzt: ${matches[0].propertyId} — ${matches[0].name}`);
} else if (matches.length === 0 && candidates.length === 1) {
  await rpc("set_ga4_property_id", { p_property_id: candidates[0].propertyId });
  console.log(
    `Nur eine Property vorhanden, gesetzt: ${candidates[0].propertyId} — ${candidates[0].name}` +
      " (keine Domain-Übereinstimmung — bitte oben gegenprüfen)",
  );
} else if (candidates.length > 0) {
  console.log(
    `\nProperty NICHT eindeutig (${matches.length} Domain-Treffer bei ${candidates.length} Properties).`,
  );
  console.log("Nichts geraten. Auswahl mit:");
  console.log("  node scripts/ga4-authorize.mjs --property <ID>");
}

const status = await rpc("ga4_config_status", {});
const row = Array.isArray(status) ? status[0] : status;
console.log(`\nVault: Token hinterlegt = ${row?.token_configured ? "ja" : "nein"}, Property = ${row?.property_id ?? "–"}`);
