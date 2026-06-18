import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ResultView from "@/components/diagnosis/ResultView";

// Dynamic, per-scan tool result — not a content page, so keep it out of the index.
export const metadata: Metadata = {
  title: "Sichtbarkeitsprüfung: Ergebnis | SEESZN",
  robots: { index: false, follow: false },
};

export default function DiagnosisResultPage() {
  return (
    <>
      <Nav />
      <main>
        <ResultView />
      </main>
      <Footer />
    </>
  );
}
