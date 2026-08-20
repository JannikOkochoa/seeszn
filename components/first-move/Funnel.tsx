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
//   Discovery  Hero → Domain → Prüfung → Ergebnis → Geschäftslage → Signale →
//              First Move → Angebot → Fit → Start
//   Fast Lane  Hero → "First Move starten" → Angebot → Fit → Start
// Wer das Produkt schon verstanden hat, muss den Scan nie durchlaufen.
//
// Der Discovery-Weg lief bis August 2026 auf einem einzigen Screen: Diagnose,
// Erklärung, Selbsteinschätzung des Kanals und CTA gleichzeitig. Er ist jetzt in
// vier Schritte mit je einem Job zerlegt (`Step`), weil sonst kein Schritt seinen
// Job richtig machen kann:
//
//   diagnosis  Was sehen wir, und was schließt das aus?
//   context    Welches Geschäftsproblem liegt dahinter?
//   signals    Welche nicht-öffentlichen Daten schärfen die Empfehlung?
//   move       Was ist der eine nächste Move?
//
// Entfallen ist dabei die Frage, ob der Besucher sein Problem eher in Search, AI
// Search oder Paid vermutet. Diese Einordnung ist die Arbeit, die er hier sucht.
//
// Der Preis erscheint in keinem dieser vier Schritte. Er steht im Angebot, also
// nach dem formulierten Move, und dort vollständig und vor jeder Bindung.
//
// Seit der Konsolidierung im August 2026 gibt es im deutschen Baum keine eigene
// Scan-Seite mehr. Die Prüfung ist ein Mechanismus des Produkts und liegt im
// Abschnitt #sichtbarkeit-pruefen. Dort steht das Instrument selbst: Frage,
// Domainfeld, eine Handlung, Vertrauenszeilen. Die schmalen Domainfelder im Hero
// und im Abschluss sind Einstiege in dieses eine Instrument, keine zweiten
// Prüfungen: sie füllen denselben Zustand, scrollen zum Instrument und starten
// dort. Ein Ergebnis erscheint deshalb nie außerhalb des sichtbaren Bereichs.
//
// Ehrlichkeitsregeln, die dieser Code durchsetzt:
//   - Die Zustandsleiste zeigt nur Zustände, die der Server gemeldet hat. Kein
//     Prozentbalken, keine erfundene Wartezeit.
//   - Vor der ersten Prüfung steht rechts ein sichtbar gekennzeichnetes
//     Beispiel. Es liegt in einem eigenen Typ, wird nie zum Zustand `finding`,
//     nie mitgeschickt und nie als Scanergebnis getrackt.
//   - Der öffentliche Befund heißt Signal. Er behauptet nicht, die Ursache zu
//     kennen, und enthält keinen Umsetzungsplan.
//   - Die Prüfung endet nie in einem Nichtergebnis. `buildOutcome()` ist total:
//     zu jedem Diagnosezustand gehört eine Kategorie, ein Beleg und genau eine
//     Fortsetzung. Ein Zustand `result === null` kann die Oberfläche nicht mehr
//     erreichen und deshalb auch nicht mehr zu "Kein starkes Signal" werden.
//   - Ein technischer Fehler ist kein Diagnosezustand. `phase === "error"` und
//     die Ergebnisschritte teilen sich keine einzige Zeile Darstellung.
//   - Kein Signal blockiert den Kauf. Der Fit Check läuft auch ohne Scan.
//   - Es gibt keinen Zahlungsanbieter, also auch keine Zahlungsbestätigung.

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { track } from "@/lib/first-move/analytics";
import {
  OBSERVATIONS_LABEL,
  PUBLIC_EVIDENCE_LABEL,
  PUBLIC_INTERVENTION_LABEL,
} from "@/lib/first-move/disclosure";
import { EXAMPLE_FINDING, EXAMPLE_FINDING_PAID } from "@/lib/first-move/example";
import {
  BUSINESS_SITUATIONS,
  CONFIDENCE_BAND_LABEL,
  HIDDEN_SIGNAL_COPY,
  buildFirstMove,
  buildOutcome,
  type BusinessSituation,
} from "@/lib/first-move/outcome";
import { READ_ONLY_GUARANTEES, READ_ONLY_UNLOCKS } from "@/lib/first-move/paid";
import { PROOF_CASES, relevantCaseId } from "@/lib/first-move/proof";
import {
  DELIVERY_DISPLAY,
  HERO_FACT_LINE,
  INCLUDED,
  PRICE_DISPLAY_NET,
  PRICE_FRAME,
  PRICE_PROMISE,
  RISK_REVERSAL_SHORT,
} from "@/lib/first-move/product";
import {
  SIGNALS_STEP,
  SIGNAL_SOURCES,
  hasConnectableSource,
} from "@/lib/first-move/signals";
import { SPEND_BANDS } from "@/lib/first-move/types";
import { SCAN_ANCHOR } from "@/lib/links";
import type { PublicDiagnosis } from "@/lib/first-move/diagnosis";
import type {
  ApprovalPath,
  Complexity,
  ImplementationPath,
  PublicFinding,
  ScanEvent,
  ScanState,
  ScanStateEvent,
  SpendBand,
} from "@/lib/first-move/types";

