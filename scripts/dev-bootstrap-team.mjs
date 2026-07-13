#!/usr/bin/env node
// ─── NUR ENTWICKLUNG: Team-Bootstrap mit example.com-Testkonten ───────────────
// Legt die sechs Teammitglieder als Testnutzer an und verknüpft sie mit der
// Organisation "kluehspies" (aus supabase/seed.sql). Es entstehen KEINE
// produktiven Auth-Nutzer: alle Adressen liegen unter example.com, und das
// Script läuft ausschließlich gegen die lokale Instanz oder das eine
// freigegebene Dev-Projekt (Project-Ref unten). Kein anderes Remote-Projekt.
//
// Aufruf (Dev-Env in .env.local; Passwort NICHT im Repo):
//   node --env-file=.env.local scripts/dev-bootstrap-team.mjs
//
// Benötigt: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY (nur serverseitig),
//           DEV_BOOTSTRAP_PASSWORD (Testpasswort, ausschließlich aus der Env).

import { createClient } from "@supabase/supabase-js";

const ORG_SLUG = "kluehspies";
// Einziges freigegebenes Remote-Ziel (seeszn-kluehspies-dev). Nur diese Ref
// oder eine lokale Instanz sind erlaubt.
const ALLOWED_PROJECT_REF = "rzbdbxgltbiutpxbyypv";

/** Testteam: Gruppierung nach Unternehmen, Rollen decken alle drei Fälle ab. */
const TEAM = [
  { name: "Jannik", email: "jannik@seeszn.example.com", company: "seeszn", role: "seeszn_admin" },
  { name: "Maxim", email: "maxim@seeszn.example.com", company: "seeszn", role: "seeszn_admin" },
  { name: "Tobias", email: "tobias@seeszn.example.com", company: "seeszn", role: "seeszn_admin" },
  { name: "Celine", email: "celine@kluehspies.example.com", company: "kluehspies", role: "kluehspies_editor" },
  { name: "Francesco", email: "francesco@kluehspies.example.com", company: "kluehspies", role: "kluehspies_editor" },
  { name: "Niklas", email: "niklas@kluehspies.example.com", company: "kluehspies", role: "viewer" },
];

// Alte generische Testkonten: ihre Memberships im Klühspies-Workspace werden
// entfernt, damit die Owner-Auswahl genau die sechs neuen Profile zeigt. Die
// Auth-Nutzer selbst bleiben bestehen (kein physisches Löschen).
const LEGACY_EMAILS = [
  "kpi-admin-test@example.com",
  "kpi-editor-test@example.com",
  "kpi-viewer-test@example.com",
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const password = process.env.DEV_BOOTSTRAP_PASSWORD;

if (!url || !secretKey) {
  console.error("Fehlend: NEXT_PUBLIC_SUPABASE_URL und/oder SUPABASE_SECRET_KEY.");
  console.error("Aufruf: node --env-file=.env.local scripts/dev-bootstrap-team.mjs");
  process.exit(1);
}

if (!password) {
  console.error("Fehlend: DEV_BOOTSTRAP_PASSWORD.");
  console.error("Das Testpasswort kommt ausschließlich aus der Env (z. B. .env.local),");
  console.error("nie aus dem Script oder dem Repository. Abbruch.");
  process.exit(1);
}

// Zielprüfung: lokal ODER exakt die freigegebene Dev-Project-Ref. Nichts sonst.
const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(url);
const refMatch = url.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/i);
const projectRef = refMatch ? refMatch[1] : null;
if (!isLocal && projectRef !== ALLOWED_PROJECT_REF) {
  console.error(`Abbruch: ${url} ist weder lokal noch das freigegebene Dev-Projekt.`);
  console.error(`Erlaubt sind ausschließlich localhost oder die Ref ${ALLOWED_PROJECT_REF}.`);
  process.exit(1);
}

// Sicherung: ausschließlich example.com-Adressen anlegen.
for (const member of TEAM) {
  if (!(member.email.split("@")[1] ?? "").endsWith("example.com")) {
    console.error(`Abbruch: ${member.email} ist keine example.com-Testadresse.`);
    process.exit(1);
  }
}

const admin = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findUserIdByEmail(email) {
  // Kleine Instanz: eine Seite reicht; Testnutzer sind wenige.
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw new Error(error.message);
  return data.users.find((u) => (u.email ?? "").toLowerCase() === email.toLowerCase())?.id ?? null;
}

async function main() {
  const org = await admin.from("organizations").select("id, name").eq("slug", ORG_SLUG).maybeSingle();
  if (org.error || !org.data) {
    console.error(`Organisation '${ORG_SLUG}' nicht gefunden. Zuerst Seed einspielen.`);
    process.exit(1);
  }
  const organizationId = org.data.id;

  for (const member of TEAM) {
    let userId = null;

    const created = await admin.auth.admin.createUser({
      email: member.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: member.name },
    });

    if (created.error) {
      // Idempotent: existierende Testnutzer werden wiederverwendet.
      userId = await findUserIdByEmail(member.email);
      if (!userId) {
        console.error(`✗ ${member.name}: ${created.error.message}`);
        continue;
      }
    } else {
      userId = created.data.user.id;
    }

    // Profil legt der Signup-Trigger an; Name sicherheitshalber nachziehen.
    await admin.from("profiles").upsert({ id: userId, email: member.email, full_name: member.name });

    const membership = await admin.from("memberships").upsert(
      {
        organization_id: organizationId,
        user_id: userId,
        role: member.role,
        company: member.company,
        status: "active",
      },
      { onConflict: "organization_id,user_id" },
    );
    if (membership.error) {
      console.error(`✗ ${member.name}: Membership fehlgeschlagen – ${membership.error.message}`);
      continue;
    }

    console.log(`✓ ${member.name} <${member.email}> – ${member.company}/${member.role}`);
  }

  // Alte generische Testmemberships entfernen (Auth-Nutzer bleiben bestehen).
  let removed = 0;
  for (const email of LEGACY_EMAILS) {
    const userId = await findUserIdByEmail(email);
    if (!userId) continue;
    const del = await admin
      .from("memberships")
      .delete()
      .eq("organization_id", organizationId)
      .eq("user_id", userId);
    if (del.error) {
      console.error(`! Membership von ${email} konnte nicht entfernt werden: ${del.error.message}`);
      continue;
    }
    removed += 1;
    console.log(`– Membership entfernt: ${email} (Auth-Nutzer bleibt bestehen)`);
  }

  console.log(`\nFertig. ${TEAM.length} Team-Memberships gesetzt, ${removed} alte Membership(s) entfernt.`);
  console.log("Alle Testkonten sind example.com und existieren nur für die Entwicklung.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
