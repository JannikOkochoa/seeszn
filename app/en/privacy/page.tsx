import type { Metadata } from "next";
import Nav from "@/components/Nav";
import LegalLayout from "@/components/legal/LegalLayout";
import Footer from "@/components/Footer";
import { en } from "@/lib/i18n/en";

export const metadata: Metadata = {
  title: "Privacy Policy — SEESZN",
  description: "Privacy policy for SEESZN — how we handle your data, plainly stated.",
  robots: { index: false },
};

export default function PrivacyPage() {
  const p = en.privacyPage;
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
