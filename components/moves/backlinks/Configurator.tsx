"use client";

// ─── BACKLINKS: der Konfigurator ──────────────────────────────────────────────
// Die gesamte Kaufentscheidung an einer Stelle: Kaufart, Menge, Format, Markt,
// Preis, Handlung. Wer hier ankommt, soll nichts lesen müssen, um zu kaufen.
//
// Zustand ist bewusst flach und klein. Vier Werte, aus denen alles andere
// abgeleitet wird:
//
//   mode        once | monthly
//   quantity    eine Stufe der Staffel
//   type        mix | nad | blog | forum
//   market      Ländercode
//
// Der Preis ist kein Zustand. Er wird bei jedem Rendern aus lib/moves/backlinks
// gelesen, damit Oberfläche und Checkout nie auseinanderlaufen können.
//
// Beim Wechsel auf Monatlich springt eine Menge unterhalb von 10 auf 10. Der
// Sprung wird angekündigt (autoStepping), damit der Regler ihn mit einer
// längeren Kurve fährt: eine Bewegung, die der Besucher nicht ausgelöst hat,
// braucht mehr Zeit als eine, die er selbst zieht.

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { track } from "@/lib/moves/analytics";
import { TERMS_PATH } from "@/lib/moves/catalog";
import { PRICING_SCAN_HREF } from "@/lib/moves/pricingMeta";
import {
  BACKLINK_TYPES,
  MAX_SELF_SERVICE,
  MIN_QUANTITY,
  MIN_TERM_MONTHS,
  type BacklinkType,
  type PurchaseMode,
  euroIn,
  priceFor,
  anchorQuantities,
  minimumCommitmentCents,
  unitEuroIn,
} from "@/lib/moves/backlinks";
import { DEFAULT_MARKET } from "@/lib/moves/markets";
import { useCopy, usePricing } from "@/components/moves/pricing/PricingShell";
import QuantitySlider from "./QuantitySlider";
import MarketSelect from "./MarketSelect";
import PriceScale from "./PriceScale";
import OrderReview from "./OrderReview";
import Recommendation from "./Recommendation";
import SwapNumber from "./SwapNumber";
import EditableQuantity from "./EditableQuantity";
import StickyBuy from "@/components/moves/pricing/StickyBuy";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Phase = "idle" | "review" | "busy" | "unavailable" | "error";

/** Teilt einen Betrag in Euro und Cent, damit der Cent kleiner gesetzt wird. */
function Amount({ text }: { text: string }) {
  const [whole, rest] = text.split(",");
  return (
    <>
      {whole}
      {rest ? <span className="mv-cents">,{rest}</span> : null}
    </>
  );
}

