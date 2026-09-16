"use client";

// ─── BACKLINKS: kostenlose Mengenempfehlung ───────────────────────────────────
// Für den einen Besucher, der am Regler hängen bleibt, weil er die Frage nicht
// beantworten kann: wie viele brauche ich überhaupt?
//
// Zwei Gestaltungsentscheidungen halten das klein:
//
// 1. Standardmäßig zugeklappt. Wer 30 will, wählt 30 und sieht hier nur eine
//    Zeile. Die Empfehlung ist ein Ausweg, nicht die Hauptsache.
// 2. Zwei Felder. Domain und Mail, mehr braucht die Zusage nicht. Jedes weitere
//    Feld wäre eine Frage an den Besucher, die sich der Prüfer selbst
//    beantworten kann.
//
// Der Rechnerstand geht unsichtbar mit, damit der Prüfer Markt, Format und
// aktuelle Auswahl kennt, ohne dass danach gefragt werden muss.
//
// Was hier ausdrücklich NICHT passiert: keine Berechnung, keine Kennzahl, kein
// Ergebnis im Browser. Die Seite verspricht eine menschliche Einschätzung, also
// erzeugt der Browser auch keine.

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { track } from "@/lib/moves/analytics";
import { isEmail, normalizeDomain } from "@/lib/moves/domain";
import { usePrefersReducedMotion } from "@/lib/moves/useReducedMotion";
import type { BacklinkType, PurchaseMode } from "@/lib/moves/backlinks";
import { useCopy, usePricing } from "@/components/moves/pricing/PricingShell";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Phase = "idle" | "sending" | "done" | "error";

export default function Recommendation({
  quantity,
  mode,
  type,
  market,
}: {
  quantity: number;
  mode: PurchaseMode;
  type: BacklinkType;
  market: string;
}) {
  const t = useCopy().recommendation;
  const { locale } = usePricing();
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [sentTo, setSentTo] = useState("");
  const trap = useRef<HTMLInputElement>(null);
  const reduced = usePrefersReducedMotion();
  const uid = useId();

  const domainBad = touched && normalizeDomain(domain) === null;
  const emailBad = touched && !isEmail(email);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) track("pricing_recommendation_opened", { quantity, mode, locale });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (normalizeDomain(domain) === null || !isEmail(email) || phase === "sending") return;

    setPhase("sending");
    // Kein Rohwert in die Statistik: weder Mailadresse noch Domain.
    track("pricing_recommendation_submitted", { quantity, mode, format: type, market, locale });

    try {
      const response = await fetch("/api/moves/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          email,
          locale,
          companyUrlConfirm: trap.current?.value ?? "",
          quantity,
          purchaseMode: mode,
          backlinkType: type,
          market,
        }),
      });
      if (!response.ok) throw new Error("failed");
      setSentTo(email.trim());
      setPhase("done");
      track("pricing_recommendation_success", { quantity, mode });
    } catch {
      setPhase("error");
      track("pricing_recommendation_error", {});
    }
  };

  return (
    <div className="mv-rec">
      <button
        type="button"
        className="mv-rec-toggle"
        aria-expanded={open}
        aria-controls={`${uid}-panel`}
        onClick={toggle}
      >
        <span className="mv-rec-eyebrow">{t.eyebrow}</span>
        <span className="mv-rec-open">
          {open ? t.close : t.open}
          <span aria-hidden="true">{open ? "−" : "→"}</span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={`${uid}-panel`}
            key="panel"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={reduced ? {} : { height: "auto", opacity: 1 }}
            exit={reduced ? {} : { height: 0, opacity: 0 }}
            transition={{ duration: 0.42, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            {phase === "done" ? (
              /* ── Bestätigung, ohne die Seite zu verlassen ──────────────── */
              <div className="mv-rec-body mv-rec-done">
                <h3 className="mv-h3">{t.doneH}</h3>
                <p className="mv-body" style={{ marginTop: 12 }}>
                  {t.doneBody(sentTo)}
                </p>
                {/* Kein Terminvorschlag: der Besucher hat ausdrücklich nach einer
                    Antwort per Mail gefragt, nicht nach einem Gespräch. */}
                <p className="mv-body" style={{ marginTop: 18, color: "var(--text-muted)" }}>
                  {t.doneAlt}
                </p>
                <button type="button" className="mv-rec-continue" onClick={() => setOpen(false)}>
                  {t.doneCta}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            ) : (
              <div className="mv-rec-body">
                <div className="mv-rec-grid">
                  <div>
                    <h3 className="mv-h3">{t.h}</h3>
                    <p className="mv-body" style={{ marginTop: 14, fontSize: 14.5 }}>
                      {t.body}
                    </p>

                    <form className="mv-rec-form" onSubmit={submit} noValidate>
                      <div className="mv-field" data-invalid={domainBad ? "true" : undefined}>
                        <label htmlFor={`${uid}-domain`}>{t.domain}</label>
                        <input
                          id={`${uid}-domain`}
                          name="domain"
                          type="text"
                          inputMode="url"
                          autoComplete="url"
                          placeholder={t.domainPlaceholder}
                          value={domain}
                          onChange={(e) => setDomain(e.target.value)}
                          aria-describedby={domainBad ? `${uid}-domain-err` : undefined}
                          aria-invalid={domainBad || undefined}
                          required
                        />
                        {domainBad ? (
                          <span className="mv-field-err" id={`${uid}-domain-err`}>
                            {t.domainError}
                          </span>
                        ) : null}
                      </div>

                      <div className="mv-field" data-invalid={emailBad ? "true" : undefined}>
                        <label htmlFor={`${uid}-email`}>{t.email}</label>
                        <input
                          id={`${uid}-email`}
                          name="email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          placeholder={t.emailPlaceholder}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          aria-describedby={emailBad ? `${uid}-email-err` : undefined}
                          aria-invalid={emailBad || undefined}
                          required
                        />
                        {emailBad ? (
                          <span className="mv-field-err" id={`${uid}-email-err`}>
                            {t.emailError}
                          </span>
                        ) : null}
                      </div>

                      {/* Honigtopf. Versteckt, nicht fokussierbar, ohne Autofill. */}
                      <div className="mv-trap" aria-hidden="true">
                        <label htmlFor={`${uid}-trap`}>{t.trap}</label>
                        <input
                          id={`${uid}-trap`}
                          ref={trap}
                          type="text"
                          tabIndex={-1}
                          autoComplete="off"
                          defaultValue=""
                        />
                      </div>

                      <button
                        type="submit"
                        className="mv-cta"
                        data-busy={phase === "sending" ? "true" : undefined}
                        disabled={phase === "sending"}
                      >
                        {phase === "sending" ? t.ctaBusy : t.cta}
                        {phase === "sending" ? null : (
                          <span className="mv-cta-arrow" aria-hidden="true">→</span>
                        )}
                      </button>

                      <p className="mv-rec-trust">{t.trust}</p>

                      <div aria-live="polite">
                        {phase === "error" ? (
                          <p className="mv-notice" style={{ marginTop: 14 }}>
                            {t.errorBody} <a href="mailto:hello@seeszn.com">hello@seeszn.com</a>.
                          </p>
                        ) : null}
                      </div>
                    </form>
                  </div>

                  {/* ── Was zurückkommt. Datenblatt, keine Vorteilskacheln. ── */}
                  <div className="mv-rec-spec">
                    <span className="mv-k">{t.getLabel}</span>
                    <dl className="mv-tier-facts">
                      {t.get.map((row) => (
                        <div className="mv-tier-fact" key={row.k}>
                          <dt>{row.k}</dt>
                          <dd>{row.v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
