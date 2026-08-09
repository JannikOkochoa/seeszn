// ─── First Move: eigenständige Abschnitte der Google-Ads-Seite ────────────────
// Die Google-Ads-Seite verkauft dasselbe Produkt zum selben Preis. Sie ist keine
// Kopie: der Zwei-Stufen-Weg und die Grenze zwischen öffentlicher und
// Account-Evidenz stehen nur hier und tragen den Message Match aus der Anzeige.
//
// V6 fasst die beiden früheren Abschnitte zu einem zusammen und legt die Details
// in aufklappbare Blöcke. Die Aussage bleibt vollständig, sie drängt sich nur
// nicht mehr vor die eigentliche Handlung.

import { READ_ONLY_GUARANTEES, READ_ONLY_UNLOCKS } from "@/lib/first-move/paid";
import { PRICE_DISPLAY_NET } from "@/lib/first-move/product";

const PUBLIC_SIGNALS: { k: string; v: string }[] = [
  { k: "Mess-Signale", v: "Welche Tag-Container und Conversion-Signale im ausgelieferten HTML sichtbar sind." },
  { k: "Consent", v: "Ob eine gängige Consent-Plattform eingebunden ist und wie sie zu den Tags steht." },
  { k: "Konversionspfad", v: "Ob die Einstiegsseite überhaupt einen nächsten Schritt anbietet." },
  { k: "Formularreibung", v: "Wie viele Felder und Pflichtfelder zwischen Klick und Anfrage stehen." },
  { k: "Aussageklarheit", v: "Ob die Seite eine eindeutige Hauptaussage trägt oder mehrere gleichzeitig." },
  { k: "Ladeverhalten", v: "Wie die Einstiegsseite mobil lädt, gemessen und nicht geschätzt." },
];

const ACCOUNT_ONLY: string[] = [
  "vollständige Conversion-Konfiguration",
  "Attributionseinstellungen",
  "tatsächlicher Search-Term Waste",
  "PMax Incrementality",
  "Brand gegen Non-Brand",
  "Offline-Conversion-Qualität",
  "vollständige Leadqualität",
];

const NEVER_ALONE: string[] = [
  "ein isolierter niedriger Quality Score",
  "eine einzelne CTR-Abweichung",
  "eine generische Best Practice",
  "eine einzelne Ad-Strength-Warnung",
  "ein Recommendation Score",
  "eine automatische Google-Empfehlung ohne unabhängige Evidenz",
];

/** Der Zwei-Stufen-Weg: öffentlich zuerst, Account-Ebene nur mit Read-only. */
export function PaidStages() {
  return (
    <section className="fm-section" aria-labelledby="fm-paid-stages" id="vorcheck">
      <div className="fm-wrap">
        <div className="fm-cols2">
          <div>
            <span className="fm-eyebrow">Zwei Stufen</span>
            <h2 id="fm-paid-stages" className="fm-h2" style={{ marginTop: 14, maxWidth: "18ch" }}>
              Öffentlich prüfbar und im Konto prüfbar
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p className="fm-serif">
              Ein Google-Ads-Problem beginnt selten im Konto. Es beginnt bei dem, was das Konto als
              Signal zurückbekommt, und bei der Seite, auf der der bezahlte Klick landet.
            </p>
            <p className="fm-body">
              Der Paid Check startet deshalb mit Domain und Budgetband, ohne E-Mail und ohne
              Verbindung zu deinem Konto. Was wir dabei sagen, steht nachprüfbar im ausgelieferten
              HTML. Alles, was im Konto liegt, prüfen wir erst mit lesendem Zugriff.
            </p>
          </div>
        </div>

        <div className="fm-cols2" style={{ marginTop: 48 }}>
          <div>
            <span className="fm-eyebrow" style={{ marginBottom: 12 }}>
              Stufe 1, ohne Account-Zugriff
            </span>
            <dl className="fm-facts-grid">
              {PUBLIC_SIGNALS.map((item) => (
                <div key={item.k}>
                  <dt>{item.k}</dt>
                  <dd>{item.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <span className="fm-eyebrow" style={{ marginBottom: 12 }}>
                Stufe 2, Read-only
              </span>
              <p className="fm-body">
                Lesender Zugriff auf den Google-Ads-Account: {READ_ONLY_GUARANTEES.join(", ")}.
                Zugangsdaten werden nicht protokolliert.
              </p>
              <span className="fm-eyebrow" style={{ marginTop: 18, marginBottom: 10 }}>
                Damit prüfbar
              </span>
              <ul className="fm-list fm-list--in">
                {READ_ONLY_UNLOCKS.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            <details className="fm-details">
              <summary>Was wir ohne Zugriff nicht beurteilen</summary>
              <div className="fm-details-body">
                <ul className="fm-list fm-list--out">
                  {ACCOUNT_ONLY.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </details>

            <details className="fm-details">
              <summary>Was allein nie ein First Move wird</summary>
              <div className="fm-details-body">
                <ul className="fm-list fm-list--out">
                  {NEVER_ALONE.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p className="fm-body">
                  Ein Paid First Move braucht mindestens zwei sinnvolle Signale oder eine klare
                  wirtschaftliche Evidenz. Er bleibt begrenzt: für {PRICE_DISPLAY_NET} versprechen
                  wir keinen kompletten Account Rebuild. Zeigt der Befund, dass nur ein Rebuild
                  hilft, sagen wir das und grenzen vorher gemeinsam ein.
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
