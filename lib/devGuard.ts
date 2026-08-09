import "server-only";

// ─── Schutz vor versehentlichen Produktionswirkungen in der Entwicklung ───────
// Lokal zeigt `.env.local` auf dieselbe Supabase-Instanz und denselben
// Mailprovider wie die Produktion. Ein einziger Testabsendeklick erzeugt damit
// einen echten Lead und echte E-Mails. Genau das ist beim V6-QA passiert.
//
// Regel:
//   Produktion  -> unverändert. Dieses Modul greift dort nie ein.
//   Entwicklung -> standardmäßig kein Schreiben, kein Mailversand.
//
// Die Route läuft trotzdem vollständig durch und antwortet erfolgreich, damit
// der Kaufweg lokal end-to-end testbar bleibt. Sie meldet dabei ehrlich, dass
// nichts geschrieben und nichts versendet wurde.
//
// Umgebungsvariablen:
//   FIRST_MOVE_DEV_ALLOW_WRITES=true
//     Hebt die Sperre lokal auf. Nur bewusst setzen, nie in Produktion.
//   SEESZN_DEV_MAIL_TO=name@example.com
//     Leitet bei aufgehobener Sperre jede Mail auf diese Adresse um, damit
//     lokale Tests nie bei einem echten Empfänger landen.
//
// Fail-safe: die Entscheidung hängt an NODE_ENV. Ist NODE_ENV "production",
// gibt dieses Modul immer frei, unabhängig von allen anderen Variablen. Es kann
// also nie passieren, dass Produktion still einen Testmodus fährt.

export interface WriteGuard {
  /** True, wenn Lead-Writes und Mailversand ausgeführt werden dürfen. */
  allowed: boolean;
  /** Kurzer Grund für die Antwort und das Log. Nur in der Entwicklung gesetzt. */
  reason?: string;
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Entscheidet, ob eine Route Leads speichern und Mails versenden darf.
 * In Produktion immer true.
 */
export function outboundGuard(): WriteGuard {
  if (isProduction()) return { allowed: true };
  if (process.env.FIRST_MOVE_DEV_ALLOW_WRITES === "true") return { allowed: true };
  return {
    allowed: false,
    reason:
      "Entwicklungsmodus: kein Lead gespeichert, keine E-Mail versendet. Zum bewussten Testen FIRST_MOVE_DEV_ALLOW_WRITES=true setzen.",
  };
}

/**
 * Empfängeradresse für eine ausgehende Mail.
 * In Produktion immer der echte Empfänger. In der Entwicklung nur dann ein
 * anderer, wenn SEESZN_DEV_MAIL_TO gesetzt ist.
 */
export function mailRecipient(intended: string): string {
  if (isProduction()) return intended;
  const override = process.env.SEESZN_DEV_MAIL_TO?.trim();
  return override || intended;
}

/** True, wenn Mails in der Entwicklung umgeleitet werden. Nur für Logs. */
export function mailIsRedirected(): boolean {
  return !isProduction() && Boolean(process.env.SEESZN_DEV_MAIL_TO?.trim());
}

/**
 * Darf dieser Prozess in die geteilte Datenbank schreiben?
 *
 * Dieselbe Entscheidung wie `outboundGuard`, nur für Persistenz statt für Leads
 * und Mails: lokal zeigt .env.local auf die Produktionsdatenbank, also schreibt
 * die Entwicklung dort standardmäßig nichts hin. Der First-Move-Scan-Kontext
 * fällt dann auf einen Prozessspeicher zurück, damit der Weg vom Scan zur
 * Anfrage lokal trotzdem vollständig funktioniert.
 *
 * In Produktion immer true.
 */
export function persistenceAllowed(): boolean {
  return outboundGuard().allowed;
}
