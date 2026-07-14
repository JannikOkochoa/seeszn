#!/usr/bin/env node
// ─── NUR ENTWICKLUNG: Bootstrap der manuellen KPIs ────────────────────────────
// Legt die manuell gepflegten KPIs für Klühspies an: Google-Bewertungen
// (Sterne + neue Bewertungen), Google-Präsenz (Profilaufrufe, Interaktionen,
// ungefährer Monatswert) und Content & Authority (Blog-/Redditziele). Erstellt
// die kpi_definitions, die verifizierten Baselines als append-only Check-ins und
// die zugehörigen Zielversionen (kpi_targets). Läuft ausschließlich lokal oder
// gegen das eine freigegebene Dev-Projekt (Project-Ref unten). Sekundäre KPIs;
// die vier Search-KPIs bleiben unberührt.
//
// Aufruf:
//   node --env-file=.env.local scripts/bootstrap-review-kpis.mjs            (anwenden)
//   node --env-file=.env.local scripts/bootstrap-review-kpis.mjs --dry-run  (nur zeigen)
//   node --env-file=.env.local scripts/bootstrap-review-kpis.mjs --validate (nur prüfen)
//
// Voraussetzung: Migration 20260714100000_kpi_goal_system.sql ist angewendet.
// Idempotent: identische Baseline = No-op. Spätere manuelle Änderungen werden
// NIE überschrieben – weicht der Ist-Zustand ab, bricht das Script ab und zeigt
// die Unterschiede.

import { createClient } from "@supabase/supabase-js";

const ORG_SLUG = "kluehspies";
const ALLOWED_PROJECT_REF = "rzbdbxgltbiutpxbyypv";
const CREATOR_EMAIL = "jannik@seeszn.example.com";

// Verifizierte Baseline (Stand des Imports). Keine UUIDs, keine Secrets.
const BASELINE = {
  rating: 4.2,
  reviewCount: 202,
  targetRating: 4.3,
  monthlyGoal: 10,
  // Neue Bewertungen aktueller Monat: bewusst NICHT gesetzt ("noch nicht erfasst").
};

const RATING_KEY = "google_rating";
const NEW_KEY = "google_new_reviews";

// Google-Präsenz: verifizierte Baseline vom 14.07.2026. Werte sind manuell
// bestätigt, sekundär, KEIN Bestandteil der vier Search-KPIs. 2.860/1.000 sind
// NICHT als „letzte 90 Tage" zu verstehen; nächster Vergleich nach 90 Tagen.
const PRESENCE = {
  profileViews: 2860,
  interactions: 1000,
  monthlyEstimate: 505,
  measuredAt: "2026-07-14",
};
const PROFILE_VIEWS_KEY = "google_profile_views";
const INTERACTIONS_KEY = "google_interactions";
const MONTHLY_VIEWS_KEY = "google_monthly_views_estimate";

// Content & Authority: nur operative Ziele, noch keine erfundenen Ist-Werte.
const CONTENT = { blogGoal: 1, redditGoal: 1 };
const BLOG_KEY = "blog_posts_published";
const REDDIT_KEY = "qualified_reddit_contributions";

const MANUAL_KEYS = [
  RATING_KEY,
  NEW_KEY,
  PROFILE_VIEWS_KEY,
  INTERACTIONS_KEY,
  MONTHLY_VIEWS_KEY,
  BLOG_KEY,
  REDDIT_KEY,
];

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const validateOnly = args.has("--validate");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  console.error("Fehlend: NEXT_PUBLIC_SUPABASE_URL und/oder SUPABASE_SECRET_KEY.");
  console.error("Aufruf: node --env-file=.env.local scripts/bootstrap-review-kpis.mjs [--dry-run|--validate]");
  process.exit(1);
}

