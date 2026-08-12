import { Source_Sans_3 } from "next/font/google";
import KluehspiesLogin from "@/components/kluehspies-room/KluehspiesLogin";
import { hasKluehspiesAccess } from "@/lib/kpi/access";
import { createSupabaseServerClient, missingSessionEnv } from "@/lib/supabase/server";

// Die Login-Ansicht ist dieselbe Komponente wie im Klühspies Room und erwartet
// dort die CI-Schrift über diese Variable. Sie wird hier genauso gesetzt, damit
// die Zugangstür an beiden Stellen identisch aussieht.
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-kluehspies",
  display: "swap",
});

/**
 * Zugangstür vor allen /mockups-Routen.
 *
 * Exakt derselbe Ablauf wie in app/kluehspies-room/page.tsx: Cookie-Session
 * serverseitig prüfen, dann die Membership. Ohne Session und ohne Membership
 * gibt es die bekannte Login-Ansicht statt Inhalt. Es entsteht keine zweite
 * Auth-Logik, keine neue Rolle und kein neuer Datenbankzugriff jenseits der
 * Membership-Abfrage, die der Raum ohnehin macht.
 *
 * Die Kinder werden nur dann gerendert, wenn beide Prüfungen bestanden sind.
 */
export default async function MockupGate({ children }: { children: React.ReactNode }) {
  // Ohne Supabase-Konfiguration kann niemand angemeldet sein. Vor dieser
  // Prüfung warf der Client-Aufbau, was die Route mit einem 500 beendete statt
  // die Zugangstür zu zeigen. Die Tür bleibt zu, aber die Seite antwortet.
  const missing = missingSessionEnv();
  if (missing.length > 0) {
    console.error(
      `[MockupGate] Supabase nicht konfiguriert, fehlende Variablen: ${missing.join(", ")}`,
    );
    return (
      <div className={sourceSans.variable}>
        <KluehspiesLogin unavailable />
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className={sourceSans.variable}>
        <KluehspiesLogin />
      </div>
    );
  }

  if (!(await hasKluehspiesAccess(supabase, user))) {
    return (
      <div className={sourceSans.variable}>
        <KluehspiesLogin noAccessEmail={user.email ?? "diesem Konto"} />
      </div>
    );
  }

  return <>{children}</>;
}