type Variant = "master" | "paid";
/**
 * `settled` ersetzt das frühere Paar "result" und "empty". Die Unterscheidung
 * "mit Empfehlung" gegen "ohne Empfehlung" gehört ins Ergebnis, nicht in die
 * Ablaufsteuerung: sie hatte an dieser Stelle zwei getrennte Darstellungen
 * erzwungen, von denen eine wie ein Fehlschlag aussah.
 */
type Phase = "idle" | "scanning" | "settled" | "error";

/** Die vier Schritte nach der Prüfung. Jeder hat genau einen Job. */
type Step = "diagnosis" | "context" | "signals" | "move";

const STEP_ORDER: Record<Step, number> = {
  diagnosis: 0,
  context: 1,
  signals: 2,
  move: 3,
};

const STEP_LABEL: Record<Step, string> = {
  diagnosis: "Befund",
  context: "Situation",
  signals: "Signale",
  move: "First Move",
};
type Lane = "discovery" | "fast";
/**
 * Von welchem Einstieg aus die Prüfung gestartet wurde. Zwei Aufgaben: die
 * Fehlermeldung erscheint dort, wo der Besucher gerade steht, und die Attribution
 * bleibt erhalten, obwohl alle Einstiege dieselbe Route benutzen.
 */
type Entry = "hero" | "instrument" | "final";

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

const LEVEL_LABEL: Record<string, string> = { low: "Niedrig", medium: "Mittel", high: "Hoch" };

/**
 * Die Beschriftung des Instruments. Eine Frage, eine Erwartung, eine Handlung,
 * zwei Zusagen. Die Zusagen beschreiben, was der Server wirklich tut: die
 * öffentliche Prüfung braucht weder E-Mail noch Zugang, und sie liest nur, was
 * ohnehin abrufbar ist.
 */
const INSTRUMENT = {
  master: {
    label: "Sichtbarkeitsprüfung",
    question: "Wo bleibt gerade Wachstum liegen?",
    sub: "Eine Domain genügt. Die erste Einordnung erscheint direkt.",
    placeholder: "deine-domain.de",
    cta: "Kostenlos prüfen",
    reads: "Was wir dabei öffentlich lesen",
    trust: [
      "Keine E-Mail nötig. Das Ergebnis erscheint direkt auf dieser Seite.",
      "Nur öffentlich abrufbare Signale. Kein Zugriff auf deine Systeme.",
    ],
  },
  paid: {
    label: "Paid Check",
    question: "Wo verliert dein Budget zuerst?",
    sub: "Eine Einstiegsseite genügt. Der erste Befund erscheint direkt.",
    placeholder: "deine-domain.de",
    cta: "Paid Check starten",
    reads: "Was wir dabei ohne Account-Zugriff lesen",
    trust: [
      "Weder E-Mail noch Google-Ads-Zugriff nötig.",
      "Nur öffentlich abrufbare Signale deiner Einstiegsseite.",
    ],
  },
} as const;

/**
 * Die Prüfung als fünf verständliche Stufen.
 *
 * Darunter laufen unverändert dieselben echten Checks, und ihr Protokoll bleibt
 * einsehbar. Was sich ändert, ist die primäre Erzählung: der Besucher soll
 * sehen, dass wir ein Geschäft einordnen, nicht dass wir eine robots.txt
 * abrufen. Die Zuordnung bildet echte Serverzustände ab, sie erfindet keine
 * Schritte und keine Wartezeit: eine Stufe gilt erst als erreicht, wenn der
 * Server einen ihrer Zustände gemeldet hat.
 */