// Zielprüfung: lokal ODER exakt die freigegebene Dev-Project-Ref. Kein Escape-Hatch.
const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(url);
const refMatch = url.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/i);
const projectRef = refMatch ? refMatch[1] : null;
if (!isLocal && projectRef !== ALLOWED_PROJECT_REF) {
  console.error(`Abbruch: ${url} ist weder lokal noch das freigegebene Dev-Projekt (${ALLOWED_PROJECT_REF}).`);
  process.exit(1);
}

const admin = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const today = new Date().toISOString().slice(0, 10);

function log(...parts) {
  console.log(...parts);
}

async function main() {
  const mode = validateOnly ? "VALIDATE" : dryRun ? "DRY-RUN" : "APPLY";
  log(`Bootstrap Review-KPIs · Modus ${mode} · Ziel ${isLocal ? "localhost" : projectRef}`);

  // Organisation über die stabile slug-Kennung finden (keine UUID hart codiert).
  const org = await admin.from("organizations").select("id, name").eq("slug", ORG_SLUG).maybeSingle();
  if (org.error || !org.data) {
    console.error(`Organisation '${ORG_SLUG}' nicht gefunden. Zuerst Seed einspielen.`);
    process.exit(1);
  }
  const organizationId = org.data.id;

  // Ersteller/updated_by über die E-Mail ermitteln (keine UUID hart codiert).
  const creator = await admin.from("profiles").select("id, email").eq("email", CREATOR_EMAIL).maybeSingle();
  if (creator.error || !creator.data) {
    console.error(`Profil ${CREATOR_EMAIL} nicht gefunden. Zuerst dev-bootstrap-team.mjs ausführen.`);
    process.exit(1);
  }
  const creatorId = creator.data.id;

  // Existieren die manuellen KPI-Definitionen bereits?
  const defs = await admin
    .from("kpi_definitions")
    .select("id, metric_key, name")
    .eq("organization_id", organizationId)
    .in("metric_key", MANUAL_KEYS);
  if (defs.error) {
    console.error(`Konnte kpi_definitions nicht lesen: ${defs.error.message}`);
    console.error("Ist die Migration 20260714100000_kpi_goal_system.sql angewendet?");
    process.exit(1);
  }
  const byKey = new Map((defs.data ?? []).map((d) => [d.metric_key, d]));

  const DEFINITIONS = [
    [RATING_KEY, "Google-Bewertung"],
    [NEW_KEY, "Neue Google-Bewertungen"],
    [PROFILE_VIEWS_KEY, "Profilaufrufe"],
    [INTERACTIONS_KEY, "Interaktionen"],
    [MONTHLY_VIEWS_KEY, "Monatliche Aufrufe (ungefähr)"],
    [BLOG_KEY, "Blogartikel"],
    [REDDIT_KEY, "Reddit"],
  ];

  const plan = [];
  for (const [key, name] of DEFINITIONS) {
    if (!byKey.has(key)) plan.push(`kpi_definition anlegen: ${key} (${name})`);
  }

  // Google-Präsenz-Baseline: bereits vorhanden? (Idempotenz + nie überschreiben)
  const viewsKpiId = byKey.get(PROFILE_VIEWS_KEY)?.id ?? null;
  let existingPresence = null;
  if (viewsKpiId) {
    const rows = await admin
      .from("kpi_manual_check_ins")
      .select("value, measured_at")
      .eq("organization_id", organizationId)
      .eq("kpi_definition_id", viewsKpiId)
      .order("measured_at", { ascending: false })
      .limit(1);
    if (!rows.error) existingPresence = rows.data?.[0] ?? null;
  }
  if (existingPresence) {
    if (Number(existingPresence.value) !== PRESENCE.profileViews) {
      console.error("Abbruch: Es existiert bereits ein abweichender Profilaufrufe-Check-in.");
      console.error(`  vorhanden: ${existingPresence.value} (Stand ${existingPresence.measured_at})`);
      console.error(`  Baseline:  ${PRESENCE.profileViews}`);
      console.error("Der Bootstrap setzt manuell gepflegte Daten nicht zurück.");
      process.exit(validateOnly ? 0 : 2);
    }
    log("Google-Präsenz-Baseline bereits vorhanden und identisch – No-op.");
  } else {
    plan.push(
      `Google-Präsenz-Check-ins anlegen: ${PRESENCE.profileViews} Aufrufe / ${PRESENCE.interactions} Interaktionen / ca. ${PRESENCE.monthlyEstimate} monatlich (Stand ${PRESENCE.measuredAt})`,
    );
  }
  plan.push(`Blogziel anlegen: ≥ ${CONTENT.blogGoal} pro Kalenderwoche`);
  plan.push(`Redditziel anlegen: ≥ ${CONTENT.redditGoal} pro Kalendermonat`);
  plan.push('Blog-/Reddit-Ist-Werte: NICHT gesetzt → "noch nicht erfasst"');

  // Vorhandene Rating-Check-ins prüfen (Idempotenz + „nie überschreiben").
  let ratingKpiId = byKey.get(RATING_KEY)?.id ?? null;
  let existingRating = null;
  if (ratingKpiId) {
    const checkIns = await admin
      .from("kpi_manual_check_ins")
      .select("value, secondary_value, measured_at, created_at")
      .eq("organization_id", organizationId)
      .eq("kpi_definition_id", ratingKpiId)
      .order("measured_at", { ascending: false })
      .limit(1);
    if (!checkIns.error) existingRating = checkIns.data?.[0] ?? null;
  }

  if (existingRating) {
    const sameRating = Number(existingRating.value) === BASELINE.rating;
    const sameCount = Number(existingRating.secondary_value) === BASELINE.reviewCount;
    if (sameRating && sameCount) {
      log("Baseline bereits vorhanden und identisch – No-op für den Rating-Check-in.");
    } else {
      // Spätere manuelle Änderung: NIE zurücksetzen.
      console.error("Abbruch: Es existiert bereits ein abweichender Rating-Check-in.");
      console.error(
        `  vorhanden: ${existingRating.value} ★ / ${existingRating.secondary_value} Bewertungen (Stand ${existingRating.measured_at})`,
      );
      console.error(`  Baseline:  ${BASELINE.rating} ★ / ${BASELINE.reviewCount} Bewertungen`);
      console.error("Der Bootstrap setzt manuell gepflegte Daten nicht zurück.");
      process.exit(existingRating && validateOnly ? 0 : 2);
    }
  } else {
    plan.push(`Rating-Check-in anlegen: ${BASELINE.rating} ★ / ${BASELINE.reviewCount} Bewertungen`);
    plan.push(`Sterne-Ziel anlegen: ≥ ${BASELINE.targetRating} ★ (current_state)`);
    plan.push(`Monatsziel anlegen: ≥ ${BASELINE.monthlyGoal} neue Bewertungen (calendar_month)`);
    plan.push('Monatswert (neue Bewertungen): NICHT gesetzt → "noch nicht erfasst"');
  }

  if (plan.length === 0) {
    log("Nichts zu tun. Alles bereits vorhanden.");
    return;
  }

  log("\nGeplante Schritte:");
  for (const p of plan) log(`  • ${p}`);

  if (validateOnly || dryRun) {
    log(`\n${validateOnly ? "VALIDATE" : "DRY-RUN"}: keine Änderungen geschrieben.`);
    return;
  }

  // ── Anwenden ────────────────────────────────────────────────────────────────
  async function ensureDefinition(metricKey, name) {
    const existing = byKey.get(metricKey);
    if (existing) return existing.id;
    const inserted = await admin
      .from("kpi_definitions")
      .insert({ organization_id: organizationId, name, metric_key: metricKey, owner_id: creatorId })
      .select("id")
      .single();
    if (inserted.error) throw new Error(`kpi_definition ${metricKey}: ${inserted.error.message}`);
    return inserted.data.id;
  }

  ratingKpiId = await ensureDefinition(RATING_KEY, "Google-Bewertung");
  const newKpiId = await ensureDefinition(NEW_KEY, "Neue Google-Bewertungen");
  const profileViewsKpiId = await ensureDefinition(PROFILE_VIEWS_KEY, "Profilaufrufe");
  const interactionsKpiId = await ensureDefinition(INTERACTIONS_KEY, "Interaktionen");
  const monthlyKpiId = await ensureDefinition(MONTHLY_VIEWS_KEY, "Monatliche Aufrufe (ungefähr)");
  const blogKpiId = await ensureDefinition(BLOG_KEY, "Blogartikel");
  const redditKpiId = await ensureDefinition(REDDIT_KEY, "Reddit");

  async function ensureActiveGoal(kpiId, targetValue, periodType, rationale) {
    const active = await admin
      .from("kpi_targets")
      .select("id, target_value")
      .eq("organization_id", organizationId)
      .eq("kpi_definition_id", kpiId)
      .eq("period_type", periodType)
      .eq("status", "active")
      .maybeSingle();
    if (!active.error && active.data) return; // Ziel existiert – nicht überschreiben.
    const inserted = await admin.from("kpi_targets").insert({
      organization_id: organizationId,
      kpi_definition_id: kpiId,
      target_value: targetValue,
      period_type: periodType,
      period_days: null,
      comparator: "at_least",
      start_date: today,
      end_date: null,
      source_type: "manual_confirmed",
      status: "active",
      created_by: creatorId,
      rationale,
    });
    if (inserted.error) throw new Error(`Ziel ${periodType}: ${inserted.error.message}`);
  }

  async function insertCheckIn(kpiId, value, secondaryValue, measuredAt, note) {
    const row = await admin.from("kpi_manual_check_ins").insert({
      organization_id: organizationId,
      kpi_definition_id: kpiId,
      value,
      secondary_value: secondaryValue,
      period_key: null,
      measured_at: measuredAt,
      note,
      source_type: "manually_entered",
      entered_by: creatorId,
    });
    if (row.error) throw new Error(`Check-in: ${row.error.message}`);
  }

  if (!existingRating) {
    await insertCheckIn(ratingKpiId, BASELINE.rating, BASELINE.reviewCount, today, "Verifizierte Baseline zum Launch");
  }
  await ensureActiveGoal(ratingKpiId, BASELINE.targetRating, "current_state", "Erstes Ziel nach verifizierter Review-Baseline");
  await ensureActiveGoal(newKpiId, BASELINE.monthlyGoal, "calendar_month", "Erstes Ziel nach verifizierter Review-Baseline");

  // Google-Präsenz: drei Baseline-Check-ins (nur wenn noch keiner existiert).
  if (!existingPresence) {
    await insertCheckIn(profileViewsKpiId, PRESENCE.profileViews, null, PRESENCE.measuredAt, "Verifizierte Baseline 14.07.2026");
    await insertCheckIn(interactionsKpiId, PRESENCE.interactions, null, PRESENCE.measuredAt, "Verifizierte Baseline 14.07.2026");
    await insertCheckIn(monthlyKpiId, PRESENCE.monthlyEstimate, null, PRESENCE.measuredAt, "Ungefährer Monatswert · Baseline 14.07.2026");
  }

  // Content & Authority: nur Ziele, keine erfundenen Ist-Werte.
  await ensureActiveGoal(blogKpiId, CONTENT.blogGoal, "calendar_week", "Operatives Content-Ziel");
  await ensureActiveGoal(redditKpiId, CONTENT.redditGoal, "calendar_month", "Operatives Authority-Ziel");

  log("\nFertig. Review-, Google-Präsenz- und Content-KPIs mit Baselines und Zielen sind gesetzt.");
  log('Monatliche Reviews sowie Blog-/Reddit-Ist-Werte bleiben bewusst "noch nicht erfasst".');
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
