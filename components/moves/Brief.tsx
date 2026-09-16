"use client";

// ─── MOVES: das Briefing nach dem Kauf ────────────────────────────────────────
// Der einzige Schritt, der nach der Zahlung Arbeit verlangt. Deshalb sechs
// Felder, davon zwei Pflicht, und keine Kontoanlage: ein Konto würde hier nichts
// lösen, das die Bestellreferenz nicht schon löst, und jede zusätzliche Hürde
// nach der Zahlung erzeugt nur unfertige Aufträge.
//
// Zustände, die gestaltet sind: leer, ungültig, sendend, gesendet, Fehler. Der
// Wechsel in den gesendeten Zustand ist eine ruhige Blende, kein Konfetti.

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { track } from "@/lib/moves/analytics";
import { CATEGORY_BY_ID, categoryHref } from "@/lib/moves/catalog";
import type { MoveCategory, MoveTier } from "@/lib/moves/types";
import type { PricingCopy } from "@/lib/moves/i18n";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Phase = "idle" | "sending" | "done" | "error";

interface Fields {
  domain: string;
  targetUrl: string;
  market: string;
  language: string;
  topic: string;
  notes: string;
}

const EMPTY: Fields = { domain: "", targetUrl: "", market: "", language: "", topic: "", notes: "" };

export default function Brief({
  sessionId,
  orderRef,
  category,
  tier,
  alreadyBriefed,
  t,
}: {
  sessionId: string;
  orderRef: string;
  /**
   * Beides kann fehlen: eine Backlink-Bestellung kommt aus dem Konfigurator und
   * hat keine Katalogfläche. Das Formular ist für beide dasselbe, nur die
   * kontextuelle Erweiterung am Ende entfällt dann.
   */
  category: MoveCategory | null;
  tier: MoveTier | null;
  alreadyBriefed: boolean;
  /** Die Formularsprache. Kein Kontext: die Briefing-Seite trägt keinen. */
  t: PricingCopy["briefing"]["form"];
}) {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [touched, setTouched] = useState(false);
  const [phase, setPhase] = useState<Phase>(alreadyBriefed ? "done" : "idle");
  const [started, setStarted] = useState(false);
  const reduced = useReducedMotion();

  const extension = category?.extension ?? null;
  const target = extension ? CATEGORY_BY_ID[extension.targetCategory] : null;
  const missing = {
    domain: !fields.domain.trim(),
    topic: !fields.topic.trim(),
  };

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!started) {
      setStarted(true);
      track("brief_started", { category: category?.id ?? "backlinks", sku: tier?.sku ?? "backlinks" });
    }
    setFields((f) => ({ ...f, [key]: e.target.value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (missing.domain || missing.topic || phase === "sending") return;

    setPhase("sending");
    try {
      const response = await fetch("/api/moves/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, ...fields }),
      });
      if (!response.ok) throw new Error("brief failed");
      setPhase("done");
      track("brief_completed", { category: category?.id ?? "backlinks", sku: tier?.sku ?? "backlinks" });
    } catch {
      setPhase("error");
    }
  };

  if (phase === "done") {
    return (
      <motion.div
        className="mv-done"
        initial={reduced ? undefined : { opacity: 0, y: 10 }}
        animate={reduced ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <span className="mv-k">{t.doneLabel}</span>
        <h2 className="mv-h3" style={{ marginTop: 12 }}>
          {t.doneH}
        </h2>
        <p className="mv-body" style={{ marginTop: 14 }}>
          {category?.process[1]?.body ?? t.doneBodyFallback}
          {t.doneBodyTail(orderRef)}
        </p>

        {/* Eine Erweiterung, nicht fünf. Sie nennt den Grund, nicht das Produkt.
            Bei einer Backlink-Bestellung entfällt sie: dort ist nach dem Kauf
            nichts sinnvoll anzuschließen, was der Besucher nicht schon kennt. */}
        {extension && target ? (
          <div style={{ marginTop: 32, borderTop: "1px solid var(--line)", paddingTop: 20 }}>
            <span className="mv-k">{extension.headline}</span>
            <p className="mv-body" style={{ marginTop: 10, fontSize: 14 }}>
              {extension.body}
            </p>
            <Link
              href={categoryHref(extension.targetCategory)}
              className="mv-ext-target"
              onClick={() =>
                track("extension_selected", { from: category!.id, to: target.id, surface: "brief" })
              }
            >
              {extension.cta}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : null}
      </motion.div>
    );
  }

  return (
    <form className="mv-form" onSubmit={submit} noValidate>
      <div className="mv-field" data-invalid={touched && missing.domain ? "true" : undefined}>
        <label htmlFor="mv-domain">{t.domainLabel}</label>
        <input
          id="mv-domain"
          name="domain"
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder={t.domainPlaceholder}
          value={fields.domain}
          onChange={set("domain")}
          aria-describedby={touched && missing.domain ? "mv-domain-err" : undefined}
          required
        />
        {touched && missing.domain ? (
          <span className="mv-field-err" id="mv-domain-err">
            {t.domainError}
          </span>
        ) : null}
      </div>

      <div className="mv-field">
        <label htmlFor="mv-target">{t.targetLabel}</label>
        <input
          id="mv-target"
          name="targetUrl"
          type="text"
          inputMode="url"
          placeholder={t.targetPlaceholder}
          value={fields.targetUrl}
          onChange={set("targetUrl")}
        />
      </div>

      <div className="mv-row">
        <div className="mv-field">
          <label htmlFor="mv-market">{t.marketLabel}</label>
          <input
            id="mv-market"
            name="market"
            type="text"
            placeholder={t.marketPlaceholder}
            value={fields.market}
            onChange={set("market")}
          />
        </div>
        <div className="mv-field">
          <label htmlFor="mv-language">{t.languageLabel}</label>
          <input
            id="mv-language"
            name="language"
            type="text"
            placeholder={t.languagePlaceholder}
            value={fields.language}
            onChange={set("language")}
          />
        </div>
      </div>

      <div className="mv-field" data-invalid={touched && missing.topic ? "true" : undefined}>
        <label htmlFor="mv-topic">{t.topicLabel}</label>
        <input
          id="mv-topic"
          name="topic"
          type="text"
          placeholder={t.topicPlaceholder}
          value={fields.topic}
          onChange={set("topic")}
          aria-describedby={touched && missing.topic ? "mv-topic-err" : undefined}
          required
        />
        {touched && missing.topic ? (
          <span className="mv-field-err" id="mv-topic-err">
            {t.topicError}
          </span>
        ) : null}
      </div>

      <div className="mv-field">
        <label htmlFor="mv-notes">{t.notesLabel}</label>
        <textarea
          id="mv-notes"
          name="notes"
          placeholder={t.notesPlaceholder}
          value={fields.notes}
          onChange={set("notes")}
        />
      </div>

      <div>
        <button
          type="submit"
          className="mv-cta"
          data-busy={phase === "sending" ? "true" : undefined}
          disabled={phase === "sending"}
        >
          {phase === "sending" ? t.submitBusy : t.submit}
          {phase === "sending" ? null : (
            <span className="mv-cta-arrow" aria-hidden="true">→</span>
          )}
        </button>

        <div aria-live="polite">
          {phase === "error" ? (
            <p className="mv-notice" style={{ marginTop: 16 }}>
              {t.errorLead}{" "}
              <a href={`mailto:hello@seeszn.com?subject=${encodeURIComponent(`Briefing ${orderRef}`)}`}>
                hello@seeszn.com
              </a>
              {t.errorTail(orderRef)}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
