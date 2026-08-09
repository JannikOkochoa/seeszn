"use client";

// ─── First Move: der Kaufweg als eine Sequenz ─────────────────────────────────
// V6. Der Besucher soll nacheinander verstehen, was er kauft, sehen, dass wir
// wirklich arbeiten, einen belastbaren Hinweis bekommen und dann entscheiden.
// Deshalb liegen Domainfeld, Prüfung, Signal, Angebot, Fit Check und Anfrage in
// einer Komponente: sie teilen sich denselben Zustand.
//
// Alles, was auch ohne Interaktion gelten muss (Ablauf, Proof, Angebot, FAQ),
// kommt als server-gerenderter Slot herein und bleibt server-gerendert. Diese
// Komponente ordnet nur die Reihenfolge und schaltet die interaktiven Teile.
//
// Zwei Wege sind ausdrücklich vorgesehen:
//   Discovery  Hero → Domain → Prüfung → Signal → Proof → Angebot → Fit → Start
//   Fast Lane  Hero → "First Move starten" → Angebot → Fit → Start
// Wer das Produkt schon verstanden hat, muss den Scan nie durchlaufen.
//
// Ehrlichkeitsregeln, die dieser Code durchsetzt:
//   - Die Zustandsleiste zeigt nur Zustände, die der Server gemeldet hat. Kein
//     Prozentbalken, keine erfundene Wartezeit.
//   - Vor der ersten Prüfung steht rechts ein sichtbar gekennzeichnetes
//     Beispiel. Es liegt in einem eigenen Typ, wird nie zum Zustand `finding`,
//     nie mitgeschickt und nie als Scanergebnis getrackt.
//   - Der öffentliche Befund heißt Signal. Er behauptet nicht, die Ursache zu
//     kennen, und enthält keinen Umsetzungsplan.
//   - Kein Signal blockiert den Kauf. Der Fit Check läuft auch ohne Scan.
//   - Es gibt keinen Zahlungsanbieter, also auch keine Zahlungsbestätigung.

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { track } from "@/lib/first-move/analytics";
import {
  NO_SIGNAL_BODY,
  NO_SIGNAL_LABEL,
  NO_SIGNAL_TITLE,
  PUBLIC_EVIDENCE_LABEL,
  PUBLIC_INTERVENTION_LABEL,
  PUBLIC_SIGNAL_LABEL,
  PUBLIC_VERIFY_LINE,
} from "@/lib/first-move/disclosure";
import { EXAMPLE_FINDING, EXAMPLE_FINDING_PAID } from "@/lib/first-move/example";
import { READ_ONLY_GUARANTEES, READ_ONLY_UNLOCKS } from "@/lib/first-move/paid";
import { PROOF_CASES, relevantCaseId } from "@/lib/first-move/proof";
import {
  DELIVERY_DISPLAY,
  HERO_FACT_LINE,
  PRICE_DISPLAY_NET,
  RISK_REVERSAL_SHORT,
} from "@/lib/first-move/product";
import { SPEND_BANDS } from "@/lib/first-move/types";
import type {
  ApprovalPath,
  Complexity,
  FirstMoveRoute,
  ImplementationPath,
  PublicFinding,
  ScanEvent,
  ScanStateEvent,
  SpendBand,
} from "@/lib/first-move/types";

type Variant = "master" | "paid";
type Phase = "idle" | "scanning" | "result" | "empty" | "error";
type Lane = "discovery" | "fast";

interface FunnelProps {
  variant: Variant;
  adsOAuthEnabled?: boolean;
  /** Eyebrow, H1 und Lead. Server-gerendert. */
  heroCopy: ReactNode;
  /** Die Steinplatte. Server-gerendert. */
  heroPlate: ReactNode;
  /** Server-gerenderte Abschnitte in ihrer Reihenfolge. */
  process: ReactNode;
  proof: ReactNode;
  offer: ReactNode;
  faq: ReactNode;
  final: ReactNode;
}

const IMPLEMENTATION_OPTIONS: { id: ImplementationPath; label: string }[] = [
  { id: "seeszn_access", label: "SEESZN bekommt Zugriff" },
  { id: "internal_team", label: "Unser internes Team setzt um" },
  { id: "existing_agency", label: "Unsere Agentur oder Entwickler setzen um" },
  { id: "none", label: "Aktuell gibt es keinen Umsetzungsweg" },
];

const APPROVAL_OPTIONS: { id: ApprovalPath; label: string }[] = [
  { id: "direct", label: "Direkte Entscheidung möglich" },
  { id: "internal_small", label: "Interne Abstimmung, 1 bis 2 Personen" },
  { id: "external", label: "Externe Freigabe nötig" },
  { id: "unknown", label: "Noch unklar" },
];

