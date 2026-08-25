"use client";

// ─── Startseite: Hero, Faktenband und die öffentliche Prüfung ─────────────────
// Die Startseite ist die Entscheidungsfläche für den ersten Kauf. Der Besucher
// soll im ersten Bild verstehen, was SEESZN ist, was der First Move liefert,
// welche Oberflächen geprüft werden und was jetzt zu tun ist. Deshalb liegt das
// Domainfeld im Hero selbst und nicht hinter einem Klick auf eine andere Seite.
//
// Diese Komponente hält den Zustand der Prüfung. Hero-Feld und Instrument sind
// zwei Einstiege in dieselbe Prüfung: sie teilen sich Domain und Ergebnis, und
// ein Ergebnis erscheint nie außerhalb des sichtbaren Bereichs.
//
// Ehrlichkeitsregeln, die dieser Code durchsetzt und die aus dem Produktfunnel
// unverändert übernommen sind:
//   - Es gibt keinen Fortschrittsbalken und keine erfundene Wartezeit. Eine
//     Stufe gilt erst als erreicht, wenn der Server einen ihrer Zustände
//     gemeldet hat.
//   - Vor der ersten Prüfung steht ein sichtbar gekennzeichnetes Beispiel. Es
//     ist ein eigener Typ, wird nie zum Zustand eines echten Befunds und
//     verschwindet, sobald eine Prüfung startet.
//   - Das Ergebnis kommt aus buildOutcome(). Die Funktion ist total, also kann
//     die Oberfläche keinen Zustand "nichts gefunden" mehr bauen.
//   - Ein technischer Fehler ist kein Diagnosezustand und teilt sich mit dem
//     Ergebnis keine Darstellung.
//   - Es wird keine E-Mail verlangt, bevor das erste brauchbare Ergebnis steht.
//   - Der Preis steht nicht im Prüfschritt. Er steht im Angebot.

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Hero from "@/components/Hero";
import { track } from "@/lib/first-move/analytics";
import { EXAMPLE_FINDING, EXAMPLE_FINDING_EN } from "@/lib/first-move/example";
import { saveHandoff, readHandoff, type HandoffIntent } from "@/lib/first-move/handoff";
import { buildOutcome, outcomeStrings } from "@/lib/first-move/outcome";
import { HOME_OFFER_ANCHOR, HOME_SCAN_ANCHOR, type HomeContent } from "@/lib/home";
import type { PublicDiagnosis } from "@/lib/first-move/diagnosis";
import type { PublicFinding, ScanEvent, ScanStateEvent } from "@/lib/first-move/types";

type Phase = "idle" | "scanning" | "settled" | "error";
/** Von welchem Einstieg aus gestartet wurde. Die Meldung bleibt dort stehen. */
type Entry = "hero" | "instrument";

const SURFACE = "home";

