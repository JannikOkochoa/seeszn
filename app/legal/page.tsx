import type { Metadata } from "next";
import Nav from "@/components/Nav";
import LegalLayout from "@/components/legal/LegalLayout";
import Footer from "@/components/Footer";
import { en } from "@/lib/i18n/en";

export const metadata: Metadata = {
  title: "Legal Notice — SEESZN",
  description: "Legal notice and operator information for SEESZN — a brand of Okri Holdings LLC.",
  robots: { index: false },
};

export default function LegalPage() {
  const p = en.legalPage;
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