const COMPLEXITY_OPTIONS: { id: Complexity; label: string }[] = [
  { id: "simple", label: "Einfach" },
  { id: "medium", label: "Mittel" },
  { id: "high", label: "Hoch" },
  { id: "very_high", label: "Sehr hoch" },
];

/**
 * Der Kanalkontext wird erst gefragt, wenn öffentlich kein Signal entstanden ist
 * und die Angabe den nächsten Schritt wirklich schärft.
 */
const CHANNEL_OPTIONS: { id: FirstMoveRoute; label: string }[] = [
  { id: "search", label: "Search" },
  { id: "ai_search", label: "AI Search" },
  { id: "paid_acquisition", label: "Paid Acquisition" },
  { id: "unsure", label: "Weiß ich nicht" },
];

const LEVEL_LABEL: Record<string, string> = { low: "Niedrig", medium: "Mittel", high: "Hoch" };

/** Was der öffentliche Scan liest. Im Ruhezustand als Liste, nicht als Verlauf. */
const READS: string[] = [
  "Domain und Erreichbarkeit",
  "robots.txt",
  "Sitemap und Scope",
  "eine Stichprobe öffentlicher Seiten",
  "Seitentemplates",
  "technische Signale",
  "semantische Muster",
];

const PAID_READS: string[] = [
  "Domain und Erreichbarkeit",
  "öffentlich sichtbare Mess- und Tag-Signale",
  "Consent-Implementierung",
  "Konversionspfad der Einstiegsseite",
  "Formularreibung und Aussageklarheit",
  "Ladeverhalten der Einstiegsseite",
];

