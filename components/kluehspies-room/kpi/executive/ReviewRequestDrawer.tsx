"use client";

// ─── Bewertungen anfragen ─────────────────────────────────────────────────────
// Ruhiger Drawer mit vier reinen Kopier-Aktionen: Review-Link, QR-Code (lokal
// aus dem Link erzeugt, kein externer Dienst, kein Tracking), E-Mail-Text,
// WhatsApp-Text. Kein automatischer Versand, keine gespeicherten
// Kontaktdaten. Der QR-Code entsteht clientseitig über qrcode-generator
// (MIT, keine Netzwerkanfrage, keine Nutzerdaten außer dem öffentlichen Link).

import { useMemo, useState } from "react";
import qrcode from "qrcode-generator";
import Drawer from "../Drawer";

const REVIEW_LINK = "https://g.page/r/CfaadrmCUnCIEBM/review";

const EMAIL_TEXT = `Vielen Dank, dass Sie mit Klühspies unterwegs waren. Ihre Rückmeldung hilft anderen Lehrkräften bei der Planung ihrer Klassenfahrt und unterstützt unser Team dabei, die Reisen weiter zu verbessern.

Wir freuen uns über Ihre Google-Bewertung:

${REVIEW_LINK}`;

const WHATSAPP_TEXT = `Vielen Dank für die gemeinsame Klassenfahrt. Wir würden uns sehr über eine kurze Google-Bewertung freuen. Damit helfen Sie anderen Lehrkräften und unserem Team:

${REVIEW_LINK}`;

/** QR-Matrix aus dem Review-Link; Fehlerkorrektur „M" reicht für Print und Bildschirm. */
function reviewLinkQrMatrix(): boolean[][] {
  const qr = qrcode(0, "M");
  qr.addData(REVIEW_LINK);
  qr.make();
  const size = qr.getModuleCount();
  const matrix: boolean[][] = [];
  for (let row = 0; row < size; row += 1) {
    const line: boolean[] = [];
    for (let col = 0; col < size; col += 1) line.push(qr.isDark(row, col));
    matrix.push(line);
  }
  return matrix;
}

/** Anzeigegröße pro Modul: groß genug für zuverlässiges Scannen und Ausdrucken. */
const QR_DISPLAY_SCALE = 7.5;

/** Eigenständiger, scanoptimierter SVG-String (schwarz auf weiß) zum Speichern. */
function qrSvgString(matrix: boolean[][]): string {
  const size = matrix.length;
  const cell = 8;
  const margin = cell * 2;
  const px = size * cell + margin * 2;
  let rects = "";
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (matrix[row][col]) {
        rects += `<rect x="${margin + col * cell}" y="${margin + row * cell}" width="${cell}" height="${cell}" fill="#000000"/>`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${px} ${px}" width="${px}" height="${px}"><rect width="${px}" height="${px}" fill="#ffffff"/>${rects}</svg>`;
}

function QrCode({ matrix }: { matrix: boolean[][] }) {
  const size = matrix.length;
  const cell = 4;
  const px = size * cell;
  return (
    <svg
      viewBox={`0 0 ${px} ${px}`}
      width={size * QR_DISPLAY_SCALE}
      height={size * QR_DISPLAY_SCALE}
      role="img"
      aria-label="QR-Code, führt zum Google-Bewertungslink"
      className="kw-qr"
    >
      <rect x={0} y={0} width={px} height={px} fill="var(--paper)" />
      {matrix.map((line, row) =>
        line.map(
          (dark, col) =>
            dark && (
              <rect
                key={`${row}-${col}`}
                x={col * cell}
                y={row * cell}
                width={cell}
                height={cell}
                fill="var(--ink-strong)"
              />
            ),
        ),
      )}
    </svg>
  );
}

type CopyKey = "link" | "email" | "whatsapp";

export default function ReviewRequestDrawer({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState<CopyKey | null>(null);
  const qrMatrix = useMemo(() => reviewLinkQrMatrix(), []);

  async function copy(key: CopyKey, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((current) => (current === key ? null : current)), 2200);
    } catch {
      // Zwischenablage ohne Berechtigung: kein Fehlerdialog, der Text steht sichtbar auf der Seite.
    }
  }

  function saveQr() {
    const blob = new Blob([qrSvgString(qrMatrix)], { type: "image/svg+xml" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = "kluehspies-google-bewertung-qr.svg";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={
        <div>
          <span className="kr-eyebrow">Google-Bewertungen</span>
          <span className="kw-drawer-name">Bewertungen anfragen</span>
        </div>
      }
    >
      <section className="kw-dsection kw-dsection--head" aria-label="Review-Link">
        <h3 className="kw-dsection-title">Review-Link</h3>
        <p className="kr-body kw-review-link-text">{REVIEW_LINK}</p>
        <div className="kw-form-actions">
          <button type="button" className="kr-btn" onClick={() => void copy("link", REVIEW_LINK)}>
            Link kopieren
          </button>
          <a href={REVIEW_LINK} target="_blank" rel="noopener noreferrer" className="kw-link">
            Link öffnen
          </a>
          {copied === "link" && (
            <span className="kr-meta" role="status">
              Text kopiert
            </span>
          )}
        </div>
      </section>

      <section className="kw-dsection" aria-label="QR-Code">
        <div className="kw-dsection-head">
          <h3 className="kw-dsection-title">QR-Code</h3>
        </div>
        <QrCode matrix={qrMatrix} />
        <div className="kw-form-actions">
          <button type="button" className="kw-link" onClick={saveQr}>
            QR-Code speichern
          </button>
        </div>
        <p className="kr-meta kw-qr-note">
          Lokal aus dem Review-Link erzeugt. Kein externer Dienst, keine Nutzerdaten, kein Tracking.
        </p>
      </section>

      <section className="kw-dsection" aria-label="E-Mail-Text">
        <div className="kw-dsection-head">
          <h3 className="kw-dsection-title">E-Mail-Text</h3>
        </div>
        <p className="kr-body kw-review-copy-text">{EMAIL_TEXT}</p>
        <div className="kw-form-actions">
          <button type="button" className="kr-btn" onClick={() => void copy("email", EMAIL_TEXT)}>
            Text kopieren
          </button>
          {copied === "email" && (
            <span className="kr-meta" role="status">
              Text kopiert
            </span>
          )}
        </div>
      </section>

      <section className="kw-dsection kw-dsection--last" aria-label="WhatsApp-Text">
        <div className="kw-dsection-head">
          <h3 className="kw-dsection-title">WhatsApp-Text</h3>
        </div>
        <p className="kr-body kw-review-copy-text">{WHATSAPP_TEXT}</p>
        <div className="kw-form-actions">
          <button type="button" className="kr-btn" onClick={() => void copy("whatsapp", WHATSAPP_TEXT)}>
            Text kopieren
          </button>
          {copied === "whatsapp" && (
            <span className="kr-meta" role="status">
              Text kopiert
            </span>
          )}
        </div>
      </section>
    </Drawer>
  );
}
