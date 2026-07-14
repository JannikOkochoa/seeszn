#!/usr/bin/env node
// ─── NUR ENTWICKLUNG: Maßnahmen-Cleanup + verifizierte Maßnahmen ──────────────
// Archiviert die unzuverlässige Legacy-Maßnahme (Titel „Hamburg", Seite Berlin,
// kein nachvollziehbarer Zeitraum/Quelle) als legacy/unverified (Soft-Delete,
// keine physische Löschung) und legt vier reale, verifizierte Maßnahmen
// idempotent an. Läuft ausschließlich lokal oder gegen das eine freigegebene
// Dev-Projekt. Keine hart codierten UUIDs, keine Secrets.
//
// Aufruf:
//   node --env-file=.env.local scripts/bootstrap-kpi-tasks.mjs            (anwenden)
//   node --env-file=.env.local scripts/bootstrap-kpi-tasks.mjs --dry-run
//   node --env-file=.env.local scripts/bootstrap-kpi-tasks.mjs --validate

import { createClient } from "@supabase/supabase-js";

const ORG_SLUG = "kluehspies";
const ALLOWED_PROJECT_REF = "rzbdbxgltbiutpxbyypv";
const CREATOR_EMAIL = "jannik@seeszn.example.com";
const PRIMARY_METRIC_KEY = "organic_clicks_product_pages";

const LEGACY_TITLE = "Mobile Darstellung der Hamburg-Seite prüfen";

// Vier verifizierte Maßnahmen. observation = „warum relevant"; description trägt
// den konkreten Inhalt. Owner bewusst null (nicht eindeutig zuweisbar).
const VERIFIED = [
  {
    title: "Hx- und FAQ-Struktur für Berlin, Hamburg und München korrigieren",
    priority: "high",
    observation:
      "Modultitel, Wochentage und FAQ-Titel sind nicht sauber als H2/H3/H4 ausgezeichnet. Eine klare Hx- und FAQ-Struktur hilft Google, KI-Systemen und Lehrkräften, dieselbe Hierarchie zu lesen.",
    scope: "Berlin, Hamburg, München + globale Template-Anpassungen",
    description:
      "Aus dem verifizierten Heading-Briefing: Modultitel als echte H2/H3, Wochentage von H3 zu H4, doppelte Bewertungs-H2 entfernen, spezifische FAQ-Titel, Berlin-Tipps als echte H3, leere Münchner H3 entfernen.",
    source: "Verifiziertes Heading-Briefing",
  },
  {
    title: "Titles und Snippets der Städtereise-Seiten für eine höhere Klickrate prüfen",
    priority: "high",
    observation:
      "Reichweite und Impressionen bieten Potenzial, während die Klickrate hinter der Vorperiode liegt. Titel und Beschreibungen der wichtigsten Seiten prüfen.",
    scope: "Städtereise-Produktseiten",
    description:
      "Titles und Meta-Descriptions der reichweitenstärksten Seiten schärfen, um mehr Einblendungen in Klicks zu übersetzen. Keine Kausalität behaupten; Wirkung über den KPI beobachten.",
    source: "Verifizierte GSC-Beobachtung",
  },
  {
    title: "Neue Blog- und Ratgeberseite umsetzen",
    priority: "medium",
    observation:
      "Themencluster, Chunking, interne Verlinkung und seitenspezifische FAQs verbinden Ratgeberinhalte mit den Produktseiten und stärken die thematische Autorität.",
    scope: "Neue Blog-/Ratgeberseite",
    description:
      "Zunächst 1 Beitrag pro Woche, nach Livegang 2 pro Woche. Klare Themencluster, Chunking, interne Verlinkung, selektive Listicles, seitenspezifische FAQs, Verbindung zu den Produktseiten.",
    source: "Content-Strategie",
  },
  {
    title: "Google-Bewertungen nach jeder Reise aktiv anfragen",
    priority: "medium",
    observation:
      "Aktive, freundliche Bewertungsanfragen nach jeder Reise erhöhen Anzahl und Aktualität der Google-Bewertungen. Kein automatischer Versand.",
    scope: "Google Business Profile",
    description:
      "Nach jeder Reise die verantwortliche Lehrkraft bitten: Review-Link, QR-Code, E-Mail-Vorlage, WhatsApp-Vorlage, QR-Code auf dem Feedbackformular. Kein automatischer Versand.",
    source: "Manuell gepflegt",
  },
];

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const validateOnly = args.has("--validate");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!url || !secretKey) {
  console.error("Fehlend: NEXT_PUBLIC_SUPABASE_URL und/oder SUPABASE_SECRET_KEY.");
  process.exit(1);
}
const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(url);
const refMatch = url.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/i);
const projectRef = refMatch ? refMatch[1] : null;
if (!isLocal && projectRef !== ALLOWED_PROJECT_REF) {
  console.error(`Abbruch: ${url} ist weder lokal noch das freigegebene Dev-Projekt (${ALLOWED_PROJECT_REF}).`);
  process.exit(1);
}