export default function FirstMoveFunnel({
  variant,
  adsOAuthEnabled = false,
  heroCopy,
  heroPlate,
  process,
  proof,
  offer,
  faq,
  final,
}: FunnelProps) {
  const isPaid = variant === "paid";
  const uid = useId();
  // Das Beispiel folgt dem Kanal der Seite, damit der Message Match hält.
  const example = isPaid ? EXAMPLE_FINDING_PAID : EXAMPLE_FINDING;

  const [domain, setDomain] = useState("");
  const [spendBand, setSpendBand] = useState<SpendBand>("unknown");
  const [channel, setChannel] = useState<FirstMoveRoute | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [log, setLog] = useState<ScanStateEvent[]>([]);
  const [finding, setFinding] = useState<PublicFinding | null>(null);
  const [emptyReason, setEmptyReason] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [scannedDomain, setScannedDomain] = useState("");

  const [fitOpen, setFitOpen] = useState(false);
  const [lane, setLane] = useState<Lane>("fast");
  const [implementation, setImplementation] = useState<ImplementationPath | null>(null);
  const [approval, setApproval] = useState<ApprovalPath | null>(null);
  const [complexity, setComplexity] = useState<Complexity | null>(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [sending, setSending] = useState<false | "checkout" | "result_email">(false);
  const [sent, setSent] = useState<null | "checkout" | "result_email">(null);
  const [formError, setFormError] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);
  /**
   * Nur lokal: die Route meldet, dass sie in der Entwicklung weder gespeichert
   * noch versendet hat. Das wird sichtbar gemacht, damit ein lokaler Test nicht
   * wie ein erfolgreicher Produktionslauf aussieht.
   */
  const [devNotice, setDevNotice] = useState("");

  const resultRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const offerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const viewedRef = useRef(false);

  // Ein Seitenaufruf des Produkts, einmal pro Mount.
  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    track("first_move_view", { surface: variant });
  }, [variant]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Hat der Besucher das kommerzielle Angebot wirklich gesehen? Einmal pro Sitzung.
  useEffect(() => {
    const node = offerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    let fired = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || fired) continue;
          fired = true;
          track("offer_view", { surface: variant, lane, signal: finding !== null });
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [variant, lane, finding]);

  const resetForNewScan = useCallback(() => {
    setLog([]);
    setFinding(null);
    setEmptyReason("");
    setErrorMsg("");
    setEmailOpen(false);
    setSent(null);
    setFormError("");
  }, []);

  const start = useCallback(
    async (raw?: string) => {
      const value = (raw ?? domain).trim();
      if (!value) {
        setErrorMsg("Bitte gib eine Domain ein, zum Beispiel deine-domain.de");
        setPhase("error");
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      resetForNewScan();
      setPhase("scanning");
      setLane("discovery");
      track("domain_submit", { surface: variant });
      track("public_scan_start", {
        surface: variant,
        route: isPaid ? "paid_acquisition" : (channel ?? "unsure"),
        spend_band: isPaid ? spendBand : undefined,
      });

      const endpoint = isPaid ? "/api/first-move/paid-check" : "/api/first-move/scan";
      const payload = isPaid
        ? { domain: value, spendBand }
        : { domain: value, route: channel ?? "unsure" };

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        if (!res.body) throw new Error("no stream");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let done = false;

        while (!done) {
          const chunk = await reader.read();
          done = chunk.done;
          buffer += decoder.decode(chunk.value ?? new Uint8Array(), { stream: !done });

          let index = buffer.indexOf("\n");
          while (index !== -1) {
            const rawLine = buffer.slice(0, index).trim();
            buffer = buffer.slice(index + 1);
            index = buffer.indexOf("\n");
            if (!rawLine) continue;

            let event: ScanEvent;
            try {
              event = JSON.parse(rawLine) as ScanEvent;
            } catch {
              continue;
            }

            if (event.type === "state") {
              setLog((prev) => [...prev, event]);
              track("public_scan_signal", { surface: variant, state: event.state });
            } else if (event.type === "error") {
              setErrorMsg(event.message);
              setPhase("error");
            } else if (event.type === "result") {
              setScannedDomain(event.domain);
              if (event.finding) {
                setFinding(event.finding);
                setComplexity(event.finding.suggestedComplexity ?? null);
                setPhase("result");
                track("public_scan_complete", { surface: variant, qualified: true });
                track("finding_view", {
                  surface: variant,
                  route: event.finding.route,
                  impact: event.finding.impact,
                  confidence: event.finding.confidence,
                });
              } else {
                setEmptyReason(event.notQualifiedReason ?? "");
                setPhase("empty");
                track("public_scan_complete", { surface: variant, qualified: false });
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        setErrorMsg("Die Prüfung ist fehlgeschlagen. Bitte versuche es erneut.");
        setPhase("error");
      }
    },
    [channel, domain, isPaid, resetForNewScan, spendBand, variant],
  );

  // Das Domainfeld im Abschluss startet dieselbe Prüfung, statt einen zweiten
  // Zustand aufzumachen.
  useEffect(() => {
    function onExternalStart(e: Event) {
      const detail = (e as CustomEvent<{ domain?: string }>).detail;
      if (!detail?.domain) return;
      setDomain(detail.domain);
      document.getElementById("pruefung")?.scrollIntoView({ behavior: "smooth", block: "start" });
      void start(detail.domain);
    }
    window.addEventListener("fm:start", onExternalStart as EventListener);
    return () => window.removeEventListener("fm:start", onExternalStart as EventListener);
  }, [start]);

  // Sobald ein Ergebnis steht, wandert der Fokus dorthin.
  useEffect(() => {
    if (phase === "result" || phase === "empty") {
      resultRef.current?.focus({ preventScroll: true });
    }
  }, [phase]);

  function goToOffer() {
    document.getElementById("angebot")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openFitCheck() {
    setFitOpen(true);
    track("implementation_check_start", { surface: variant, lane, signal: finding !== null });
    window.setTimeout(() => fitRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }

  // ── Eligibility ────────────────────────────────────────────────────────────
  const gate = (() => {
    if (implementation === "none") {
      return {
        k: "Kein Checkout",
        t: "Ohne Umsetzungsweg gibt es keinen First Move.",
        b: "Ein First Move ist eine Umsetzung. Wir klären zuerst, wer die Änderung live bringen kann. Danach ist der Festpreis wieder die richtige Form.",
        next: "Umsetzungsweg klären",
      };
    }
    if (approval === "unknown") {
      return {
        k: "Checkout pausiert",
        t: "Der Freigabeweg ist noch offen.",
        b: "Ohne geklärte Freigabe startet die Lieferfrist nicht. Wir klären den Freigabeweg kurz vorab, damit die Frist hält.",
        next: "Freigabeweg klären",
      };
    }
    if (complexity === "very_high") {
      return {
        k: "Scoped Review",
        t: "Dieser Scope ist für den direkten Kauf zu groß.",
        b: "Bei sehr hoher Komplexität grenzen wir den Move vorher gemeinsam ein, damit der Festpreis trägt. Der Preis steigt dadurch nicht, geprüft wird die Eignung.",
        next: "Scope eingrenzen",
      };
    }
    if (
      finding &&
      !finding.eligibility.eligible &&
      finding.eligibility.reason !== "paid_read_only_required"
    ) {
      return {
        k: "Scoped Review",
        t: "Der Scope braucht vorab eine Eingrenzung.",
        b: finding.eligibility.nextAction ?? "",
        next: "Scope eingrenzen",
      };
    }
    return null;
  })();

  const fitComplete = implementation !== null && approval !== null && complexity !== null;
  const eligible = fitComplete && gate === null;

  useEffect(() => {
    if (fitComplete) {
      track("fit_check_complete", {
        surface: variant,
        lane,
        eligible: gate === null,
        gate: gate?.k ?? "none",
      });
    }
    // Nur beim Wechsel auf vollständig, nicht bei jedem Rerender.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitComplete]);

  // ── Absenden ───────────────────────────────────────────────────────────────
  async function submit(intent: "checkout" | "result_email", form: HTMLFormElement) {
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    if (!email.includes("@")) {
      setFormError("Bitte gib eine gültige Firmen-E-Mail an.");
      return;
    }
    setFormError("");
    setSending(intent);
    if (intent === "checkout") track("first_move_request_start", { surface: variant, lane });

    try {
      const res = await fetch("/api/first-move/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent,
          email,
          name: String(data.get("name") ?? ""),
          note: String(data.get("note") ?? ""),
          companyUrlConfirm: String(data.get("companyUrlConfirm") ?? ""),
          domain: scannedDomain || domain.trim(),
          surface: isPaid ? "google_ads" : "master",
          channelContext: channel ?? "",
          fitCheck:
            intent === "checkout"
              ? `Umsetzung: ${implementation ?? "n/a"} · Freigabe: ${approval ?? "n/a"} · Komplexität: ${complexity ?? "n/a"}`
              : "",
          finding,
        }),
      });
      const body = (await res.json().catch(() => null)) as {
        error?: string;
        devSuppressed?: boolean;
        devReason?: string;
      } | null;
      if (!res.ok) {
        setFormError(body?.error ?? "Das hat nicht geklappt. Bitte versuche es erneut.");
        setSending(false);
        return;
      }
      setDevNotice(body?.devSuppressed ? (body.devReason ?? "") : "");
      setSent(intent);
      if (intent === "checkout") track("first_move_request_submit", { surface: variant, lane });
    } catch {
      setFormError("Das hat nicht geklappt. Bitte versuche es erneut.");
    } finally {
      setSending(false);
    }
  }

  const relevantCase =
    phase === "result" || phase === "empty"
      ? PROOF_CASES[
          relevantCaseId(
            finding?.route ?? (isPaid ? "paid_acquisition" : channel ?? undefined),
            finding?.surfaceKind,
          )
        ]
      : null;

  const scopeLabel = gate ? gate.k : "geeignet für den Festpreis";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <section className="fm-hero">
        <div className="fm-wrap">
          <div className="fm-hero-grid">
            <div className="fm-hero-copy">
              {heroCopy}

              <form
                className="fm-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void start();
                }}
              >
                <div className="fm-field">
                  <label htmlFor={`${uid}-domain`} className="fm-skip">
                    Deine Domain
                  </label>
                  <input
                    id={`${uid}-domain`}
                    name="domain"
                    className="fm-input"
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    spellCheck={false}
                    placeholder="deine-domain.de"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    aria-describedby={`${uid}-facts`}
                    aria-invalid={phase === "error" ? true : undefined}
                  />
                  <button type="submit" className="fm-btn" disabled={phase === "scanning"}>
                    {phase === "scanning"
                      ? "Prüfung läuft"
                      : isPaid
                        ? "Paid Check starten"
                        : "Domain prüfen"}
                  </button>
                </div>

                {isPaid ? (
                  <fieldset className="fm-bands">
                    <legend className="fm-eyebrow">Monatliches Mediabudget</legend>
                    <div className="fm-bands-grid">
                      {SPEND_BANDS.map((band) => (
                        <button
                          key={band.id}
                          type="button"
                          className="fm-band"
                          aria-pressed={spendBand === band.id}
                          onClick={() => {
                            setSpendBand(band.id);
                            track("spend_band_select", { surface: variant, spend_band: band.id });
                          }}
                        >
                          {band.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ) : null}

                <p id={`${uid}-facts`} className="fm-facts">
                  {HERO_FACT_LINE}
                </p>
                <p className="fm-micro">
                  {isPaid
                    ? "Vor dem ersten Ergebnis brauchen wir weder eine E-Mail noch Zugriff auf dein Google-Ads-Konto. Wir lesen zuerst nur öffentlich abrufbare Signale."
                    : "Vor dem ersten Ergebnis brauchen wir keine E-Mail. Wir lesen nur öffentlich abrufbare Signale, und es entsteht kein Retainer."}
                </p>
                {phase === "error" && errorMsg ? (
                  <p className="fm-error" role="alert">
                    {errorMsg}
                  </p>
                ) : null}
              </form>
            </div>

            <div className="fm-hero-plate">{heroPlate}</div>
          </div>
        </div>
      </section>

      {/* ── Prüfung ──────────────────────────────────────────────────────── */}
      <section id="pruefung" className="fm-stage" aria-labelledby="fm-stage-h">
        <div className="fm-wrap">
          <div className="fm-stage-head">
            <span className="fm-eyebrow">
              {phase === "scanning" ? "Prüfung läuft" : "Öffentliche Prüfung"}
            </span>
            <h2 id="fm-stage-h" className="fm-stage-title">
              {phase === "result"
                ? PUBLIC_SIGNAL_LABEL
                : phase === "empty"
                  ? NO_SIGNAL_LABEL
                  : phase === "scanning"
                    ? `Wir lesen ${scannedDomain || "die Oberfläche"}`
                    : isPaid
                      ? "Was wir ohne Account-Zugriff sehen"
                      : "Was wir öffentlich lesen"}
            </h2>
          </div>

          <div className="fm-stage-body">
            {/* Links: Zustände. Nur echte Schritte, ohne Prozentbalken. */}
            <div className="fm-stage-log">
              {phase === "idle" || phase === "error" ? (
                <ul className="fm-log">
                  {(isPaid ? PAID_READS : READS).map((item) => (
                    <li key={item}>
                      <span className="fm-log-label">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="fm-log" aria-live="polite" aria-atomic="false">
                  {log.map((entry, i) => (
                    <li
                      key={`${entry.state}-${i}`}
                      data-live={i === log.length - 1 && phase === "scanning"}
                    >
                      <span>
                        <span className="fm-log-label">{entry.label}</span>
                        {entry.detail ? <span className="fm-log-detail">{entry.detail}</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <p className="fm-micro fm-stage-note">
                {phase === "scanning"
                  ? "Die Prüfung läuft gegen die echte Oberfläche. Jeder Zustand erscheint erst, wenn der Schritt fertig ist."
                  : isPaid
                    ? "Ohne Account-Zugriff und ohne E-Mail. Was hier nicht öffentlich sichtbar ist, behaupten wir auch nicht."
                    : "Ohne Zugriff auf deine Systeme und ohne E-Mail. Nur was öffentlich abrufbar ist."}
              </p>
            </div>

            {/* Rechts: Ergebnis. */}
            <div className="fm-stage-result" ref={resultRef} tabIndex={-1}>
              {/* Vor der ersten Prüfung: ein sichtbar erfundenes Beispiel. Es liegt
                  in einem eigenen Typ, geht nie in den Zustand eines echten
                  Ergebnisses und verschwindet, sobald eine Prüfung startet. */}
              {phase === "idle" || phase === "error" ? (
                <div className="fm-example">
                  <span className="fm-badge fm-badge--example">{example.label}</span>
                  <h3 className="fm-finding-title">{example.title}</h3>
                  <p className="fm-serif">{example.summary}</p>

                  <div className="fm-block">
                    <span className="fm-block-k">{PUBLIC_EVIDENCE_LABEL}</span>
                    <ul className="fm-evidence">
                      {example.evidence.map((item) => (
                        <li key={item.id}>{item.observation}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="fm-metrics">
                    <div className="fm-metric fm-metric--high">
                      <span className="fm-metric-k">Impact</span>
                      <span className="fm-metric-v">{example.impact}</span>
                      <span className="fm-metric-bar" aria-hidden="true" />
                    </div>
                    <div className="fm-metric fm-metric--medium">
                      <span className="fm-metric-k">Confidence</span>
                      <span className="fm-metric-v">{example.confidence}</span>
                      <span className="fm-metric-bar" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="fm-block">
                    <span className="fm-block-k">{PUBLIC_INTERVENTION_LABEL}</span>
                    <p className="fm-block-v">{example.interventionType}</p>
                  </div>

                  <p className="fm-block-v fm-verify">{example.afterVerification}</p>
                  <p className="fm-micro">{example.cta}</p>
                </div>
              ) : null}

              {phase === "scanning" ? (
                <div className="fm-stage-empty">
                  <p className="fm-serif">
                    Wir vergleichen gerade die gelesenen Seiten und prüfen, ob mehrere Signale auf
                    denselben Engpass zeigen.
                  </p>
                </div>
              ) : null}

              {phase === "result" && finding ? (
                <>
                  <span className="fm-badge">{PUBLIC_SIGNAL_LABEL}</span>
                  <h3 className="fm-finding-title">{finding.title}</h3>
                  {finding.summary ? <p className="fm-serif">{finding.summary}</p> : null}

                  {finding.evidence.length ? (
                    <div className="fm-block">
                      <span className="fm-block-k">{PUBLIC_EVIDENCE_LABEL}</span>
                      <ul className="fm-evidence">
                        {finding.evidence.map((item) => (
                          <li key={item.id}>{item.observation}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="fm-metrics">
                    {(
                      [
                        ["Impact", finding.impact],
                        ["Confidence", finding.confidence],
                      ] as const
                    ).map(([label, level]) => (
                      <div className={`fm-metric fm-metric--${level}`} key={label}>
                        <span className="fm-metric-k">{label}</span>
                        <span className="fm-metric-v">{LEVEL_LABEL[level]}</span>
                        <span className="fm-metric-bar" aria-hidden="true" />
                      </div>
                    ))}
                  </div>

                  {/* Die Art des Eingriffs zeigt die Einschätzung. Welche Seite
                      das Ziel wird und wie umgesetzt wird, gehört zum Produkt. */}
                  {finding.interventionType ? (
                    <div className="fm-block">
                      <span className="fm-block-k">{PUBLIC_INTERVENTION_LABEL}</span>
                      <p className="fm-block-v">{finding.interventionType}</p>
                    </div>
                  ) : null}

                  <p className="fm-block-v fm-verify">{PUBLIC_VERIFY_LINE}</p>

                  {/* Read-only erscheint erst, wenn ein echter öffentlicher Befund steht. */}
                  {isPaid && finding.requiresReadOnly ? (
                    <details
                      className="fm-details"
                      onToggle={(e) => {
                        if ((e.currentTarget as HTMLDetailsElement).open) {
                          track("evidence_expand", { surface: variant, scope: "read_only" });
                        }
                      }}
                    >
                      <summary>Was der Account zusätzlich zeigt</summary>
                      <div className="fm-details-body">
                        <p className="fm-block-v">
                          Suchbegriffe, Attribution, Brand gegen Non-Brand und Leadqualität liegen im
                          Konto. Read-only heißt: {READ_ONLY_GUARANTEES.join(", ")}.
                        </p>
                        <p className="fm-block-v">Damit prüfbar: {READ_ONLY_UNLOCKS.join(" · ")}.</p>
                        {adsOAuthEnabled ? (
                          <div className="fm-actions">
                            <a
                              href="/api/first-move/ads/connect"
                              className="fm-btn fm-btn--ghost fm-btn--sm"
                              onClick={() => track("paid_connect_click", { surface: variant })}
                            >
                              Google Ads read-only verbinden
                            </a>
                          </div>
                        ) : (
                          <p className="fm-block-v">
                            Den Read-only-Zugriff richten wir im Kickoff gemeinsam ein, in unter 15
                            Minuten. Vor dem Kauf wird nichts verbunden und nichts geändert.
                          </p>
                        )}
                      </div>
                    </details>
                  ) : null}

                  <div className="fm-actions">
                    <button type="button" className="fm-btn" onClick={goToOffer}>
                      First Move prüfen
                    </button>
                    <button
                      type="button"
                      className="fm-link-secondary"
                      onClick={() => setEmailOpen((v) => !v)}
                      aria-expanded={emailOpen}
                    >
                      Ergebnis per E-Mail senden
                    </button>
                  </div>
                </>
              ) : null}

              {phase === "empty" ? (
                <>
                  <span className="fm-badge">{NO_SIGNAL_LABEL}</span>
                  <h3 className="fm-finding-title">{NO_SIGNAL_TITLE}</h3>
                  {emptyReason ? <p className="fm-block-v">{emptyReason}</p> : null}
                  <p className="fm-block-v">{NO_SIGNAL_BODY}</p>

                  <fieldset className="fm-channel">
                    <legend className="fm-channel-legend">
                      Wo merkst du das Problem aktuell am stärksten?
                    </legend>
                    <div className="fm-channel-opts">
                      {CHANNEL_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          className="fm-fit-opt"
                          aria-pressed={channel === opt.id}
                          onClick={() => {
                            setChannel(opt.id);
                            track("route_select", { surface: variant, route: opt.id });
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  {/* Genau eine Fortsetzung. Ein zweiter Weg, der dasselbe
                      bedeutet, macht den Zustand nur unruhig. */}
                  <div className="fm-actions">
                    <button type="button" className="fm-btn" onClick={goToOffer}>
                      First Move trotzdem prüfen
                    </button>
                  </div>
                </>
              ) : null}

              {/* Sekundärer Weg: Kontakt per Mail. Erst nach einem sichtbaren Ergebnis. */}
              {emailOpen && !sent ? (
                <form
                  className="fm-form fm-form--inset"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void submit("result_email", e.currentTarget);
                  }}
                >
                  <label htmlFor={`${uid}-mail`} className="fm-block-k">
                    Firmen-E-Mail
                  </label>
                  <div className="fm-field">
                    <input
                      id={`${uid}-mail`}
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className="fm-input"
                      placeholder="name@unternehmen.de"
                    />
                    <button type="submit" className="fm-btn fm-btn--sm" disabled={sending !== false}>
                      {sending === "result_email" ? "Wird gesendet" : "Senden"}
                    </button>
                  </div>
                  <input
                    type="text"
                    name="companyUrlConfirm"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="fm-hp"
                  />
                  {formError ? (
                    <p className="fm-error" role="alert">
                      {formError}
                    </p>
                  ) : null}
                </form>
              ) : null}

              {sent === "result_email" ? (
                <p className="fm-micro" role="status">
                  Das ist unterwegs. Wenn nichts ankommt, schreib uns kurz an hello@seeszn.com.
                  {devNotice ? ` ${devNotice}` : ""}
                </p>
              ) : null}
            </div>
          </div>

          {/* Kontextueller Proof: der relevanteste Case, nicht alle drei. */}
          {relevantCase ? (
            <div className="fm-relevant">
              <div className="fm-relevant-k">
                <span className="fm-eyebrow">Passendes Ergebnis</span>
                <span className="fm-relevant-name">{relevantCase.name}</span>
                <span className="fm-case-desc">{relevantCase.descriptor}</span>
              </div>
              <div className="fm-relevant-v">
                <span className="fm-relevant-num">{relevantCase.leadValue}</span>
                <span className="fm-case-kpi-c">{relevantCase.leadCaption}</span>
              </div>
              <div className="fm-relevant-a">
                {relevantCase.note ? (
                  <span className="fm-case-note">{relevantCase.note}</span>
                ) : null}
                <a
                  href="#proof"
                  className="fm-link-secondary"
                  onClick={() => track("proof_expand", { surface: variant, case: relevantCase.id })}
                >
                  Weitere Ergebnisse ansehen
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {process}
      {proof}

      <div ref={offerRef}>{offer}</div>

      {/* ── Fit Check und Start ──────────────────────────────────────────── */}
      <section className="fm-section fm-start" id="start" aria-labelledby="fm-start-h">
        <div className="fm-wrap">
          {!fitOpen ? (
            <div className="fm-start-lead">
              <h2 id="fm-start-h" className="fm-h2">
                Drei Fragen entscheiden, ob der Festpreis trägt.
              </h2>
              <p className="fm-body">
                Umsetzungsweg, Freigabeweg und Komplexität. Danach siehst du, ob wir direkt starten
                können oder den Scope vorher gemeinsam eingrenzen.
              </p>
              <div className="fm-actions">
                <button type="button" className="fm-btn" onClick={openFitCheck}>
                  First Move starten
                </button>
                <span className="fm-micro">
                  {PRICE_DISPLAY_NET} · {DELIVERY_DISPLAY}
                </span>
              </div>
            </div>
          ) : (
            <div className="fm-fit" ref={fitRef}>
              <div>
                <span className="fm-eyebrow">Fit Check</span>
                <h2 id="fm-start-h" className="fm-h2 fm-h2--sm">
                  Passt dieser Move in den Festpreis?
                </h2>
              </div>

              <fieldset className="fm-fit-q">
                <legend className="fm-fit-legend">
                  <span>01</span> Wie kann der Move umgesetzt werden?
                </legend>
                <div className="fm-fit-opts">
                  {IMPLEMENTATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className="fm-fit-opt"
                      aria-pressed={implementation === opt.id}
                      onClick={() => {
                        setImplementation(opt.id);
                        track("fit_check_step", { surface: variant, step: 1, answer: opt.id });
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="fm-fit-q">
                <legend className="fm-fit-legend">
                  <span>02</span> Wie ist der Freigabeweg?
                </legend>
                <div className="fm-fit-opts">
                  {APPROVAL_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className="fm-fit-opt"
                      aria-pressed={approval === opt.id}
                      onClick={() => {
                        setApproval(opt.id);
                        track("fit_check_step", { surface: variant, step: 2, answer: opt.id });
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="fm-fit-q">
                <legend className="fm-fit-legend">
                  <span>03</span> Wie komplex ist die Umsetzung?
                </legend>
                <div className="fm-fit-opts">
                  {COMPLEXITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className="fm-fit-opt"
                      aria-pressed={complexity === opt.id}
                      onClick={() => {
                        setComplexity(opt.id);
                        track("fit_check_step", { surface: variant, step: 3, answer: opt.id });
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="fm-micro">
                  {finding?.suggestedComplexity
                    ? "Aus der Prüfung vorgeschlagen, du kannst korrigieren. Die Komplexität verändert den Preis nicht, sie entscheidet über die Eignung."
                    : "Die Komplexität verändert den Preis nicht, sie entscheidet über die Eignung."}
                </p>
              </fieldset>

              {gate ? (
                <div className="fm-gate" role="status">
                  <span className="fm-gate-k">{gate.k}</span>
                  <span className="fm-gate-t">{gate.t}</span>
                  <p className="fm-block-v">{gate.b}</p>
                  {!checkoutOpen && !sent ? (
                    <div className="fm-actions">
                      <button
                        type="button"
                        className="fm-btn fm-btn--ghost"
                        onClick={() => setCheckoutOpen(true)}
                      >
                        {gate.next}
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {eligible && !checkoutOpen && !sent ? (
                <div className="fm-actions">
                  <button
                    type="button"
                    className="fm-btn"
                    onClick={() => {
                      setCheckoutOpen(true);
                      track("first_move_request_start", { surface: variant, lane });
                    }}
                  >
                    First Move starten
                  </button>
                  <span className="fm-micro">
                    {PRICE_DISPLAY_NET} · {DELIVERY_DISPLAY} · {RISK_REVERSAL_SHORT}
                  </span>
                </div>
              ) : null}

              {checkoutOpen && !sent ? (
                <form
                  className="fm-checkout"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void submit("checkout", e.currentTarget);
                  }}
                >
                  {/* Zusammenfassung vor dem Absenden. Kein Zahlungsvorgang. */}
                  <dl className="fm-summary">
                    <div>
                      <dt>Produkt</dt>
                      <dd>SEESZN First Move</dd>
                    </div>
                    <div>
                      <dt>Preis</dt>
                      <dd>{PRICE_DISPLAY_NET}</dd>
                    </div>
                    <div>
                      <dt>Umfang</dt>
                      <dd>{scopeLabel}</dd>
                    </div>
                    <div>
                      <dt>Lieferung</dt>
                      <dd>{DELIVERY_DISPLAY}</dd>
                    </div>
                    <div>
                      <dt>Nächster Schritt</dt>
                      <dd>
                        {gate
                          ? "Wir melden uns, um den Punkt oben zu klären."
                          : "Wir verifizieren den Befund und bestätigen den Scope schriftlich. Danach folgt die Rechnung."}
                      </dd>
                    </div>
                  </dl>

                  <div className="fm-cols2">
                    <div>
                      <label htmlFor={`${uid}-name`} className="fm-block-k">
                        Name
                      </label>
                      <div className="fm-field">
                        <input
                          id={`${uid}-name`}
                          name="name"
                          className="fm-input"
                          autoComplete="name"
                          placeholder="Vor- und Nachname"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor={`${uid}-cemail`} className="fm-block-k">
                        Firmen-E-Mail
                      </label>
                      <div className="fm-field">
                        <input
                          id={`${uid}-cemail`}
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          className="fm-input"
                          placeholder="name@unternehmen.de"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor={`${uid}-note`} className="fm-block-k">
                      Kontext, optional
                    </label>
                    <div className="fm-field">
                      <input
                        id={`${uid}-note`}
                        name="note"
                        className="fm-input"
                        placeholder="Was wir vorab wissen sollten"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    name="companyUrlConfirm"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="fm-hp"
                  />
                  {formError ? (
                    <p className="fm-error" role="alert">
                      {formError}
                    </p>
                  ) : null}
                  <div className="fm-actions">
                    <button type="submit" className="fm-btn" disabled={sending !== false}>
                      {sending === "checkout"
                        ? "Wird gesendet"
                        : gate
                          ? "Anfrage senden"
                          : "First Move anfragen"}
                    </button>
                    <span className="fm-micro">
                      Die Anfrage ist verbindlich für den Festpreis. Eine Zahlung erfolgt hier nicht.
                    </span>
                  </div>
                </form>
              ) : null}

              {sent === "checkout" ? (
                <div className="fm-gate" role="status">
                  <span className="fm-gate-k">Angenommen</span>
                  <span className="fm-gate-t">Deine Anfrage liegt bei uns.</span>
                  <p className="fm-block-v">
                    Wir verifizieren den Befund und bestätigen dir den Scope schriftlich. Mit der
                    Scope-Bestätigung bekommst du die Rechnung über {PRICE_DISPLAY_NET}.{" "}
                    {DELIVERY_DISPLAY}.
                  </p>
                  {devNotice ? <p className="fm-micro">{devNotice}</p> : null}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      {faq}
      {final}
    </>
  );
}
