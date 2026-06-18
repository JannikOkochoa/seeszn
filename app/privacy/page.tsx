import type { Metadata } from "next";
import Nav from "@/components/Nav";
import LegalLayout from "@/components/legal/LegalLayout";
import Footer from "@/components/Footer";
import { de } from "@/lib/i18n/de";

export const metadata: Metadata = {
  title: "Datenschutzerklärung · SEESZN",
  description: "Datenschutzerklärung für SEESZN: wie wir mit deinen Daten umgehen.",
  robots: { index: false },
};

export default function DePrivacyPage() {
  const p = de.privacyPage;
  return (
    <>
      <Nav />
      <main>
        <LegalLayout
          accession={p.accession}
          meta={p.meta}
          title={p.title}
          subtitle={p.subtitle}
          sections={p.sections}
          footer={p.updated}
          active="privacy"
        />
      </main>
      <Footer />
    </>
  );
}
