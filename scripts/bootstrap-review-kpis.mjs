#!/usr/bin/env node
// ─── NUR ENTWICKLUNG: Bootstrap der Google-Bewertungs-KPIs ────────────────────
// Legt die manuell gepflegten Review-KPIs für Klühspies an: zwei
// kpi_definitions (Sternebewertung, neue Bewertungen), die verifizierte
// Baseline als append-only Check-in und die zugehörigen Zielversionen
// (kpi_targets). Läuft ausschließlich lokal oder gegen das eine freigegebene
// Dev-Projekt (Project-Ref unten). Kein anderes Remote-Projekt.
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

  // Existieren die Review-KPI-Definitionen bereits?
  const defs = await admin
    .from("kpi_definitions")
    .select("id, metric_key, name")
    .eq("organization_id", organizationId)
    .in("metric_key", [RATING_KEY, NEW_KEY]);
  if (defs.error) {
    console.error(`Konnte kpi_definitions nicht lesen: ${defs.error.message}`);
    console.error("Ist die Migration 20260714100000_kpi_goal_system.sql angewendet?");
    process.exit(1);
  }
  const byKey = new Map((defs.data ?? []).map((d) => [d.metric_key, d]));

  const plan = [];
  if (!byKey.has(RATING_KEY)) plan.push(`kpi_definition anlegen: ${RATING_KEY} (Google-Bewertung)`);
  if (!byKey.has(NEW_KEY)) plan.push(`kpi_definition anlegen: ${NEW_KEY} (Neue Google-Bewertungen)`);

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

  async function ensureActiveGoal(kpiId, targetValue, periodType) {
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
      rationale: "Erstes Ziel nach verifizierter Review-Baseline",
    });
    if (inserted.error) throw new Error(`Ziel ${periodType}: ${inserted.error.message}`);
  }

  if (!existingRating) {
    const checkIn = await admin.from("kpi_manual_check_ins").insert({
      organization_id: organizationId,
      kpi_definition_id: ratingKpiId,
      value: BASELINE.rating,
      secondary_value: BASELINE.reviewCount,
      period_key: null,
      measured_at: today,
      note: "Verifizierte Baseline zum Launch",
      source_type: "manually_entered",
      entered_by: creatorId,
    });
    if (checkIn.error) throw new Error(`Rating-Check-in: ${checkIn.error.message}`);
  }

  await ensureActiveGoal(ratingKpiId, BASELINE.targetRating, "current_state");
  await ensureActiveGoal(newKpiId, BASELINE.monthlyGoal, "calendar_month");

  log("\nFertig. Review-KPIs, Baseline-Check-in und Ziele sind gesetzt.");
  log('Neue Bewertungen im Monat bleiben bewusst "noch nicht erfasst".');
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