const admin = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function audit(organizationId, actorId, action, entityId, metadata) {
  await admin.from("audit_events").insert({
    organization_id: organizationId,
    actor_id: actorId,
    entity_type: "task",
    entity_id: entityId,
    action,
    metadata,
  });
}

async function main() {
  const mode = validateOnly ? "VALIDATE" : dryRun ? "DRY-RUN" : "APPLY";
  console.log(`Maßnahmen-Cleanup · Modus ${mode} · Ziel ${isLocal ? "localhost" : projectRef}`);

  const org = await admin.from("organizations").select("id").eq("slug", ORG_SLUG).maybeSingle();
  if (org.error || !org.data) {
    console.error(`Organisation '${ORG_SLUG}' nicht gefunden.`);
    process.exit(1);
  }
  const organizationId = org.data.id;

  const creator = await admin.from("profiles").select("id").eq("email", CREATOR_EMAIL).maybeSingle();
  if (creator.error || !creator.data) {
    console.error(`Profil ${CREATOR_EMAIL} nicht gefunden. Zuerst dev-bootstrap-team.mjs ausführen.`);
    process.exit(1);
  }
  const creatorId = creator.data.id;

  const kpiDef = await admin
    .from("kpi_definitions")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("metric_key", PRIMARY_METRIC_KEY)
    .maybeSingle();
  const primaryKpiId = kpiDef.data?.id ?? null;

  const existing = await admin
    .from("tasks")
    .select("id, title, deleted_at")
    .eq("organization_id", organizationId);
  if (existing.error) {
    console.error(`Konnte tasks nicht lesen: ${existing.error.message}`);
    process.exit(1);
  }
  const byTitle = new Map((existing.data ?? []).map((t) => [t.title, t]));

  const plan = [];
  const legacy = byTitle.get(LEGACY_TITLE);
  const legacyNeedsArchive = legacy && legacy.deleted_at === null;
  if (legacyNeedsArchive) plan.push(`Legacy archivieren: „${LEGACY_TITLE}" (legacy/unverified)`);
  for (const v of VERIFIED) {
    const t = byTitle.get(v.title);
    if (!t || t.deleted_at !== null) plan.push(`Maßnahme anlegen: „${v.title}"`);
  }

  if (plan.length === 0) {
    console.log("Nichts zu tun. Alles bereits vorhanden.");
    return;
  }
  console.log("\nGeplante Schritte:");
  for (const p of plan) console.log(`  • ${p}`);

  if (validateOnly || dryRun) {
    console.log(`\n${mode}: keine Änderungen geschrieben.`);
    return;
  }

  // ── Anwenden ────────────────────────────────────────────────────────────────
  if (legacyNeedsArchive) {
    const upd = await admin
      .from("tasks")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: creatorId,
        deletion_reason:
          "Legacy/unverified: Titel nennt Hamburg, verknüpfte Seite ist Berlin; Prozentwerte ohne nachvollziehbaren Zeitraum und ohne belegte Quelle.",
      })
      .eq("id", legacy.id)
      .select("id")
      .single();
    if (upd.error) throw new Error(`Legacy-Archivierung: ${upd.error.message}`);
    await audit(organizationId, creatorId, "task.archived_unverified", legacy.id, {
      title: LEGACY_TITLE,
      reason: "Titel Hamburg, Seite Berlin, kein nachvollziehbarer Zeitraum/Quelle",
    });
    console.log(`  – archiviert: „${LEGACY_TITLE}"`);
  }

  for (const v of VERIFIED) {
    const t = byTitle.get(v.title);
    if (t && t.deleted_at === null) continue; // schon vorhanden
    const inserted = await admin
      .from("tasks")
      .insert({
        organization_id: organizationId,
        kpi_definition_id: primaryKpiId,
        title: v.title,
        description: v.description,
        insight_context: { observation: `${v.observation} Scope: ${v.scope}. Quelle: ${v.source}.` },
        priority: v.priority,
        status: "open",
        created_by: creatorId,
      })
      .select("id")
      .single();
    if (inserted.error) throw new Error(`Maßnahme „${v.title}": ${inserted.error.message}`);
    await audit(organizationId, creatorId, "task.created_verified", inserted.data.id, {
      title: v.title,
      source: v.source,
    });
    console.log(`  + angelegt: „${v.title}"`);
  }

  console.log("\nFertig. Legacy archiviert, verifizierte Maßnahmen gesetzt.");
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
