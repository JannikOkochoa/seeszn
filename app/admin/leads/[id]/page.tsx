// ─── /admin/leads/[id] — Lead-Detail ──────────────────────────────────────────
// Aufbau übernommen aus dem früheren CRM: Hero, Admin-Block, Karten mit
// Hairline-Zeilen. Die Diagnose-Panels lesen ihre Daten aus scan_result (jsonb)
// statt aus dupliizierten Spalten; das frühere Fanout-Modell gibt es nicht
// mehr, an seiner Stelle stehen die heutigen KI-Antwortfragen.
//
// Rohes JSON wird bewusst nicht angezeigt: alles, was strukturiert vorliegt,
// wird auch strukturiert dargestellt. Fehlt oder bricht das Scan-Ergebnis,
// bleibt der Block einfach weg — die Kontakt- und Workflow-Daten sind davon
// unabhängig.

import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { notFound } from "next/navigation";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminTopBar from "@/components/admin/AdminTopBar";
import { checkSeesznAdmin } from "@/lib/leads/access";
import { getLeadById } from "@/lib/leads/admin";
import { isoToBerlinInput } from "@/lib/leads/time";
import {
  LEAD_PRIORITY_LABEL,
  LEAD_SOURCE_LABEL,
  LEAD_STATUS_LABEL,
  LEAD_STATUS_ORDER,
  type LeadPriority,
} from "@/lib/leads/types";
import type { AiAnswerCheck, Observation, RawSignals, ScoreCard } from "@/lib/scan/types";
import {
  actionAddNote,
  actionMarkContacted,
  actionSetNextFollowUp,
  actionUpdatePriority,
  actionUpdateStatus,
} from "../actions";
import {
  DeliveryBadge,
  StatusBadge,
  btnStyle,
  cardStyle,
  eyebrowStyle,
  formatDate,
  inputStyle,
  mutedStyle,
  scoreColor,
  shellStyle,
} from "../ui";

export const metadata: Metadata = {
  title: "Lead | SEESZN",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const labelCol: CSSProperties = { width: 210, flexShrink: 0, color: "#8a8478", fontSize: 12 };

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 8, fontSize: 13, lineHeight: 1.5 }}>
      <span style={labelCol}>{label}</span>
      <span style={{ color: "#1a1a17", minWidth: 0, wordBreak: "break-word" }}>{children}</span>
    </div>
  );
}

function Dash() {
  return <span style={mutedStyle}>–</span>;
}

