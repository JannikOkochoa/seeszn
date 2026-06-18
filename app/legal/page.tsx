import type { Metadata } from "next";
import Nav from "@/components/Nav";
import LegalLayout from "@/components/legal/LegalLayout";
import Footer from "@/components/Footer";
import { de } from "@/lib/i18n/de";

export const metadata: Metadata = {
  title: "Rechtliche Hinweise · SEESZN",
  description: "Rechtliche Hinweise und Betreiberangaben für SEESZN, eine Marke der Okri Holdings LLC.",
  robots: { index: false },
};

export default function DeLegalPage() {
  const p = de.legalPage;
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
          active="legal"
        />
      </main>
      <Footer />
    </>
  );
}