export default function Configurator() {
  const copy = useCopy();
  const t = copy.backlinks;
  const { locale } = usePricing();
  const [mode, setMode] = useState<PurchaseMode>("once");
  const [quantity, setQuantity] = useState<number>(MIN_QUANTITY.once);
  const [type, setType] = useState<BacklinkType>("mix");
  const [market, setMarket] = useState<string>(DEFAULT_MARKET);
  // Über 100 rechnet die Seite nicht mehr. Der Zustand liegt neben der Menge,
  // nicht als Menge 101: "custom" heißt jede Menge über 100, nicht genau eine.
  const [custom, setCustom] = useState(false);
  // Die zuletzt von Hand eingetippte Menge über 100. Nur Kontext für die
  // Anfrage, nie ein Preis: über 100 wird serverseitig ohnehin nichts mehr
  // berechnet.
  const [requestedQuantity, setRequestedQuantity] = useState<number | undefined>(undefined);
  const [phase, setPhase] = useState<Phase>("idle");
  const [autoStepping, setAutoStepping] = useState(false);
  // Während des aktiven Ziehens schaltet der Preisblock seine
  // Wechselanimation ab. Siehe SwapNumber für den Grund.
  const [dragging, setDragging] = useState(false);

  // Richtung der letzten Änderung. Sie steuert, wohin die Zahlen laufen, und
  // wird dort gesetzt, wo die Änderung entsteht. Ein Vergleich mit dem
  // vorherigen Wert während des Renderns wäre dafür der falsche Ort: die
  // Richtung ist ein Ereignis, kein abgeleiteter Wert.
  const [direction, setDirection] = useState(1);
  // Ab der ersten Änderung dürfen die Zahlen animieren. Davor nicht, damit der
  // erste Baum serverseitig und im Browser identisch ist.
  const [live, setLive] = useState(false);

  const anchors = anchorQuantities(mode);
  const price = priceFor(quantity, mode)!;
  const commitmentCents = minimumCommitmentCents(price.totalCents);
  // Zahlenformat folgt der Sprache: 1.235,00 € gegen €1,235.00
  const euro = (c: number) => euroIn(c, locale);
  const unitEuro = (c: number) => unitEuroIn(c, locale);

  const selectMode = (next: PurchaseMode) => {
    if (next === mode) return;
    const min = MIN_QUANTITY[next];
    const lifted = quantity < min;

    setMode(next);
    setLive(true);
    setCustom(false);
    setRequestedQuantity(undefined);
    track("pricing_billing_changed", { mode: next, quantity: lifted ? min : quantity, locale });
    if (lifted) {
      setDirection(1);
      setQuantity(min);
      // Der Regler fährt den nicht selbst ausgelösten Sprung langsamer.
      setAutoStepping(true);
      window.setTimeout(() => setAutoStepping(false), 700);
    }
    setPhase("idle");
    track("pricing_mode_selected", { product: "backlinks", mode: next, quantity: lifted ? min : quantity });
  };

  const selectQuantity = (next: number) => {
    setCustom(false);
    setRequestedQuantity(undefined);
    if (next === quantity) return;
    setLive(true);
    setDirection(next >= quantity ? 1 : -1);
    setQuantity(next);
    setPhase("idle");
    track("pricing_quantity_changed", { quantity: next, mode, locale });
  };

  /** Manuell eingetippte Menge über 100: Custom-Zustand mit Kontext. */
  const requestCustomQuantity = (n: number) => {
    setCustom(true);
    setRequestedQuantity(n);
    setPhase("idle");
    track("pricing_custom_100plus_selected", { from: quantity, requested: n, mode, locale });
  };

  const selectType = (next: BacklinkType) => {
    if (next === type) return;
    setType(next);
    track("pricing_format_changed", { format: next, locale });
  };

  const selectMarket = (next: string) => {
    if (next === market) return;
    setMarket(next);
    track("pricing_market_changed", { market: next, locale });
  };

  /**
   * Erst die Übersicht, dann die Zahlung.
   *
   * Vor einer Weiterleitung zu Stripe soll der vollständige Auftrag einmal auf
   * dieser Seite stehen: Menge, Abrechnung, Format, Markt, Stückpreis und
   * Gesamtbetrag. Das ist ein Klick mehr und die Stelle, an der ein falsch
   * eingestellter Markt oder eine falsche Kaufart noch auffällt.
   */
  const openReview = () => {
    setPhase("review");
    track("backlink_review_opened", { mode, quantity, backlink_type: type, market });
  };

  const startCheckout = async () => {
    if (phase === "busy") return;
    setPhase("busy");
    track("pricing_checkout_started", {
      product: "backlinks",
      mode,
      quantity,
      backlink_type: type,
      market,
      total: price.totalCents / 100,
    });

    try {
      const response = await fetch("/api/moves/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Bewusst ohne Preis: der Server rechnet ihn aus derselben Tabelle neu.
        body: JSON.stringify({ product: "backlinks", purchaseMode: mode, quantity, backlinkType: type, market, locale }),
      });
      const data = (await response.json()) as { url?: string; available?: boolean };

      if (response.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setPhase(data.available === false ? "unavailable" : "error");
      track("checkout_unavailable", {
        product: "backlinks",
        reason: data.available === false ? "not_configured" : "error",
      });
    } catch {
      setPhase("error");
      track("checkout_unavailable", { product: "backlinks", reason: "network" });
    }
  };

  const monthly = mode === "monthly";
  // Menge und Betrag stehen im Knopf. Ein blankes "Weiter" verschweigt genau
  // die zwei Angaben, die der Besucher gerade eingestellt hat.
  const ctaLabel = monthly
    ? t.ctaMonthly(quantity, euro(price.totalCents))
    : t.ctaOnce(quantity, euro(price.totalCents));

  return (
    <div className="mv-cfg" id="konfigurator">
      {/* ── Kaufart und Zielmarkt ─────────────────────────────────────────── */}
      <div className="mv-cfg-top">
        <div className="mv-mode" role="group" aria-label="Kaufart">
          {(["once", "monthly"] as const).map((m) => (
            <button
              key={m}
              type="button"
              className="mv-mode-btn"
              aria-pressed={m === mode}
              onClick={() => selectMode(m)}
            >
              {m === "once" ? t.once : t.monthly}
              {m === "monthly" ? (
                /* "ca.", weil die Monatsbeträge glatt gewählt sind und der
                   Abzug je Stufe zwischen rund neun und elf Prozent liegt. */
                <span className="mv-mode-save">{t.monthlySave}</span>
              ) : null}
              {m === mode ? (
                <motion.span
                  layoutId="mv-mode-ind"
                  className="mv-mode-ind"
                  style={{ left: 0, right: 0 }}
                  transition={{ duration: 0.42, ease: EASE }}
                />
              ) : null}
            </button>
          ))}
        </div>

        <MarketSelect value={market} onChange={selectMarket} />
      </div>

      {/* ── Die drei Werte ────────────────────────────────────────────────── */}
      <div className="mv-cfg-values">
        <div className="mv-cfg-cell">
          <span className="mv-cfg-k">{t.quantityLabel}</span>
          <EditableQuantity
            quantity={quantity}
            custom={custom}
            customLabel={t.customN}
            requested={requestedQuantity}
            mode={mode}
            direction={direction}
            live={live}
            instant={dragging}
            label={t.quantityEditLabel}
            className="mv-num mv-num--qty"
            onCommitQuantity={selectQuantity}
            onCommitCustom={requestCustomQuantity}
          />
          <span className="mv-cfg-sub">{t.unitLabel}</span>
        </div>

        <div className="mv-cfg-cell">
          <span className="mv-cfg-k">
            {custom ? t.totalLabelOnce : monthly ? t.totalLabelMonthly : t.totalLabelOnce}
          </span>
          {custom ? (
            <>
              <span className="mv-num mv-num--total">{t.customPrice}</span>
              <span className="mv-cfg-sub">{t.customPriceNote}</span>
            </>
          ) : (
            <>
              <SwapNumber value={price.totalCents} direction={direction} live={live} instant={dragging} className="mv-num mv-num--total">
                <Amount text={euro(price.totalCents)} />
              </SwapNumber>
              <span className="mv-cfg-sub">{monthly ? t.netMonthly : t.netOnce}</span>
              {/* Die Bindung steht am Preis, nicht in den Bedingungen. */}
              {monthly ? (
                <span className="mv-cfg-term">
                  {t.minTerm(MIN_TERM_MONTHS)}
                  <br />
                  {t.minCommitment(euro(commitmentCents))}
                </span>
              ) : null}
              {monthly ? (
                <span className="mv-cfg-note mv-cfg-note--signal">
                  {t.savingNote(euro(price.savingCents))}
                </span>
              ) : null}
            </>
          )}
        </div>

        <div className="mv-cfg-cell mv-cfg-cell--unit">
          <span className="mv-cfg-k">{t.perUnit}</span>
          {custom ? (
            <span className="mv-num mv-num--unit">{t.customUnit}</span>
          ) : (
            <SwapNumber value={price.unitCents} direction={-direction} live={live} instant={dragging} className="mv-num mv-num--unit">
              <Amount text={unitEuro(price.unitCents)} />
            </SwapNumber>
          )}
          <span className="mv-cfg-note">
            {/* Gilt seit der Preiskurve für beide Kaufarten und für jede ganze
                Zahl, nicht mehr nur zwischen den Ankern. */}
            {t.unitNote}
          </span>
        </div>
      </div>

      {/* ── Der Regler ────────────────────────────────────────────────────── */}
      <QuantitySlider
        min={MIN_QUANTITY[mode]}
        max={MAX_SELF_SERVICE}
        anchors={anchors}
        value={quantity}
        onChange={selectQuantity}
        autoStepping={autoStepping}
        label={t.sliderLabel}
        valueText={
          monthly
            ? t.sliderTextMonthly(quantity, euro(price.totalCents), MIN_TERM_MONTHS)
            : t.sliderTextOnce(quantity, euro(price.totalCents))
        }
        onDraggingChange={setDragging}
      />

      {/* ── Über 100 ──────────────────────────────────────────────────────── */}
      {/* Eigenes Bedienelement, nicht die Menge 101: "mehr als 100" ist keine
          Zahl auf der Schiene, und ein hochgerechneter Preis wäre erfunden. */}
      <div className="mv-custom">
        <button
          type="button"
          className="mv-custom-btn"
          aria-pressed={custom}
          onClick={() => {
            const next = !custom;
            setCustom(next);
            setRequestedQuantity(undefined);
            setPhase("idle");
            if (next) track("pricing_custom_100plus_selected", { from: quantity, mode, locale });
          }}
        >
          <span className="mv-custom-n">{t.customN}</span>
          <span>
            <span className="mv-custom-l">{t.customL}</span>
            <span className="mv-custom-s">{t.customS}</span>
          </span>
        </button>
      </div>

      {/* ── Für alle, die die Menge nicht kennen ──────────────────────────── */}
      {/* Steht direkt unter dem Regler, weil genau dort die Frage entsteht.
          Zugeklappt ist es eine Zeile und stört die Konfiguration nicht. */}
      <Recommendation quantity={quantity} mode={mode} type={type} market={market} />

      {/* ── Format ────────────────────────────────────────────────────────── */}
      <div style={{ marginTop: "clamp(24px, 3vw, 36px)" }}>
        <div className="mv-seg" role="group" aria-label="Format">
          {BACKLINK_TYPES.map((t2) => (
            <button
              key={t2.id}
              type="button"
              className="mv-seg-btn"
              aria-pressed={t2.id === type}
              onClick={() => selectType(t2.id)}
            >
              {t.formats[t2.id].label}
            </button>
          ))}
        </div>
        <p className="mv-seg-note" aria-live="polite">
          {t.formats[type].note}
        </p>
      </div>

      {/* ── Die Handlung ──────────────────────────────────────────────────── */}
      <div className="mv-cfg-foot" style={{ marginTop: "clamp(26px, 3.2vw, 40px)" }} id="bl-foot">
        {custom ? (
          <a
            className="mv-cta"
            href={`mailto:hello@seeszn.com?subject=${encodeURIComponent(t.customSubject)}&body=${encodeURIComponent(
              t.customBody(
                market,
                t.formats[type].label,
                monthly ? t.billingMonthlyWord : t.billingOnceWord,
                requestedQuantity,
              ),
            )}`}
            onClick={() => track("pricing_checkout_started", { product: "backlinks", custom: true, mode, locale })}
          >
            {t.customCta}
            <span className="mv-cta-arrow" aria-hidden="true">→</span>
          </a>
        ) : phase === "review" ? null : (
          <button type="button" id="bl-cta" className="mv-cta" onClick={openReview}>
            {ctaLabel}
            <span className="mv-cta-arrow" aria-hidden="true">→</span>
          </button>
        )}

        {/* Die Vertrauenszeile am Kauf: kurz, ohne Abzeichen, ohne Ausrufezeichen. */}
        {custom ? null : (
          <div className="mv-reassure">
            {t.trust.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        )}

        {phase === "review" && !custom ? (
          <OrderReview
            quantity={quantity}
            monthly={monthly}
            typeLabel={t.formats[type].label}
            market={market}
            unit={unitEuro(price.unitCents)}
            total={euro(price.totalCents)}
            saving={monthly ? euro(price.savingCents) : null}
            commitment={monthly ? euro(commitmentCents) : null}
            termMonths={MIN_TERM_MONTHS}
            busy={false}
            onBack={() => setPhase("idle")}
            onPay={startCheckout}
          />
        ) : null}

        {phase === "busy" ? (
          <button type="button" className="mv-cta" data-busy="true" disabled>
            {t.ctaBusy}
          </button>
        ) : null}

        <p className="mv-cfg-terms">
          {t.terms()}{" "}
          <Link href={TERMS_PATH} className="mv-secondary" style={{ fontSize: "inherit" }}>
            {t.termsLink}
          </Link>
          .
        </p>

        <div aria-live="polite" style={{ flexBasis: "100%" }}>
          {phase === "unavailable" ? (
            <p className="mv-notice">
              {t.unavailable}{" "}
              <a
                href={`mailto:hello@seeszn.com?subject=${encodeURIComponent(
                  `BACKLINKS ${quantity} ${monthly ? t.billingMonthlyWord : t.billingOnceWord} ${market}`,
                )}`}
              >
                hello@seeszn.com
              </a>{" "}
              {t.unavailableRequestLead}{" "}
              <Link href={PRICING_SCAN_HREF[locale]}>{t.unavailableRequestLink}</Link>.{" "}
              {t.unavailableTail}
            </p>
          ) : null}
          {phase === "error" ? (
            <p className="mv-notice">
              {t.error}{" "}
              <a href="mailto:hello@seeszn.com">hello@seeszn.com</a>.
            </p>
          ) : null}
        </div>
      </div>

      {/* ── Die Staffel als Beleg ─────────────────────────────────────────── */}
      <PriceScale mode={mode} quantity={quantity} onPick={selectQuantity} locale={locale} t={t} />

      {/* ── Klebende Kaufleiste ───────────────────────────────────────────── */}
      {/* Erscheint erst, wenn der Kauf-Knopf das Bild verlassen hat, und
          verschwindet wieder bei den Fragen am Ende. Während der Übersicht,
          der Zahlung oder im Custom-Zustand bleibt sie aus: dort führt die
          Handlung dort schon vor Augen, eine zweite wäre Rauschen. */}
      <StickyBuy
        name={t.eyebrow}
        detail={
          monthly
            ? `${quantity} · ${t.monthly} · ${euro(price.totalCents)} · ${copy.sticky.minTermShort(MIN_TERM_MONTHS)}`
            : `${quantity} · ${t.once} · ${euro(price.totalCents)}`
        }
        cta={copy.sticky.continueLabel}
        onClick={openReview}
        afterId="bl-cta"
        untilId="bl-close"
        hidden={custom || phase === "review" || phase === "busy"}
      />
    </div>
  );
}