/** Ein Score-Balken aus dem alten CRM — Label, Wert, Begründung, nächster Schritt. */
function ScoreLine({ card }: { card: ScoreCard }) {
  return (
    <div style={{ padding: "10px 0", borderTop: "1px solid #efeee8" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 3 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a17" }}>{card.label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(card.score) }}>
          {card.score}/100
        </span>
      </div>
      {card.reason && (
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6f6a5f", lineHeight: 1.5 }}>{card.reason}</p>
      )}
      {card.nextStep && (
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#8a8478", lineHeight: 1.5 }}>
          → {card.nextStep}
        </p>
      )}
    </div>
  );
}

/** Eine KI-Antwortfrage mit dem Ergebnis des Web-Signalchecks. */
function AnswerCheck({ check, index }: { check: AiAnswerCheck; index: number }) {
  const found = check.ownDomainFound;
  return (
    <div style={{ padding: "12px 0", borderTop: "1px solid #efeee8" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4 }}>
        <span
          style={{
            fontSize: 10,
            color: "#9a9486",
            fontWeight: 700,
            letterSpacing: "0.1em",
            whiteSpace: "nowrap",
            marginTop: 2,
            textTransform: "uppercase",
          }}
        >
          [{check.kind}]
        </span>
        <span style={{ fontSize: 13, color: "#1a1a17", fontWeight: 600, lineHeight: 1.4 }}>
          {index + 1}. {check.question}
        </span>
      </div>
      <div style={{ marginLeft: 4, fontSize: 12, color: "#6f6a5f", lineHeight: 1.6 }}>
        {check.checked ? (
          <p style={{ margin: "2px 0", color: found ? "#1a6b3a" : "#8a1a1a", fontWeight: 600 }}>
            {found
              ? `✓ Sichtbar · Position ${check.ownDomainPosition ?? "?"}`
              : "✗ Nicht sichtbar"}
          </p>
        ) : (
          <p style={{ margin: "2px 0", color: "#9a9486" }}>Nicht live geprüft</p>
        )}
        {check.leakType && (
          <p style={{ margin: "2px 0", color: "#8a8478" }}>Muster: {check.leakType}</p>
        )}
        {check.visibleCompetitors?.length > 0 && (
          <p style={{ margin: "2px 0", color: "#8a8478" }}>
            Wettbewerber: {check.visibleCompetitors.slice(0, 4).map((d) => d.domain).join(", ")}
          </p>
        )}
        {check.visibleDomains?.length > 0 && (
          <p style={{ margin: "2px 0", color: "#8a8478" }}>
            Sichtbare Quellen: {check.visibleDomains.slice(0, 4).map((d) => d.domain).join(", ")}
          </p>
        )}
        {check.interpretation && (
          <p style={{ margin: "4px 0 0", color: "#45423b" }}>{check.interpretation}</p>
        )}
      </div>
    </div>
  );
}

/** Die beobachteten Fakten als Ampel-Liste statt als JSON-Dump. */
function ObservationLine({ observation }: { observation: Observation }) {
  const mark = observation.ok === null ? "•" : observation.ok ? "✓" : "✗";
  const color = observation.ok === null ? "#9a9486" : observation.ok ? "#1a6b3a" : "#8a1a1a";
  return (
    <div style={{ display: "flex", gap: 10, padding: "5px 0", borderBottom: "1px solid #f0efe8", fontSize: 12 }}>
      <span style={{ color, width: 14, flexShrink: 0, fontWeight: 700 }}>{mark}</span>
      <span style={{ width: 190, flexShrink: 0, color: "#8a8478" }}>{observation.label}</span>
      <span style={{ color: "#2a2a26", minWidth: 0, wordBreak: "break-word" }}>{observation.value}</span>
    </div>
  );
}

/** Rohsignale des Scans, zweispaltig wie früher. */
function signalRows(signals: RawSignals): [string, string][] {
  return [
    ["HTTP Status", String(signals.httpStatus ?? "–")],
    ["HTTPS", signals.https ? "Ja" : "Nein"],
    ["Title", signals.title ? `${signals.title.slice(0, 60)} (${signals.titleLength} Z.)` : "fehlt"],
    ["Meta Description", signals.metaDescription ? `${signals.metaDescriptionLength} Z.` : "fehlt"],
    ["H1", signals.h1?.length ? `${signals.h1.length} · ${signals.h1[0].slice(0, 50)}` : "fehlt"],
    ["H2 Anzahl", String(signals.h2Count ?? 0)],
    ["Canonical", signals.canonical ? "vorhanden" : "fehlt"],
    ["OG Title", signals.ogTitle ? "vorhanden" : "fehlt"],
    ["OG Description", signals.ogDescription ? "vorhanden" : "fehlt"],
    ["OG Site Name", signals.ogSiteName ?? "–"],
    ["JSON-LD Typen", signals.jsonLdTypes?.join(", ") || "–"],
    ["Organization Schema", signals.hasOrganizationSchema ? "Ja" : "Nein"],
    ["FAQ Schema", signals.hasFaqSchema ? "Ja" : "Nein"],
    ["Article Schema", signals.hasArticleSchema ? "Ja" : "Nein"],
    ["robots.txt", signals.robotsTxt ?? "–"],
    ["Sitemap", signals.sitemap ?? "–"],
    ["Interne Links", String(signals.internalLinks ?? 0)],
    ["Externe Links", String(signals.externalLinks ?? 0)],
    ["Wortanzahl", String(signals.wordCount ?? 0)],
    ["FAQ-Muster erkannt", signals.faqPattern ? "Ja" : "Nein"],
    ["Conversion-Signal", signals.conversionSignal ? "Ja" : "Nein"],
    [
      "PageSpeed",
      signals.performanceState === "measured" && signals.performance != null
        ? `${signals.performance}/100`
        : "nicht gemessen",
    ],
  ];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const gate = await checkSeesznAdmin();
  if (gate.state === "anonymous") return <AdminLogin />;
  if (gate.state === "denied") return <AdminLogin noAccessEmail={gate.email} />;

  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) notFound();

  const updateStatus = actionUpdateStatus.bind(null, lead.id);
  const updatePriority = actionUpdatePriority.bind(null, lead.id);
  const addNote = actionAddNote.bind(null, lead.id);
  const markContacted = actionMarkContacted.bind(null, lead.id, undefined);
  const setFollowUp = actionSetNextFollowUp.bind(null, lead.id);

  const scan = lead.scanResult;
  const scores: ScoreCard[] = scan?.scores ?? [];
  const observations: Observation[] = scan?.observations ?? [];
  const checks: AiAnswerCheck[] = scan?.aiAnswerChecks ?? [];
  const deliveryProblem =
    lead.emailDeliveryStatus === "failed" || lead.userEmailStatus === "failed";

  return (
    <div style={shellStyle}>
      <AdminTopBar
        label="Lead Detail"
        backHref="/admin/leads"
        backLabel="Lead-Liste"
        email={gate.email}
      />

      <div style={{ maxWidth: 880, margin: "0 auto", padding: 24 }}>
        {/* Hero */}
        <div style={{ ...cardStyle, borderTop: "3px solid #1a1a17", marginBottom: 20 }}>
          <span style={eyebrowStyle}>SEESZN · Lead</span>
          <h1 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 700, color: "#1a1a17", wordBreak: "break-word" }}>
            {lead.companyDomain ?? lead.emailDomain ?? lead.email}
          </h1>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
            <StatusBadge status={lead.status} />
            {scan && (
              <span style={{ fontSize: 15, fontWeight: 700, color: scoreColor(scan.overallScore) }}>
                {scan.overallScore}/100
              </span>
            )}
            {scan?.overallStatus && (
              <span style={{ fontSize: 13, color: "#45423b" }}>{scan.overallStatus}</span>
            )}
          </div>
          {scan?.finding && (
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#6f6a5f", lineHeight: 1.55 }}>
              {scan.finding}
            </p>
          )}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 11, color: "#8a8478" }}>
            <span>Eingang: {formatDate(lead.createdAt, true)}</span>
            <span>Zuletzt geändert: {formatDate(lead.updatedAt, true)}</span>
            <span>Quelle: {LEAD_SOURCE_LABEL[lead.source] ?? lead.source}</span>
          </div>
        </div>

        {/* Zustellwarnung — der Grund, warum es diese Tabelle überhaupt gibt */}
        {deliveryProblem && (
          <div
            style={{
              ...cardStyle,
              background: "#fdf3f3",
              border: "1px solid #f2dcdc",
              borderLeft: "3px solid #8a1a1a",
            }}
          >
            <span style={{ ...eyebrowStyle, color: "#8a1a1a" }}>Achtung</span>
            <p style={{ margin: 0, fontSize: 13, color: "#6b1a1a", lineHeight: 1.6 }}>
              Für diesen Lead ist mindestens eine Mail nicht zugestellt worden. Der Datensatz ist
              vollständig, aber es wurde womöglich niemand benachrichtigt — hier muss manuell
              nachgefasst werden.
            </p>
          </div>
        )}

        {/* Workflow */}
        <div style={{ ...cardStyle, background: "#faf9f5" }}>
          <span style={eyebrowStyle}>Bearbeitung</span>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
            <form action={updateStatus} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <label style={{ fontSize: 12, color: "#6f6a5f", whiteSpace: "nowrap" }}>Status:</label>
              <select name="status" defaultValue={lead.status} style={{ ...inputStyle, width: "auto" }}>
                {LEAD_STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {LEAD_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
              <button type="submit" style={{ ...btnStyle, padding: "8px 12px", fontSize: 11 }}>
                Speichern
              </button>
            </form>

            <form action={updatePriority} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <label style={{ fontSize: 12, color: "#6f6a5f", whiteSpace: "nowrap" }}>Priorität:</label>
              <select name="priority" defaultValue={lead.priority ?? ""} style={{ ...inputStyle, width: "auto" }}>
                <option value="">Keine</option>
                {(Object.keys(LEAD_PRIORITY_LABEL) as LeadPriority[]).map((p) => (
                  <option key={p} value={p}>
                    {LEAD_PRIORITY_LABEL[p]}
                  </option>
                ))}
              </select>
              <button type="submit" style={{ ...btnStyle, padding: "8px 12px", fontSize: 11 }}>
                Speichern
              </button>
            </form>

            <form action={markContacted}>
              <button type="submit" style={{ ...btnStyle, background: "#1a6b3a", padding: "8px 12px", fontSize: 11 }}>
                Als kontaktiert markieren ✓
              </button>
            </form>
          </div>

          <form action={setFollowUp} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
            <label style={{ fontSize: 12, color: "#6f6a5f", whiteSpace: "nowrap" }}>
              Nächster Follow-up:
            </label>
            <input
              type="datetime-local"
              name="date"
              defaultValue={isoToBerlinInput(lead.nextFollowUpAt)}
              style={{ ...inputStyle, width: "auto" }}
            />
            <button type="submit" style={{ ...btnStyle, padding: "8px 12px", fontSize: 11 }}>
              Speichern
            </button>
            <span style={{ fontSize: 11, color: "#9a9486" }}>Leeres Feld löscht die Wiedervorlage.</span>
          </form>

          <form action={addNote}>
            <label style={{ display: "block", fontSize: 12, color: "#6f6a5f", marginBottom: 6 }}>
              Interne Notiz hinzufügen:
            </label>
            <textarea
              name="note"
              rows={3}
              placeholder="Notiz eingeben …"
              style={{ ...inputStyle, display: "block", resize: "vertical", marginBottom: 8, fontFamily: "inherit" }}
            />
            <button type="submit" style={{ ...btnStyle, fontSize: 11 }}>
              Notiz speichern
            </button>
          </form>
        </div>

        {/* Kontakt */}
        <div style={cardStyle}>
          <span style={eyebrowStyle}>Kontakt</span>
          <Row label="Name">{lead.name ?? <Dash />}</Row>
          <Row label="E-Mail">
            <a href={`mailto:${lead.email}`} style={{ color: "#1a4a8a" }}>
              {lead.email}
            </a>
          </Row>
          <Row label="E-Mail-Domain">{lead.emailDomain ?? <Dash />}</Row>
          <Row label="Geprüfte Domain">
            {lead.companyDomain ? (
              <a
                href={`https://${lead.companyDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#1a4a8a" }}
              >
                {lead.companyDomain}
              </a>
            ) : (
              <Dash />
            )}
          </Row>
          <Row label="Quelle">{LEAD_SOURCE_LABEL[lead.source] ?? lead.source}</Row>
          <Row label="Formularseite">{lead.page ?? <Dash />}</Row>
          <Row label="Sprache">{lead.locale ?? <Dash />}</Row>
          {lead.message && (
            <div style={{ marginTop: 12 }}>
              <span style={{ ...labelCol, display: "block", marginBottom: 6 }}>Nachricht</span>
              <div
                style={{
                  padding: "12px 14px",
                  background: "#faf9f5",
                  border: "1px solid #ecebe3",
                  borderRadius: 3,
                  fontSize: 13,
                  lineHeight: 1.65,
                  color: "#2a2a26",
                  whiteSpace: "pre-wrap",
                }}
              >
                {lead.message}
              </div>
            </div>
          )}
        </div>

        {/* Status & Tracking */}
        <div style={cardStyle}>
          <span style={eyebrowStyle}>Status & Wiedervorlage</span>
          <Row label="Status">
            <StatusBadge status={lead.status} />
          </Row>
          <Row label="Priorität">
            {lead.priority ? LEAD_PRIORITY_LABEL[lead.priority] : <Dash />}
          </Row>
          <Row label="Zuletzt kontaktiert">{formatDate(lead.lastContactedAt, true)}</Row>
          <Row label="Nächster Follow-up">{formatDate(lead.nextFollowUpAt, true)}</Row>
          {lead.internalNotes ? (
            <div style={{ marginTop: 12 }}>
              <span style={{ ...labelCol, display: "block", marginBottom: 6 }}>Interne Notizen</span>
              <div
                style={{
                  padding: "12px 14px",
                  background: "#f8f7f2",
                  border: "1px solid #e8e7e0",
                  borderRadius: 3,
                  fontSize: 13,
                  lineHeight: 1.65,
                  color: "#2a2a26",
                  whiteSpace: "pre-wrap",
                }}
              >
                {lead.internalNotes}
              </div>
            </div>
          ) : (
            <Row label="Interne Notizen">
              <Dash />
            </Row>
          )}
        </div>

        {/* Zustellung */}
        <div style={cardStyle}>
          <span style={eyebrowStyle}>Zustellung</span>
          <Row label="Interne Benachrichtigung">
            <DeliveryBadge status={lead.emailDeliveryStatus} />
          </Row>
          <Row label="Auswertungs-Mail an den Nutzer">
            <DeliveryBadge status={lead.userEmailStatus} />
          </Row>
          <Row label="Letzter Provider-Fehler">
            {lead.emailError ? (
              <code style={{ fontSize: 12, color: "#8a1a1a", wordBreak: "break-word" }}>
                {lead.emailError}
              </code>
            ) : (
              <Dash />
            )}
          </Row>
        </div>

        {/* Diagnose */}
        {scan ? (
          <>
            <div style={cardStyle}>
              <span style={eyebrowStyle}>Sichtbarkeitsprüfung</span>
              <Row label="Geprüfte URL">
                {scan.url ? (
                  <a href={scan.url} target="_blank" rel="noopener noreferrer" style={{ color: "#1a4a8a" }}>
                    {scan.url}
                  </a>
                ) : (
                  <Dash />
                )}
              </Row>
              <Row label="Marke laut Scan">{scan.brandName || <Dash />}</Row>
              <Row label="Geprüft am">{formatDate(scan.fetchedAt ?? null, true)}</Row>
              <Row label="Gesamtscore">
                <strong style={{ color: scoreColor(scan.overallScore) }}>
                  {scan.overallScore}/100
                </strong>
                {scan.overallStatus ? ` · ${scan.overallStatus}` : ""}
              </Row>
              <Row label="Schwache Bereiche">{String(scan.gapCount ?? 0)}</Row>
              {scan.meaning && (
                <div style={{ marginTop: 12 }}>
                  <span style={{ ...labelCol, display: "block", marginBottom: 4 }}>Was das bedeutet</span>
                  <p style={{ margin: 0, fontSize: 13, color: "#45423b", lineHeight: 1.6 }}>{scan.meaning}</p>
                </div>
              )}
              {scan.nextStep && (
                <div style={{ marginTop: 12 }}>
                  <span style={{ ...labelCol, display: "block", marginBottom: 4 }}>
                    Nächster sinnvoller Schritt
                  </span>
                  <p style={{ margin: 0, fontSize: 13, color: "#45423b", lineHeight: 1.6 }}>{scan.nextStep}</p>
                </div>
              )}
            </div>

            {scores.length > 0 && (
              <div style={cardStyle}>
                <span style={eyebrowStyle}>Score Breakdown</span>
                {[...scores].sort((a, b) => a.score - b.score).map((card) => (
                  <ScoreLine key={card.id ?? card.label} card={card} />
                ))}
              </div>
            )}

            {checks.length > 0 && (
              <div style={cardStyle}>
                <span style={eyebrowStyle}>KI-Antwortfragen</span>
                {checks.map((check, i) => (
                  <AnswerCheck key={`${check.question}-${i}`} check={check} index={i} />
                ))}
              </div>
            )}

            {observations.length > 0 && (
              <div style={cardStyle}>
                <span style={eyebrowStyle}>Was wir gesehen haben</span>
                {observations.map((o, i) => (
                  <ObservationLine key={`${o.label}-${i}`} observation={o} />
                ))}
              </div>
            )}

            {scan.signals && (
              <div style={cardStyle}>
                <span style={eyebrowStyle}>Technische Signale</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "0 24px" }}>
                  {signalRows(scan.signals).map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        gap: 10,
                        padding: "5px 0",
                        borderBottom: "1px solid #f0efe8",
                        fontSize: 12,
                      }}
                    >
                      <span style={{ width: 170, flexShrink: 0, color: "#8a8478" }}>{label}</span>
                      <span style={{ color: "#2a2a26", minWidth: 0, wordBreak: "break-word" }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={cardStyle}>
            <span style={eyebrowStyle}>Sichtbarkeitsprüfung</span>
            <p style={{ margin: 0, fontSize: 13, color: "#8a8478", lineHeight: 1.6 }}>
              Für diesen Lead ist kein auswertbares Scan-Ergebnis hinterlegt. Das ist normal bei
              Anfragen über den KI-Sichtbarkeits-Brief.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