export default function HomeFunnel({
  content,
  constraint,
}: {
  content: HomeContent;
  constraint: ReactNode;
}) {
  const uid = useId();
  const locale = content.locale;
  const hero = content.hero;
  const scan = content.scan;
  const example = locale === "en" ? EXAMPLE_FINDING_EN : EXAMPLE_FINDING;
  const strings = outcomeStrings(locale);

  const [domain, setDomain] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [log, setLog] = useState<ScanStateEvent[]>([]);
  const [finding, setFinding] = useState<PublicFinding | null>(null);
  const [diagnosis, setDiagnosis] = useState<PublicDiagnosis | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [errorAt, setErrorAt] = useState<Entry>("instrument");
  const [scannedDomain, setScannedDomain] = useState("");

  const stageRef = useRef<HTMLElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const stageInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const viewedRef = useRef(false);
  /**
   * Nur ein gerade gelaufener Scan zieht den Fokus. Ein wiederhergestelltes
   * Ergebnis darf ihn beim Laden der Seite nicht an sich reißen.
   */
  const justScannedRef = useRef(false);

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    track("first_move_view", { surface: SURFACE });
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  /*
    Rückkehr in derselben Sitzung. Wer vom Angebot oder aus dem Kaufweg
    zurückkommt, soll seinen Befund wiederfinden statt eines leeren Feldes. Es
    wird nur wiederhergestellt, was derselbe Tab in den letzten sechs Stunden
    selbst geprüft hat, und nur in derselben Sprache: ein deutscher Befund in
    einer englischen Oberfläche wäre kein Ergebnis, sondern ein Bruch.
  */
  useEffect(() => {
    // Nach dem ersten Frame, damit der Server-HTML-Zustand und die Hydration
    // identisch bleiben: der wiederhergestellte Befund ist Clientwissen und darf
    // im ausgelieferten HTML nicht vorkommen.
    const frame = requestAnimationFrame(() => {
      const saved = readHandoff();
      if (!saved || saved.locale !== locale) return;
      setDomain(saved.domain);
      setScannedDomain(saved.domain);
      setDiagnosis(saved.diagnosis);
      setFinding(saved.finding);
      setPhase("settled");
    });
    return () => cancelAnimationFrame(frame);
    // Nur beim Mounten. Ein späterer Lauf würde ein frisches Ergebnis überschreiben.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(
    async (raw?: string, entry: Entry = "instrument") => {
      const value = (raw ?? domain).trim();
      if (!value) {
        // Eine leere Eingabe ist ein Bedienfehler, kein Prüfergebnis. Die
        // Meldung bleibt am Einstieg stehen und der Fokus geht zurück ins Feld.
        setErrorMsg(hero.emptyError);
        setErrorAt(entry);
        setPhase("error");
        (entry === "hero" ? heroInputRef : stageInputRef).current?.focus();
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLog([]);
      setFinding(null);
      setDiagnosis(null);
      setErrorMsg("");
      setPhase("scanning");
      track("domain_submit", { surface: SURFACE, entry });
      track("public_scan_start", { surface: SURFACE, entry, route: "unsure" });

      try {
        const res = await fetch("/api/first-move/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: value, route: "unsure", locale }),
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
              track("public_scan_signal", { surface: SURFACE, state: event.state });
            } else if (event.type === "error") {
              setErrorMsg(event.message);
              setErrorAt("instrument");
              setPhase("error");
            } else if (event.type === "result") {
              setScannedDomain(event.domain);
              setDiagnosis(event.diagnosis);
              if (event.finding) setFinding(event.finding);
              justScannedRef.current = true;
              setPhase("settled");

              const classified = buildOutcome(event.diagnosis, event.finding, false, locale);
              track("first_move_result_classified", {
                surface: SURFACE,
                category: classified.category,
                kind: classified.kind,
                diagnosis: event.diagnosis.state,
                confidence: classified.confidence,
              });
              track("public_scan_complete", {
                surface: SURFACE,
                qualified: event.finding !== null,
                diagnosis: event.diagnosis.state,
                interpretation_confidence: event.diagnosis.confidence,
                readable_pages: event.diagnosis.evidenceBase.readablePages,
                limitation: event.diagnosis.limitation,
              });
              if (event.finding) {
                track("finding_view", {
                  surface: SURFACE,
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
        setErrorMsg(hero.scanFailed);
        setErrorAt("instrument");
        setPhase("error");
      }
    },
    [domain, hero.emptyError, hero.scanFailed, locale],
  );

  /*
    Das Instrument trägt alle Zustände. Wer im Hero startet, wird dorthin
    gebracht, statt auf ein Ergebnis außerhalb des Bildschirms zu warten. Der
    Sprung liegt bewusst in einem Effekt: im selben Tick wie der Zustandswechsel
    bricht der Browser die weiche Bewegung sofort wieder ab.
  */
  useEffect(() => {
    if (phase !== "scanning") return;
    const frame = requestAnimationFrame(() => {
      stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  // Sobald ein Ergebnis steht, wandert der Fokus dorthin. Ohne das bliebe eine
  // Tastatur- oder Screenreader-Bedienung im Formular stehen.
  useEffect(() => {
    if (phase !== "settled" || !justScannedRef.current) return;
    justScannedRef.current = false;
    resultRef.current?.focus({ preventScroll: true });
  }, [phase]);

  const outcome = useMemo(
    () => (diagnosis ? buildOutcome(diagnosis, finding, false, locale) : null),
    [diagnosis, finding, locale],
  );

  /*
    Die Belege, die den Befund tragen. Positiv gemessene Beobachtungen sind
    hier bewusst ausgeschlossen: sie stehen bereits unter "Was wir ausschließen
    konnten" und würden sonst zweimal dasselbe sagen, einmal als Beleg und
    einmal als Ausschluss.
  */
  const carrying = useMemo(
    () => outcome?.evidence.filter((item) => item.status !== "positive") ?? [],
    [outcome],
  );

  useEffect(() => {
    if (phase !== "settled" || !outcome) return;
    track("first_move_result_viewed", {
      surface: SURFACE,
      category: outcome.category,
      kind: outcome.kind,
    });
    // Nur beim Erreichen des Ergebnisses, nicht bei jeder Zustandsänderung.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const target = scannedDomain || domain.trim();

  const handOff = useCallback(
    (intent: HandoffIntent) => {
      if (!diagnosis || !outcome) return;
      saveHandoff({
        domain: target,
        contextId: finding?.id,
        finding,
        diagnosis,
        category: outcome.category,
        kind: outcome.kind,
        confidence: outcome.confidence,
        limitation: diagnosis.limitation,
        verificationRoute: outcome.limits,
        intent,
        locale,
      });
      track("first_move_result_continue_clicked", {
        surface: SURFACE,
        from: "diagnosis",
        to: intent === "checkout" ? "offer" : "review",
        category: outcome.category,
      });
    },
    [diagnosis, finding, locale, outcome, target],
  );

  /*
    Der Kontext wird gesichert, sobald ein Ergebnis steht, nicht erst beim
    Klick. Damit trägt jeder Weg in den Kaufweg denselben Befund: der CTA im
    Ergebnis, der CTA im Angebot, der CTA im Abschluss und der Produktkopf. Ein
    Klick ändert danach nur noch die Absicht.
  */
  useEffect(() => {
    if (phase !== "settled" || !diagnosis || !outcome) return;
    handOff("checkout");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, outcome]);

  const idle = phase === "idle" || phase === "error";
  const settled = phase === "settled";
  const heroError = phase === "error" && errorAt === "hero" && errorMsg !== "";
  const instrumentError = phase === "error" && errorAt !== "hero" && errorMsg !== "";

  // Welche Stufen der Server bereits gemeldet hat. Kein Timer, kein Prozentwert.
  const reachedStates = new Set<string>(log.map((entry) => entry.state));
  const stageIndex = scan.stages.reduce(
    (acc, stage, i) => (stage.states.some((st) => reachedStates.has(st)) ? i : acc),
    -1,
  );

  /*
    Der Übergang in den Kaufweg. Beide Wege nehmen denselben Kontext mit:
    normalisierte Domain, Kontext-ID des Scans, Befund, Diagnosezustand,
    Sicherheit und die angezeigte nächste Prüfroute. Nichts davon steht in der
    URL, und es wird nichts übergeben, was der Besucher nicht schon gesehen hat.
  */
  return (
    <>
      <Hero
        variant="product"
        eyebrow={hero.eyebrow}
        line1={hero.line1}
        line2={hero.line2}
        accent={hero.accent}
        accentOwnLine
        ghost={hero.ghost}
        sub={hero.lead}
        action={
          <form
            className="hm-form"
            onSubmit={(e) => {
              e.preventDefault();
              void start(undefined, "hero");
            }}
          >
            <div className="hm-field">
              <label htmlFor={`${uid}-hero-domain`} className="hm-k" style={SR_ONLY}>
                {hero.fieldLabel}
              </label>
              <input
                id={`${uid}-hero-domain`}
                ref={heroInputRef}
                name="domain"
                className="hm-input"
                type="text"
                inputMode="url"
                autoComplete="url"
                spellCheck={false}
                placeholder={hero.placeholder}
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                aria-describedby={heroError ? `${uid}-hero-error ${uid}-hero-micro` : `${uid}-hero-micro`}
                aria-invalid={heroError ? true : undefined}
              />
              <button type="submit" className="hm-submit" disabled={phase === "scanning"}>
                {phase === "scanning" ? hero.ctaBusy : hero.cta}
              </button>
            </div>
            <p id={`${uid}-hero-micro`} className="hm-form-micro">
              {hero.micro}
            </p>
            {heroError ? (
              <p id={`${uid}-hero-error`} className="hm-error" role="alert">
                {errorMsg}
              </p>
            ) : null}
          </form>
        }
      />

      {/* Faktenband an der Falzkante. Produktfakten, keine Versprechen. */}
      <div className="hm-strip">
        {content.trustStrip.map((item) => (
          <span key={item} className="hm-strip-item">
            <span className="hm-strip-pip" aria-hidden="true" />
            {item}
          </span>
        ))}
      </div>

      {constraint}

      {/* ── Die Prüfung ─────────────────────────────────────────────────── */}
      <section
        id={HOME_SCAN_ANCHOR}
        ref={stageRef}
        className="hm-section"
        aria-labelledby="hm-scan-h"
      >
        <div className="hm-head">
          <span className="hm-index">{scan.index}</span>
          <span className="hm-label">{scan.label}</span>
        </div>
        <h2 id="hm-scan-h" className="hm-h2">
          {phase === "scanning" ? `${scan.scanningTitle} ${target || scan.scanningFallback}` : scan.title}
        </h2>
        <div className="hm-rule" />

        <div className="hm-stage-grid">
          {/* Links: das Instrument. Im Ruhezustand die Handlung, während der
              Prüfung die echten Zustände, danach der Weg zu einer neuen Domain. */}
          <div className="hm-probe">
            <div className="hm-probe-head">
              <span className="hm-label hm-probe-k">
                <span className="hm-probe-pip" aria-hidden="true" />
                {scan.instrumentLabel}
              </span>
              <span className="hm-label">{scan.free}</span>
            </div>

            {idle ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void start(undefined, "instrument");
                }}
              >
                <label htmlFor={`${uid}-probe`} className="hm-probe-q">
                  {scan.question}
                </label>
                <p className="hm-probe-sub">{scan.sub}</p>

                <div className="hm-field">
                  <input
                    id={`${uid}-probe`}
                    ref={stageInputRef}
                    name="domain"
                    className="hm-input"
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    spellCheck={false}
                    placeholder={hero.placeholder}
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    aria-describedby={
                      instrumentError ? `${uid}-probe-error ${uid}-probe-trust` : `${uid}-probe-trust`
                    }
                    aria-invalid={instrumentError ? true : undefined}
                  />
                  <button type="submit" className="hm-submit">
                    {scan.cta}
                  </button>
                </div>

                {instrumentError ? (
                  <p id={`${uid}-probe-error`} className="hm-error" role="alert">
                    {errorMsg}
                  </p>
                ) : null}

                <ul id={`${uid}-probe-trust`} className="hm-trust">
                  {scan.trust.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>

                <details className="hm-details">
                  <summary>{scan.reads}</summary>
                  <ul className="hm-log">
                    {scan.readsList.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </details>
              </form>
            ) : (
              <div>
                <p className="hm-target">
                  <span className="hm-label">{scan.checked}</span>
                  <span className="hm-target-v">{target}</span>
                </p>

                {log.length ? (
                <ul className="hm-log" aria-live="polite" aria-atomic="false">
                  {log.map((entry, i) => (
                    <li
                      key={`${entry.state}-${i}`}
                      data-live={i === log.length - 1 && phase === "scanning"}
                    >
                      <span>
                        {entry.label}
                        {entry.detail ? <span className="hm-log-detail"> {entry.detail}</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
                ) : null}

                {settled ? (
                  <button
                    type="button"
                    className="hm-secondary"
                    style={{ marginTop: 18 }}
                    onClick={() => {
                      setLog([]);
                      setFinding(null);
                      setDiagnosis(null);
                      setErrorMsg("");
                      setPhase("idle");
                      setDomain("");
                      window.setTimeout(() => stageInputRef.current?.focus(), 0);
                    }}
                  >
                    {scan.again}
                  </button>
                ) : null}
              </div>
            )}

            <p className="hm-micro" style={{ marginTop: 18, maxWidth: "40ch" }}>
              {phase === "scanning" ? scan.runningNote : scan.idleNote}
            </p>
          </div>

          {/* Rechts: das Ergebnis. */}
          <div className="hm-result" ref={resultRef} tabIndex={-1}>
            {idle ? (
              <div className="hm-example">
                <span className="hm-badge">{example.label}</span>
                <h3 className="hm-verdict-title" style={{ marginTop: 14 }}>
                  {example.title}
                </h3>
                <p className="hm-serif">{example.summary}</p>
                <div className="hm-block">
                  <span className="hm-k">{strings.evidenceLabel}</span>
                  <ul className="hm-list">
                    {example.evidence.map((item) => (
                      <li key={item.id}>{item.observation}</li>
                    ))}
                  </ul>
                </div>
                <p className="hm-micro" style={{ marginTop: 22 }}>
                  {example.cta}
                </p>
              </div>
            ) : null}

            {phase === "scanning" ? (
              <div>
                <ol className="hm-stages" aria-live="polite">
                  {scan.stages.map((stage, i) => (
                    <li
                      key={stage.id}
                      data-state={i < stageIndex ? "done" : i === stageIndex ? "current" : "todo"}
                    >
                      <span className="hm-stages-n">{stage.id}</span>
                      <span>{stage.label}</span>
                    </li>
                  ))}
                </ol>
                <p className="hm-micro" style={{ marginTop: 20 }}>
                  {scan.scanningNote}
                </p>
              </div>
            ) : null}

            {settled && outcome ? (
              <div>
                {/* Die Kategorie steht als Marke über dem Befund. Ein
                    gemessener Befund wird markiert, jeder andere Ausgang bleibt
                    ruhig gesetzt: die Form sagt bereits, wie belastbar er ist. */}
                <div className="hm-badge-row">
                  <span className={outcome.kind === "measured_signal" ? "hm-badge" : "hm-badge hm-badge--quiet"}>
                    {outcome.label}
                  </span>
                  <span className="hm-confidence">
                    {scan.confidencePrefix} · {strings.confidence[outcome.confidence]}
                  </span>
                </div>

                <h3 className="hm-verdict-title">{outcome.headline}</h3>
                {outcome.body ? <p className="hm-serif">{outcome.body}</p> : null}
                {outcome.meaning ? <p className="hm-meaning">{outcome.meaning}</p> : null}

                {carrying.length ? (
                  <div className="hm-block">
                    <span className="hm-k">{scan.headings.evidence}</span>
                    <ul className="hm-list">
                      {carrying.slice(0, 4).map((item) => (
                        <li key={item.id}>
                          <span>
                            <span className="hm-ev-k">{item.label}: </span>
                            {item.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {carrying.length > 4 ? (
                      <details
                        className="hm-details"
                        onToggle={(e) => {
                          if ((e.currentTarget as HTMLDetailsElement).open) {
                            track("evidence_expand", { surface: SURFACE, scope: "readout" });
                          }
                        }}
                      >
                        <summary>{strings.observationsLabel}</summary>
                        <ul className="hm-list">
                          {carrying.slice(4).map((item) => (
                            <li key={item.id}>
                              <span>
                                <span className="hm-ev-k">{item.label}: </span>
                                {item.value}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : null}
                  </div>
                ) : null}

                {outcome.ruledOut.length ? (
                  <div className="hm-block">
                    <span className="hm-k">{scan.headings.ruledOut}</span>
                    <ul className="hm-list hm-list--ruled">
                      {outcome.ruledOut.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="hm-block">
                  <span className="hm-k">{scan.headings.route}</span>
                  <p className="hm-body">{outcome.limits}</p>
                </div>

                {/* Eine dominante Fortsetzung, ein nachgeordneter Weg. */}
                <div className="hm-actions">
                  {/* Der dominante Weg bleibt auf der Seite: er führt zum
                      Angebot, wo der Preis steht. Der Kontext wird trotzdem
                      schon hier gesichert, damit die Anfrage später mit dem
                      Befund startet. */}
                  <a
                    href={`#${HOME_OFFER_ANCHOR}`}
                    className="hm-cta"
                    onClick={() => handOff("checkout")}
                  >
                    {scan.primaryCta}
                    <span className="hm-cta-arrow" aria-hidden="true">
                      →
                    </span>
                  </a>
                  {/* Der nachgeordnete Weg. Kein Mailprogramm, sondern dieselbe
                      Anfragestrecke mit der Absicht "Befund gemeinsam prüfen".
                      Domain und Befund gehen mit. */}
                  <Link
                    href={content.offer.ctaHref}
                    className="hm-secondary"
                    onClick={() => handOff("review")}
                  >
                    {scan.secondaryCta}
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}

/** Sichtbar nur für Screenreader. Das Feld trägt sein Label im Platzhalter. */
const SR_ONLY: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};