const STAGES: { id: string; label: string; states: ScanState[] }[] = [
  {
    id: "01",
    label: "Geschäft und Angebot verstehen",
    states: ["normalizing_domain", "domain_reachable"],
  },
  {
    id: "02",
    label: "Erschließung und Scope bestimmen",
    states: ["robots_checked", "sitemap_checked", "scope_detected"],
  },
  {
    id: "03",
    label: "Search und AI Presence prüfen",
    states: ["public_pages_read", "technical_signals_checked"],
  },
  {
    id: "04",
    label: "Muster über Seiten hinweg vergleichen",
    states: ["semantic_patterns_found"],
  },
  {
    id: "05",
    label: "Stärksten Hebel bestimmen",
    states: ["finding_qualifying", "public_finding_ready", "finding_ready", "not_qualified"],
  },
];

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

  /**
   * Die Geschäftslage. Sie ersetzt die frühere Kanalauswahl: gefragt wird nach
   * dem Problem, nicht nach der Disziplin, die es lösen soll.
   */
  const [situation, setSituation] = useState<BusinessSituation | null>(null);
  /** Welcher der vier Ergebnisschritte gerade sichtbar ist. */
  const [step, setStep] = useState<Step>("diagnosis");

  const [phase, setPhase] = useState<Phase>("idle");
  const [log, setLog] = useState<ScanStateEvent[]>([]);
  const [finding, setFinding] = useState<PublicFinding | null>(null);
  /**
   * Der Diagnosezustand des letzten Laufs. Er trägt das Ergebnis auch dann,
   * wenn es keine Empfehlung gibt: ein Scan ohne Befund ist kein Scan ohne
   * Ergebnis.
   */
  const [diagnosis, setDiagnosis] = useState<PublicDiagnosis | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [errorAt, setErrorAt] = useState<Entry>("instrument");
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
  const stageRef = useRef<HTMLElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const stageInputRef = useRef<HTMLInputElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const offerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const viewedRef = useRef(false);
  /**
   * Die zuletzt klassifizierte Kategorie. Als Ref, damit sie in Ereignisse
   * einfließt, ohne die Callbacks bei jedem Rerender neu zu erzeugen.
   */
  const outcomeCategoryRef = useRef<string>("");

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
    setDiagnosis(null);
    setErrorMsg("");
    setEmailOpen(false);
    setSent(null);
    setFormError("");
    setStep("diagnosis");
  }, []);

  const start = useCallback(
    async (raw?: string, entry: Entry = "instrument") => {
      const value = (raw ?? domain).trim();
      if (!value) {
        // Eine leere Eingabe ist ein Bedienfehler, kein Prüfergebnis: die Meldung
        // bleibt am Einstieg stehen, der Fokus geht zurück ins Feld, und es wird
        // nicht zu einem Abschnitt gescrollt, den der Besucher gar nicht sucht.
        setErrorMsg("Bitte gib eine Domain ein, zum Beispiel deine-domain.de");
        setErrorAt(entry);
        setPhase("error");
        (entry === "hero" ? heroInputRef : stageInputRef).current?.focus();
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      resetForNewScan();
      setPhase("scanning");
      setLane("discovery");
      track("domain_submit", { surface: variant, entry });
      track("public_scan_start", {
        surface: variant,
        entry,
        route: isPaid ? "paid_acquisition" : "unsure",
        spend_band: isPaid ? spendBand : undefined,
      });

      const endpoint = isPaid ? "/api/first-move/paid-check" : "/api/first-move/scan";
      // Der Scan bekommt keine Kanalvorgabe mehr. Er soll die Richtung finden,
      // nicht die Vermutung des Besuchers bestätigen.
      const payload = isPaid
        ? { domain: value, spendBand }
        : { domain: value, route: "unsure" };

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
              setErrorAt("instrument");
              setPhase("error");
            } else if (event.type === "result") {
              setScannedDomain(event.domain);
              setDiagnosis(event.diagnosis);
              if (event.finding) {
                setFinding(event.finding);
                setComplexity(event.finding.suggestedComplexity ?? null);
              }
              // Ein Ergebnis ist ein Ergebnis, mit oder ohne Empfehlung. Es gibt
              // deshalb nur noch einen Zielzustand.
              setStep("diagnosis");
              setPhase("settled");

              // Die Klassifikation, nicht nur das Ob. Erst damit ist auswertbar,
              // wie oft die Prüfung in HIDDEN_SIGNAL endet und ob dieser Zustand
              // anders konvertiert als ein gemessener Befund.
              const classified = buildOutcome(event.diagnosis, event.finding, isPaid);
              track("first_move_result_classified", {
                surface: variant,
                category: classified.category,
                kind: classified.kind,
                diagnosis: event.diagnosis.state,
                confidence: classified.confidence,
              });
              // Ein Scan ist immer abgeschlossen, auch ohne Empfehlung. Die
              // Auswertung unterscheidet jetzt, WIE er ausgegangen ist, statt
              // nur ob eine Empfehlung entstanden ist.
              track("public_scan_complete", {
                surface: variant,
                qualified: event.finding !== null,
                diagnosis: event.diagnosis.state,
                interpretation_confidence: event.diagnosis.confidence,
                readable_pages: event.diagnosis.evidenceBase.readablePages,
                limitation: event.diagnosis.limitation,
              });
              if (event.finding) {
                track("finding_view", {
                  surface: variant,
                  route: event.finding.route,
                  impact: event.finding.impact,
                  confidence: event.finding.confidence,
                });
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        setErrorMsg("Die Prüfung ist fehlgeschlagen. Bitte versuche es erneut.");
        setErrorAt("instrument");
        setPhase("error");
      }
    },
    [domain, isPaid, resetForNewScan, spendBand, variant],
  );

  // Das Domainfeld im Abschluss startet dieselbe Prüfung, statt einen zweiten
  // Zustand aufzumachen. Das Scrollen übernimmt start() selbst.
  useEffect(() => {
    function onExternalStart(e: Event) {
      const detail = (e as CustomEvent<{ domain?: string }>).detail;
      if (!detail?.domain) return;
      setDomain(detail.domain);
      void start(detail.domain, "final");
    }
    window.addEventListener("fm:start", onExternalStart as EventListener);
    return () => window.removeEventListener("fm:start", onExternalStart as EventListener);
  }, [start]);

  /**
   * Das Instrument trägt alle Zustände. Wer im Hero oder im Abschluss startet,
   * wird dorthin gebracht, statt auf ein Ergebnis außerhalb des Bildschirms zu
   * warten.
   *
   * Der Sprung liegt bewusst in einem Effekt und nicht in start(): wird er im
   * selben Tick wie der Zustandswechsel ausgelöst, bricht der Browser die weiche
   * Bewegung sofort wieder ab, weil sich das Layout darunter im selben Frame
   * ändert. Nach dem Commit hält sie.
   */
  useEffect(() => {
    if (phase !== "scanning") return;
    const frame = requestAnimationFrame(() => {
      stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  // Sobald ein Ergebnis steht, wandert der Fokus dorthin. Ebenso bei jedem
  // Schrittwechsel: der neue Inhalt ersetzt den alten an derselben Stelle, und
  // ohne verschobenen Fokus bliebe eine Tastatur- oder Screenreader-Bedienung
  // im vorigen Schritt stehen.
  useEffect(() => {
    if (phase === "settled") {
      resultRef.current?.focus({ preventScroll: true });
    }
  }, [phase, step]);

  /**
   * Ein Schrittwechsel ist immer eine Fortsetzung, nie ein Neustart. Er wird an
   * genau einer Stelle vorgenommen, damit Zustand und Ereignis nicht
   * auseinanderlaufen.
   */
  const advance = useCallback(
    (next: Step) => {
      setStep(next);
      track("first_move_result_continue_clicked", {
        surface: variant,
        from: step,
        to: next,
        category: outcomeCategoryRef.current,
      });
    },
    [step, variant],
  );

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
          // Die Geschäftslage, nicht der vermutete Kanal. Der Feldname bleibt,
          // damit bestehende Leads und Auswertungen weiterlaufen. Übertragen
          // wird das Label, nicht die interne ID: die Notiz landet in einer
          // E-Mail, die ein Mensch liest.
          channelContext:
            BUSINESS_SITUATIONS.find((o) => o.id === situation)?.label ?? "",
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

  // Der passende Case erscheint erst am Ende der Sequenz, beim formulierten
  // Move. Auf dem Diagnoseschritt hätte er mit dem Befund um dieselbe
  // Aufmerksamkeit konkurriert.
  const relevantCase =
    phase === "settled" && step === "move"
      ? PROOF_CASES[
          relevantCaseId(
            finding?.route ?? (isPaid ? "paid_acquisition" : undefined),
            finding?.surfaceKind,
          )
        ]
      : null;

  const scopeLabel = gate ? gate.k : "geeignet für den Festpreis";

  // Die Fehlermeldung erscheint genau einmal, und zwar dort, wo der Besucher
  // gerade steht.
  const heroError = phase === "error" && errorAt === "hero" && errorMsg !== "";
  const instrumentError = phase === "error" && errorAt !== "hero" && errorMsg !== "";
  const copy = isPaid ? INSTRUMENT.paid : INSTRUMENT.master;
  const idle = phase === "idle" || phase === "error";
  const settled = phase === "settled";

  // Die Zustandstexte liest jetzt buildOutcome(). Der Paid Check bekommt dort
  // dieselbe engere Fassung wie vorher: er darf über den Aufbau der
  // Einstiegsseite sprechen, nicht über die Wirtschaftlichkeit der Kampagnen.
  /**
   * Das Ergebnis als Objekt. `buildOutcome` ist total: sobald eine Diagnose
   * vorliegt, gibt es eine Kategorie, einen Beleg und eine Fortsetzung. Die
   * Oberfläche kann aus diesem Zustand keinen Dead End mehr bauen.
   */
  const outcome = useMemo(
    () => (diagnosis ? buildOutcome(diagnosis, finding, isPaid) : null),
    [diagnosis, finding, isPaid],
  );

  /** Der vorgeschlagene Move. Entsteht erst, wenn die Geschäftslage vorliegt. */
  const move = useMemo(
    () => (outcome ? buildFirstMove(outcome, situation, finding, INCLUDED) : null),
    [outcome, situation, finding],
  );

  const connectable = hasConnectableSource();

  useEffect(() => {
    if (outcome) outcomeCategoryRef.current = outcome.category;
  }, [outcome]);

  // Eine Schrittansicht wird gemeldet, wenn sie wirklich sichtbar wird. Nicht
  // beim Rendern der Komponente, sondern beim Erreichen des Schritts.
  useEffect(() => {
    if (phase !== "settled" || !outcome) return;
    if (step === "diagnosis") {
      track("first_move_result_viewed", {
        surface: variant,
        category: outcome.category,
        kind: outcome.kind,
      });
    } else if (step === "signals") {
      track("first_move_data_step_viewed", {
        surface: variant,
        category: outcome.category,
        connectable,
      });
    } else if (step === "move") {
      track("first_move_recommendation_viewed", {
        surface: variant,
        category: outcome.category,
        confidence: outcome.confidence,
      });
    }
    // Nur beim Schrittwechsel, nicht bei jeder Zustandsänderung daneben.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, phase]);

  /**
   * Welche Stufen der Prüfung der Server bereits gemeldet hat. Kein Timer, kein
   * Prozentwert: eine Stufe ist erreicht, wenn einer ihrer Zustände im
   * Protokoll steht.
   */
  const reachedStates = new Set(log.map((entry) => entry.state));
  const stageIndex = STAGES.reduce(
    (acc, stage, i) => (stage.states.some((st) => reachedStates.has(st)) ? i : acc),
    -1,
  );
  // Der Grund einer zu dünnen Datenlage und die Auswahl der wirklich gemessenen
  // Dimensionen liegen jetzt in buildOutcome(). Die Oberfläche filtert nicht
  // mehr selbst: sonst entstünde genau hier wieder eine zweite Wahrheit.

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <section className="fm-hero">
        <div className="fm-wrap">
          <div className="fm-hero-grid">
            <div className="fm-hero-copy">
              {heroCopy}

              {/* Schmaler Einstieg. Er startet dasselbe Instrument weiter unten
                  und bringt den Besucher dorthin mit. */}
              <form
                className="fm-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void start(undefined, "hero");
                }}
              >
                <div className="fm-field">
                  <label htmlFor={`${uid}-domain`} className="fm-skip">
                    Deine Domain
                  </label>
                  <input
                    id={`${uid}-domain`}
                    ref={heroInputRef}
                    name="domain"
                    className="fm-input"
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    spellCheck={false}
                    placeholder="deine-domain.de"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    aria-describedby={
                      heroError ? `${uid}-hero-error ${uid}-facts` : `${uid}-facts`
                    }
                    aria-invalid={heroError ? true : undefined}
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
                    ? "Öffentliche Daten. Kein Login, kein Google-Ads-Zugriff. Etwa 20 Sekunden."
                    : "Öffentliche Daten. Kein Login. Etwa 20 Sekunden."}
                </p>
                {heroError ? (
                  <p id={`${uid}-hero-error`} className="fm-error" role="alert">
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
      {/* Das eingebettete Instrument. Sprungziel für jeden CTA, dessen Absicht
          ausdrücklich die Prüfung ist. Der Anker steht in lib/links.ts. */}
      <section
        id={SCAN_ANCHOR}
        ref={stageRef}
        className="fm-stage"
        aria-labelledby="fm-stage-h"
      >
        <div className="fm-wrap">
          <div className="fm-stage-head">
            <span className="fm-eyebrow">
              {phase === "scanning"
                ? "Prüfung läuft"
                : settled
                  ? `Schritt ${STEP_ORDER[step] + 1} von 4`
                  : "Öffentliche Prüfung"}
            </span>
            <h2 id="fm-stage-h" className="fm-stage-title">
              {settled && outcome
                ? outcome.label
                : phase === "scanning"
                  ? `Wir lesen ${scannedDomain || "die Oberfläche"}`
                  : isPaid
                    ? "Zuerst der öffentliche Befund, dann der Account"
                    : "Zuerst der Befund, dann der nächste Move"}
            </h2>
          </div>

          <div className="fm-stage-body">
            {/* Links: das Instrument. Im Ruhezustand die Handlung, während der
                Prüfung die echten Zustände, danach der Weg zu einer neuen
                Domain. Immer derselbe Rahmen, damit das Auge nicht springt. */}
            <div className="fm-stage-log">
              <div className="fm-probe">
                <div className="fm-probe-head">
                  <span className="fm-probe-k">
                    <span className="fm-probe-pip" aria-hidden="true" />
                    {copy.label}
                  </span>
                  <span className="fm-probe-free">Kostenlos</span>
                </div>

                {idle ? (
                  <form
                    className="fm-probe-body"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void start(undefined, "instrument");
                    }}
                  >
                    <label htmlFor={`${uid}-probe`} className="fm-probe-q">
                      {copy.question}
                    </label>
                    <p className="fm-probe-sub">{copy.sub}</p>

                    <input
                      id={`${uid}-probe`}
                      ref={stageInputRef}
                      name="domain"
                      className="fm-probe-input"
                      type="text"
                      inputMode="url"
                      autoComplete="url"
                      spellCheck={false}
                      placeholder={copy.placeholder}
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      aria-describedby={
                        instrumentError ? `${uid}-probe-error` : `${uid}-probe-trust`
                      }
                      aria-invalid={instrumentError ? true : undefined}
                    />

                    <button type="submit" className="fm-probe-cta">
                      <span className="fm-probe-cta-line" aria-hidden="true" />
                      <span>{copy.cta}</span>
                      <span className="fm-probe-cta-arrow" aria-hidden="true">
                        →
                      </span>
                    </button>

                    {instrumentError ? (
                      <p id={`${uid}-probe-error`} className="fm-error" role="alert">
                        {errorMsg}
                      </p>
                    ) : null}

                    <ul id={`${uid}-probe-trust`} className="fm-probe-trust">
                      {copy.trust.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>

                    <details className="fm-details fm-probe-reads">
                      <summary>{copy.reads}</summary>
                      <div className="fm-details-body">
                        <ul className="fm-log">
                          {(isPaid ? PAID_READS : READS).map((item) => (
                            <li key={item}>
                              <span className="fm-log-label">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  </form>
                ) : (
                  <div className="fm-probe-body">
                    <p className="fm-probe-target">
                      <span className="fm-probe-target-k">Geprüft</span>
                      <span className="fm-probe-target-v">{scannedDomain || domain.trim()}</span>
                    </p>

                    <ul className="fm-log" aria-live="polite" aria-atomic="false">
                      {log.map((entry, i) => (
                        <li
                          key={`${entry.state}-${i}`}
                          data-live={i === log.length - 1 && phase === "scanning"}
                        >
                          <span>
                            <span className="fm-log-label">{entry.label}</span>
                            {entry.detail ? (
                              <span className="fm-log-detail">{entry.detail}</span>
                            ) : null}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {settled ? (
                      <button
                        type="button"
                        className="fm-link-secondary fm-probe-again"
                        onClick={() => {
                          resetForNewScan();
                          setPhase("idle");
                          setDomain("");
                          window.setTimeout(() => stageInputRef.current?.focus(), 0);
                        }}
                      >
                        Andere Domain prüfen
                      </button>
                    ) : null}
                  </div>
                )}
              </div>

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

              {/* Während der Prüfung: die fünf Stufen als primäre Erzählung.
                  Das technische Protokoll läuft unverändert weiter und bleibt
                  links sichtbar. Kein Prozentbalken und keine geschätzte
                  Restzeit: eine Stufe gilt als erreicht, wenn der Server einen
                  ihrer Zustände gemeldet hat, sonst gar nicht. */}
              {phase === "scanning" ? (
                <div className="fm-stage-empty">
                  <ol className="fm-stages" aria-live="polite">
                    {STAGES.map((stage, i) => (
                      <li
                        key={stage.id}
                        data-state={
                          i < stageIndex ? "done" : i === stageIndex ? "current" : "todo"
                        }
                      >
                        <span className="fm-stages-n">{stage.id}</span>
                        <span className="fm-stages-l">
                          {isPaid && stage.id === "04"
                            ? "Conversion-Signale vergleichen"
                            : stage.label}
                        </span>
                      </li>
                    ))}
                  </ol>
                  <p className="fm-micro">
                    Wir ordnen gerade ein, wo bei euch der größte Unterschied zwischen Aufwand und
                    Ergebnis liegt.
                  </p>
                </div>
              ) : null}

              {/* ── Die vier Ergebnisschritte ───────────────────────────────
                  Ein Screen, ein Job. Vorher lagen Diagnose, Erklärung,
                  Selbsteinschätzung, Serviceauswahl und CTA gleichzeitig hier,
                  und keiner der fünf Teile konnte seine Arbeit machen.

                  Es gibt bewusst keinen Zweig für "kein Ergebnis". `outcome`
                  ist gesetzt, sobald eine Diagnose vorliegt, und trägt jeden
                  Ausgang der Prüfung. */}
              {settled && outcome ? (
                <div className="fm-outcome" data-step={step}>
                  <ol className="fm-seq" aria-label="Fortschritt">
                    {(["diagnosis", "context", "signals", "move"] as Step[]).map((id, i) => (
                      <li
                        key={id}
                        data-state={
                          step === id ? "current" : i < STEP_ORDER[step] ? "done" : "todo"
                        }
                        aria-current={step === id ? "step" : undefined}
                      >
                        <span className="fm-seq-n">{`0${i + 1}`}</span>
                        <span className="fm-seq-l">{STEP_LABEL[id]}</span>
                      </li>
                    ))}
                  </ol>

                  {/* ── 01 Befund ──────────────────────────────────────────
                      Der Befund ist der Hero dieses Schritts, nicht das
                      Formular. */}
                  {step === "diagnosis" ? (
                    <div className="fm-verdict">
                      <div className="fm-badge-row">
                        <span className="fm-badge" data-kind={outcome.kind}>
                          {outcome.label}
                        </span>
                        <span className="fm-confidence">
                          Öffentliche Lesung · {CONFIDENCE_BAND_LABEL[outcome.confidence]}
                        </span>
                      </div>

                      <h3 className="fm-verdict-title">{outcome.headline}</h3>
                      {outcome.body ? <p className="fm-serif">{outcome.body}</p> : null}

                      {/* Die kommerzielle Einordnung. Bei einem gemessenen
                          Befund sagt sie, was er bedeutet; bei Hidden Signal
                          sagt sie, was er eingrenzt. */}
                      {outcome.meaning ? (
                        <p className="fm-narrowing">{outcome.meaning}</p>
                      ) : null}

                      {/* Was die Prüfung positiv ausschließen konnte.
                          Ausschließlich aus solide gemessenen Dimensionen: ein
                          Punkt, der schwach war oder nicht gemessen wurde,
                          erscheint hier nie. */}
                      {outcome.ruledOut.length ? (
                        <div className="fm-block">
                          <span className="fm-block-k">Was wir ausschließen konnten</span>
                          <ul className="fm-ruled">
                            {outcome.ruledOut.map((line) => (
                              <li key={line}>{line}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {/* Belege sekundär, aber nachvollziehbar. Links steht,
                          was geprüft wurde, hier steht, was es bedeutet. */}
                      {outcome.evidence.length ? (
                        <details
                          className="fm-details"
                          onToggle={(e) => {
                            if ((e.currentTarget as HTMLDetailsElement).open) {
                              track("evidence_expand", { surface: variant, scope: "readout" });
                            }
                          }}
                        >
                          <summary>{OBSERVATIONS_LABEL}</summary>
                          <div className="fm-details-body">
                            <dl className="fm-readout">
                              {outcome.evidence.map((e) => (
                                <div key={e.id} data-status={e.status}>
                                  <dt>{e.label}</dt>
                                  <dd>{e.value}</dd>
                                </div>
                              ))}
                            </dl>
                          </div>
                        </details>
                      ) : null}

                      {/* Read-only erscheint nur, wenn ein echter öffentlicher
                          Paid-Befund steht. */}
                      {isPaid && finding?.requiresReadOnly ? (
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
                              Suchbegriffe, Attribution, Brand gegen Non-Brand und Leadqualität
                              liegen im Konto. Read-only heißt: {READ_ONLY_GUARANTEES.join(", ")}.
                            </p>
                            <p className="fm-block-v">
                              Damit prüfbar: {READ_ONLY_UNLOCKS.join(" · ")}.
                            </p>
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
                                Den Read-only-Zugriff richten wir im Kickoff gemeinsam ein, in unter
                                15 Minuten. Vor dem Kauf wird nichts verbunden und nichts geändert.
                              </p>
                            )}
                          </div>
                        </details>
                      ) : null}

                      <p className="fm-block-v fm-verify">{outcome.limits}</p>

                      {/* Genau eine dominante Handlung. */}
                      <div className="fm-actions">
                        <button
                          type="button"
                          className="fm-btn"
                          onClick={() => advance("context")}
                        >
                          {outcome.cta} →
                        </button>
                        <span className="fm-micro">{HIDDEN_SIGNAL_COPY.ctaMicro}</span>
                      </div>
                      <button
                        type="button"
                        className="fm-link-secondary"
                        onClick={() => setEmailOpen((v) => !v)}
                        aria-expanded={emailOpen}
                      >
                        Ergebnis per E-Mail senden
                      </button>
                    </div>
                  ) : null}

                  {/* ── 02 Geschäftslage ───────────────────────────────────
                      Gefragt wird nach dem Geschäftsproblem. Welche Disziplin
                      es löst, entscheidet SEESZN, nicht der Besucher. */}
                  {step === "context" ? (
                    <div className="fm-verdict">
                      <span className="fm-badge">Schritt 02</span>
                      <h3 className="fm-verdict-title">
                        Was beschreibt eure Situation am ehesten?
                      </h3>
                      <p className="fm-serif">
                        Eine Angabe genügt. Sie entscheidet, welche Ebene wir zuerst prüfen.
                      </p>

                      <div className="fm-situations" role="group" aria-label="Eure Situation">
                        {BUSINESS_SITUATIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            className="fm-situation"
                            aria-pressed={situation === opt.id}
                            onClick={() => {
                              setSituation(opt.id);
                              track("first_move_business_context_selected", {
                                surface: variant,
                                situation: opt.id,
                                category: outcome.category,
                              });
                            }}
                          >
                            <span className="fm-situation-l">{opt.label}</span>
                            {situation === opt.id ? (
                              <span className="fm-situation-n">{opt.note}</span>
                            ) : null}
                          </button>
                        ))}
                      </div>

                      <div className="fm-actions">
                        <button
                          type="button"
                          className="fm-btn"
                          disabled={situation === null}
                          onClick={() => advance("signals")}
                        >
                          Weiter →
                        </button>
                        <span className="fm-micro">{PRICE_FRAME}</span>
                      </div>
                    </div>
                  ) : null}

                  {/* ── 03 Nicht-öffentliche Signale ───────────────────────
                      Es gibt derzeit keine OAuth-Anbindung. Deshalb steht hier
                      kein Verbinden-Button, der ins Leere führt, und der Weg
                      ohne Zugang ist ein vollwertiger Weg, kein Notausgang. */}
                  {step === "signals" ? (
                    <div className="fm-verdict">
                      <span className="fm-badge">{SIGNALS_STEP.label}</span>
                      <h3 className="fm-verdict-title">{SIGNALS_STEP.headline}</h3>
                      <p className="fm-serif">{SIGNALS_STEP.body}</p>

                      <ul className="fm-sources">
                        {SIGNAL_SOURCES.map((src) => (
                          <li key={src.id} data-available={src.available}>
                            <span className="fm-sources-l">{src.label}</span>
                            <span className="fm-sources-a">{src.answers}</span>
                            {src.available && src.connectPath ? (
                              <a
                                href={src.connectPath}
                                className="fm-btn fm-btn--ghost fm-btn--sm"
                                onClick={() =>
                                  track("first_move_data_connection_started", {
                                    surface: variant,
                                    source: src.id,
                                  })
                                }
                              >
                                Read-only verbinden
                              </a>
                            ) : (
                              <span className="fm-sources-s">Im Kickoff, lesend</span>
                            )}
                          </li>
                        ))}
                      </ul>

                      {!connectable ? (
                        <p className="fm-block-v fm-verify">{SIGNALS_STEP.unavailableNote}</p>
                      ) : null}

                      <div className="fm-actions">
                        <button
                          type="button"
                          className="fm-btn"
                          onClick={() => {
                            track("first_move_continue_without_data", {
                              surface: variant,
                              category: outcome.category,
                            });
                            track("first_move_recommendation_generated", {
                              surface: variant,
                              category: outcome.category,
                              confidence: outcome.confidence,
                              with_data: false,
                            });
                            advance("move");
                          }}
                        >
                          {connectable ? SIGNALS_STEP.skipCta : SIGNALS_STEP.continueCta} →
                        </button>
                        <span className="fm-micro">{SIGNALS_STEP.skipNote}</span>
                      </div>
                    </div>
                  ) : null}

                  {/* ── 04 Der First Move ──────────────────────────────────
                      Kein Preis. Kein Beratungsgespräch. Ein Move mit
                      Begründung, Belegen und Rahmen. */}
                  {step === "move" && move ? (
                    <div className="fm-verdict fm-move">
                      <span className="fm-badge fm-badge--move">First Move</span>
                      <h3 className="fm-verdict-title">{move.title}</h3>

                      <div className="fm-block">
                        <span className="fm-block-k">Warum dieser Move</span>
                        <p className="fm-serif">{move.rationale}</p>
                      </div>

                      {move.evidence.length ? (
                        <div className="fm-block">
                          <span className="fm-block-k">Evidenz</span>
                          <dl className="fm-readout">
                            {move.evidence.map((e) => (
                              <div key={e.id} data-status={e.status}>
                                <dt>{e.label}</dt>
                                <dd>{e.value}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      ) : null}

                      {/* Kein erfundener Prozentwert. Impact steht nur, wenn ein
                          gemessener Befund ihn trägt; Sicherheit steht als Band,
                          weil dahinter keine kalibrierte Wahrscheinlichkeit liegt. */}
                      <dl className="fm-move-facts">
                        {move.expectedImpact ? (
                          <div>
                            <dt>Erwarteter Impact</dt>
                            <dd>{LEVEL_LABEL[move.expectedImpact]}</dd>
                          </div>
                        ) : null}
                        <div>
                          <dt>Sicherheit</dt>
                          <dd>{CONFIDENCE_BAND_LABEL[move.confidence]}</dd>
                        </div>
                        <div>
                          <dt>Aufwand bei euch</dt>
                          <dd>{move.clientEffort}</dd>
                        </div>
                        <div>
                          <dt>Lieferung</dt>
                          <dd>{move.deliveryWindow}</dd>
                        </div>
                        <div>
                          <dt>Messfenster</dt>
                          <dd>{move.measurementWindow}</dd>
                        </div>
                      </dl>

                      <details className="fm-details">
                        <summary>Was die Umsetzung einschließt</summary>
                        <div className="fm-details-body">
                          <ul className="fm-evidence">
                            {move.scope.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </details>

                      <div className="fm-actions">
                        <button type="button" className="fm-btn" onClick={goToOffer}>
                          Diesen Move starten →
                        </button>
                        <span className="fm-micro">{PRICE_PROMISE}</span>
                      </div>
                      <button
                        type="button"
                        className="fm-link-secondary"
                        onClick={() => setEmailOpen((v) => !v)}
                        aria-expanded={emailOpen}
                      >
                        Ergebnis per E-Mail senden
                      </button>
                    </div>
                  ) : null}
                </div>
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
