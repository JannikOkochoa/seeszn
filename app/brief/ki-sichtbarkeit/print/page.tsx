import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KI-Sichtbarkeits-Brief 2026 · Druckversion",
  robots: { index: false, follow: false },
};

// ── Shared sub-components ─────────────────────────────────────────────────────

function PageFooter({ dark }: { dark?: boolean }) {
  return (
    <div
      className="pp-footer"
      style={{
        borderTopColor: dark ? "#343226" : "#c9c0ae",
        color: dark ? "#8f897b" : "#81796a",
      }}
    >
      <span>DER KI-SICHTBARKEITS-BRIEF · 2026</span>
      <span>SEESZN</span>
    </div>
  );
}

function Merksatz({ children, dark }: { children: string; dark?: boolean }) {
  return (
    <blockquote
      className="pp-merksatz"
      style={{
        borderTopColor: dark ? "#5a5544" : "#c9c0ae",
        color: dark ? "#eee6d6" : "#1f1e1a",
      }}
    >
      {children}
    </blockquote>
  );
}

function PageNum({ n, dark }: { n: string; dark?: boolean }) {
  return (
    <span
      className="pp-pagenum"
      style={{ color: dark ? "#343226" : "#c9c0ae" }}
    >
      {n}
    </span>
  );
}

function Label({ children, dark }: { children: string; dark?: boolean }) {
  return (
    <p
      className="pp-label"
      style={{ color: dark ? "#8f897b" : "#81796a" }}
    >
      {children}
    </p>
  );
}

// ── Individual pages ──────────────────────────────────────────────────────────

function Page01Cover() {
  return (
    <section className="pp-page">
      <div className="pp-cover-inner">
        <div>
          <p className="pp-cover-edition">DER KI-SICHTBARKEITS-BRIEF · AUSGABE 2026</p>
          <div className="pp-rule" />
          <h1 className="pp-cover-title">
            Warum gute B2B-Firmen in KI-Suchen unsichtbar werden
          </h1>
          <p className="pp-cover-subtitle">
            Ein unabhängiger Leitfaden für Marken, die gefunden, verstanden und zitiert werden wollen.
          </p>
        </div>
        <div>
          <p className="pp-cover-publisher">SEESZN Research Brief / 2026</p>
        </div>
      </div>
      <PageNum n="01" />
      <PageFooter />
    </section>
  );
}

function Page02() {
  return (
    <section className="pp-page">
      <div className="pp-content">
        <h2 className="pp-headline">Warum dieses Dokument existiert</h2>
        <p className="pp-body">
          Viele Unternehmen spüren gerade etwas, das sie noch nicht benennen können.
        </p>
        <p className="pp-body">
          Die Website läuft. Das Geschäft läuft. Die Anfragen kommen, aber sie kommen anders.
          Manche Kanäle werden leiser. Manche Kunden sagen Sätze wie: „Wir haben eine KI gefragt,
          welche Anbieter es gibt.” Und der eigene Name fiel nicht.
        </p>
        <p className="pp-body">
          Das ist kein Einzelfall. Es ist der Anfang einer Verschiebung, die so groß ist wie der
          Wechsel von den Gelben Seiten zu Google. Suche verwandelt sich gerade von einer Liste mit
          Links in ein Gespräch mit Antworten. Und in einem Gespräch gelten andere Regeln als in
          einer Liste.
        </p>
        <p className="pp-body">
          Dieses Dokument erklärt diese Regeln. Es ist kein Hype-Papier und kein Untergangsszenario.
          Es ist ein Versuch, ein neues Sichtbarkeitsproblem so einfach wie möglich zu beschreiben.
          und eine Denkweise mitzugeben, mit der man es lösen kann.
        </p>
        <p className="pp-body">
          Es richtet sich an Menschen, die Unternehmen führen, Marketing verantworten oder etwas
          aufbauen: Geschäftsführer, Marketingteams, Gründer. Menschen, die keine Zeit für Buzzwords
          haben, aber wissen müssen, was sich verändert.
        </p>
        <p className="pp-body">
          Eine Beobachtung vorweg, die fast alles Folgende zusammenfasst: Die meisten Firmen, die in
          KI-Antworten nicht vorkommen, sind nicht schlecht. Sie sind nur schlecht lesbar. Ihre
          Qualität existiert: in Projekten, in Köpfen, in zufriedenen Kunden. Aber sie existiert
          nicht in einer Form, die ein System abrufen, verstehen und weitergeben kann.
        </p>
        <p className="pp-body">Genau darum geht es auf den folgenden Seiten.</p>
        <Merksatz>
          Nicht jede unsichtbare Firma ist schlecht. Viele sind nur nicht lesbar genug.
        </Merksatz>
      </div>
      <PageNum n="02" />
      <PageFooter />
    </section>
  );
}

function Page03() {
  return (
    <section className="pp-page">
      <div className="pp-content">
        <h2 className="pp-headline">Die alte Sichtbarkeit</h2>
        <p className="pp-body">
          Zwanzig Jahre lang funktionierte Sichtbarkeit im Netz nach einer Logik, die man lernen konnte.
        </p>
        <p className="pp-body">
          Es gab Suchbegriffe. Es gab Rankings. Es gab Seite eins. Wer dort stand, bekam Klicks. Wer
          Klicks bekam, bekam Anfragen. Die Spielregeln waren hart, aber transparent: Inhalte schreiben,
          Technik sauber halten, Links aufbauen, Positionen messen, nachjustieren.
        </p>
        <p className="pp-body">
          Das war nie einfach. Aber es war verständlich. Man konnte am Montag eine Position messen und
          am Freitag wissen, ob man besser geworden war. Sichtbarkeit war eine Rangliste, und eine
          Rangliste kann man erklimmen.
        </p>
        <p className="pp-body">
          Diese Logik hat eine ganze Industrie geprägt, und das Denken vieler Unternehmen bis heute.
          Wenn ein Geschäftsführer „Sichtbarkeit” sagt, meint er meist immer noch: „Wo stehen wir bei
          Google?” Wenn ein Marketingteam „Content” sagt, meint es meist: „Texte, die ranken sollen.”
        </p>
        <p className="pp-body">
          Wichtig: Diese Welt ist nicht verschwunden. Google existiert. Rankings existieren. Klicks
          existieren. Wer heute behauptet, klassische Suche sei tot, verkauft meist etwas.
        </p>
        <p className="pp-body">
          Aber über diese Welt hat sich eine zweite Schicht gelegt. Eine Schicht, die nach anderen
          Regeln funktioniert und die immer öfter entscheidet, ob ein Unternehmen überhaupt in die
          engere Wahl kommt, bevor jemand die Website jemals gesehen hat.
        </p>
        <p className="pp-body">
          Um die neue Schicht zu verstehen, muss man die alte nicht vergessen. Man muss nur akzeptieren,
          dass sie nicht mehr die ganze Geschichte erzählt.
        </p>
        <Merksatz>
          Die alte Sichtbarkeit war eine Rangliste. Man konnte sie erklimmen.
        </Merksatz>
      </div>
      <PageNum n="03" />
      <PageFooter />
    </section>
  );
}

function Page04() {
  return (
    <section className="pp-page pp-page--dark">
      <div className="pp-content">
        <h2 className="pp-headline pp-headline--dark">Die neue Sichtbarkeit</h2>
        <p className="pp-body pp-body--dark">
          Heute beginnt ein wachsender Teil aller Recherchen nicht mehr mit einer Liste, sondern mit
          einer Frage und endet mit einer Antwort.
        </p>
        <p className="pp-body pp-body--dark">
          Jemand fragt ein KI-System: „Welche Anbieter für X gibt es im deutschsprachigen Raum?” Oder:
          „Was kostet ungefähr Y?” Oder: „Worauf muss ich achten, wenn ich Z einkaufe?” Das System
          antwortet in ganzen Sätzen. Es nennt drei, vier, fünf Namen. Es fasst Vergleiche zusammen.
          Es zitiert Quellen, manchmal sichtbar, manchmal unsichtbar.
        </p>
        <p className="pp-body pp-body--dark">Was dabei passiert, ist fundamental anders als ein Ranking:</p>
        <p className="pp-body pp-body--dark">
          <strong className="pp-strong--dark">Sichtbarkeit entsteht früher.</strong> Nicht erst, wenn
          jemand auf die Website klickt, sondern in dem Moment, in dem ein System entscheidet, wen es
          in seine Antwort aufnimmt.
        </p>
        <p className="pp-body pp-body--dark">
          <strong className="pp-strong--dark">Sichtbarkeit entsteht leiser.</strong> Es gibt keine
          Positionsanzeige. Niemand schickt eine Benachrichtigung: „Sie wurden heute in 200 Antworten
          nicht erwähnt.” Das Fehlen ist unsichtbar, und genau das macht es gefährlich.
        </p>
        <p className="pp-body pp-body--dark">
          <strong className="pp-strong--dark">Sichtbarkeit entsteht indirekter.</strong> Systeme stützen
          ihre Antworten nicht nur auf die Website einer Firma, sondern auf alles, was über sie existiert.
        </p>
        <p className="pp-body pp-body--dark">
          Die unbequeme Pointe: Eine Firma kann technisch perfekt bei Google stehen und trotzdem in
          dieser neuen Schicht ein weißer Fleck sein.
        </p>
        <Merksatz dark>
          In der neuen Suche wird über dich gesprochen, bevor du den Raum betrittst.
        </Merksatz>
      </div>
      <PageNum n="04" dark />
      <PageFooter dark />
    </section>
  );
}

function Page05() {
  return (
    <section className="pp-page">
      <div className="pp-content">
        <h2 className="pp-headline">Indexiert ist nicht abrufbar</h2>
        <p className="pp-body">
          Das größte Missverständnis in vielen Unternehmen lässt sich in einem Satz zusammenfassen:
          „Wir sind doch bei Google drin.”
        </p>
        <p className="pp-body">
          Drin sein ist die unterste Stufe. Über ihr liegen vier weitere, und jede ist eine eigene Hürde.
        </p>

        {/* Staircase diagram */}
        <div className="pp-staircase">
          {[
            { n: "01", label: "INDEXIERT", desc: "Eine Suchmaschine kennt deine Seite. Die Eintrittskarte, nicht der Sitzplatz." },
            { n: "02", label: "AUFFINDBAR", desc: "Ein Mensch kann dich finden, vor allem, wenn er deinen Namen kennt.", mark: "← Hier stehen die meisten B2B-Firmen" },
            { n: "03", label: "ABRUFBAR", desc: "Ein System kann dich als passende Antwort heranziehen, wenn jemand eine generische Frage stellt." },
            { n: "04", label: "ZITIERBAR", desc: "Deine Inhalte sind klar und eigenständig genug, dass ein System sie als Beleg verwenden kann." },
            { n: "05", label: "VERTRAUENSWÜRDIG", desc: "Menschen und Systeme erkennen, warum du relevant bist, bestätigt durch externe Quellen." },
          ].map((s) => (
            <div key={s.n} className="pp-stair">
              <div className="pp-stair-header">
                <span className="pp-stair-n">{s.n}</span>
                <span className="pp-stair-label">{s.label}</span>
                {s.mark && <span className="pp-stair-mark">{s.mark}</span>}
              </div>
              <p className="pp-stair-desc">{s.desc}</p>
            </div>
          ))}
        </div>

        <Merksatz>
          Indexiert heißt: Du existierst im Archiv. Abrufbar heißt: Du existierst in der Antwort.
        </Merksatz>
      </div>
      <PageNum n="05" />
      <PageFooter />
    </section>
  );
}

function Page06() {
  return (
    <section className="pp-page pp-page--soft">
      <div className="pp-content">
        <h2 className="pp-headline">Das B2B-Problem</h2>
        <p className="pp-body">
          Man könnte meinen, das alles betreffe vor allem Konsumprodukte: Sneaker, Hotels,
          Software-Abos. Das Gegenteil ist der Fall. B2B ist verwundbarer, aus Gründen, die im
          Geschäftsmodell selbst liegen.
        </p>

        {[
          {
            label: "B2B-ENTSCHEIDUNGEN SIND LANG",
            body: "Zwischen erstem Interesse und Unterschrift liegen Wochen oder Monate. In dieser Zeit wird recherchiert, verglichen, intern diskutiert. Jede dieser Recherchen ist heute ein potenzielles KI-Gespräch.",
          },
          {
            label: "B2B-ENTSCHEIDUNGEN SIND RISKANT",
            body: "Hohes Risiko erzeugt hohes Absicherungsbedürfnis. Und Absicherung heißt: mehr Recherche, mehr Quellen, mehr Vergleich.",
          },
          {
            label: "B2B-ENTSCHEIDUNGEN HABEN VIELE BETEILIGTE",
            body: "Der Fachbereich recherchiert anders als der Einkauf, die Geschäftsführung anders als die IT. Jeder dieser Menschen stellt eigene Fragen, und immer öfter stellt er sie einem Antwortsystem.",
          },
          {
            label: "B2B VERGLEICHT, BEVOR ES SPRICHT",
            body: "Die Shortlist entsteht heute weitgehend ohne Beteiligung der Anbieter. Die entscheidende Frage lautet: Kommen wir überhaupt in die Gespräche, die vor dem Gespräch stattfinden?",
          },
        ].map((item) => (
          <div key={item.label} className="pp-factor">
            <p className="pp-factor-label">{item.label}</p>
            <p className="pp-body">{item.body}</p>
          </div>
        ))}

        <Merksatz>
          Im B2B entsteht die Shortlist heute, bevor der erste Anruf stattfindet.
        </Merksatz>
      </div>
      <PageNum n="06" />
      <PageFooter />
    </section>
  );
}

function Page07() {
  return (
    <section className="pp-page">
      <div className="pp-content">
        <h2 className="pp-headline">Was KI-Suche eigentlich braucht</h2>
        <p className="pp-body">
          Wenn man verstehen will, wie man in Antworten vorkommt, hilft eine einfache
          Perspektivumkehr: Was braucht ein Antwortsystem, um einen guten Job zu machen?
        </p>
        <p className="pp-body">
          Ein System, das einem Menschen eine verlässliche Antwort geben will, sucht nicht nach
          den schönsten Adjektiven. Es sucht nach Material, mit dem es arbeiten kann:
        </p>

        {[
          { label: "KONTEXT", body: "Wer ist diese Firma, was macht sie, für wen, wo, seit wann? Je eindeutiger eine Firma als Entität erkennbar ist, desto leichter kann ein System sie korrekt einordnen." },
          { label: "BELEGE", body: "Behauptungen sind billig. Systeme bevorzugen Inhalte, die etwas zeigen: konkrete Projekte, nachvollziehbare Zahlen, dokumentierte Vorgehensweisen." },
          { label: "VERGLEICHE", body: "Fast jede Kaufentscheidung ist eine Vergleichsentscheidung. Inhalte, die ehrlich vergleichen, sind für Antwortsysteme wertvoller als jede Selbstbeschreibung." },
          { label: "QUELLEN", body: "Ein System gewichtet, was mehrfach und unabhängig bestätigt wird. Eine Firma, die nur auf der eigenen Website existiert, ist eine Behauptung." },
          { label: "STRUKTUR", body: "Klare Überschriften, eindeutige Seiten pro Thema, saubere Technik. Nicht weil Maschinen pedantisch sind, sondern weil Struktur Bedeutung transportiert." },
        ].map((item) => (
          <div key={item.label} className="pp-factor">
            <p className="pp-factor-label">{item.label}</p>
            <p className="pp-body">{item.body}</p>
          </div>
        ))}

        <Merksatz>
          Antwortsysteme suchen kein Marketing. Sie suchen Material.
        </Merksatz>
      </div>
      <PageNum n="07" />
      <PageFooter />
    </section>
  );
}

function Page08() {
  return (
    <section className="pp-page pp-page--dark">
      <div className="pp-content">
        <h2 className="pp-headline pp-headline--dark">Das 5-Ebenen-Modell für KI-Sichtbarkeit</h2>
        <p className="pp-body pp-body--dark">
          Aus all dem lässt sich ein Modell ableiten. Es ist kein Geheimwissen und keine Software.
          Es ist eine Denkordnung: fünf Ebenen, auf denen Sichtbarkeit entsteht oder bricht.
        </p>

        {/* Layers diagram */}
        <div className="pp-layers">
          {[
            { n: "01", label: "IDENTITÄT", desc: "Wer ist die Firma, was bietet sie an, für wen ist sie relevant?" },
            { n: "02", label: "STRUKTUR", desc: "Die Website als Architektur: klare Seitenlogik, interne Verbindungen, technische Sauberkeit." },
            { n: "03", label: "EVIDENZ", desc: "Inhalte, die als Belege funktionieren: Fallstudien, Vergleiche, Kostentransparenz, echte FAQs." },
            { n: "04", label: "QUELLEN", desc: "Externe Erwähnungen, Verzeichnisse, Fachartikel, Bewertungen, Diskussionen." },
            { n: "05", label: "DIAGNOSE", desc: "Systematische Prüfung, wo Sichtbarkeit bricht, bevor produziert wird." },
          ].map((l) => (
            <div key={l.n} className="pp-layer">
              <div className="pp-layer-header">
                <span className="pp-layer-n">{l.n}</span>
                <span className="pp-layer-label">{l.label}</span>
              </div>
              <p className="pp-layer-desc">{l.desc}</p>
              <div className="pp-layer-bar" />
            </div>
          ))}
        </div>

        <Merksatz dark>
          Sichtbarkeit ist kein Projekt. Sie ist ein System aus fünf Ebenen.
        </Merksatz>
      </div>
      <PageNum n="08" dark />
      <PageFooter dark />
    </section>
  );
}

function Page09() {
  return (
    <section className="pp-page">
      <div className="pp-content">
        <Label>EBENE 01 · IDENTITÄT</Label>
        <h2 className="pp-headline">Ebene 1: Identität</h2>
        <p className="pp-body">
          Die erste Ebene klingt banal und ist es nicht: Wer bist du, in einer Form, die man
          weitergeben kann?
        </p>
        <p className="pp-body">
          Viele B2B-Websites beantworten diese Frage nicht. Sie sagen Dinge wie „Ihr Partner für
          innovative Lösungen” oder „Qualität seit 1987”. Das ist nicht falsch. Es ist nur unbrauchbar.
        </p>
        <p className="pp-body">
          Identität heißt, vier Fragen so präzise zu beantworten, dass ein Fremder sie fehlerfrei
          wiedergeben könnte:
        </p>
        {[
          { q: "Was genau bietest du an?", a: "Nicht die Kategorie, sondern das konkrete Angebot." },
          { q: "Für wen?", a: "Branche, Unternehmensgröße, Region, typische Ausgangslage. „Für alle” ist die Antwort, die niemand abrufen kann." },
          { q: "Wofür willst du genannt werden?", a: "Wenn jemand fragt „Wer kann X?” Bei welchem X soll dein Name fallen?" },
          { q: "Warum du, sagbar in zwei Sätzen?", a: "Nicht als Slogan, sondern als Begründung: Spezialisierung, Erfahrungstiefe, Region, Methode, nachweisbare Ergebnisse." },
        ].map((item, i) => (
          <div key={i} className="pp-factor">
            <p className="pp-factor-label">{item.q}</p>
            <p className="pp-body">{item.a}</p>
          </div>
        ))}
        <Merksatz>
          Wofür soll dein Name fallen, wenn du nicht im Raum bist?
        </Merksatz>
      </div>
      <PageNum n="09" />
      <PageFooter />
    </section>
  );
}

function Page10() {
  return (
    <section className="pp-page pp-page--soft">
      <div className="pp-content">
        <Label>EBENE 02 · STRUKTUR</Label>
        <h2 className="pp-headline">Ebene 2: Struktur</h2>
        <p className="pp-body">
          Die meisten B2B-Websites sind Broschüren. Eine abrufbare Website ist etwas anderes. Sie
          ist Architektur: ein Gebäude mit klar beschrifteten Räumen, in dem jede Frage eine Tür hat.
        </p>
        <p className="pp-body">Strukturarbeit heißt konkret:</p>
        {[
          { label: "EINDEUTIGE THEMENRÄUME", body: "Eine Seite, ein Thema, eine Frage. Sammelt eine Seite fünf Themen, kann ein System keinem davon vertrauen." },
          { label: "SEITENLOGIK ENTLANG DER ENTSCHEIDUNG", body: "Problemseiten, Branchen- und Zielgruppenseiten, Leistungsseiten, Vergleichsseiten, FAQ, angeordnet so, wie Kunden denken." },
          { label: "INTERNE VERBINDUNGEN", body: "Probleme verlinken auf Lösungen, Lösungen auf Belege, Belege auf Ansprechpartner. Interne Links sind die Flure des Gebäudes." },
          { label: "TECHNISCHE SAUBERKEIT", body: "Schnell ladend, sauber strukturiert, maschinenlesbar ausgezeichnet. Handwerk, das fehlt, macht alles darüber wirkungslos." },
        ].map((item) => (
          <div key={item.label} className="pp-factor">
            <p className="pp-factor-label">{item.label}</p>
            <p className="pp-body">{item.body}</p>
          </div>
        ))}
        <Merksatz>
          Eine Website ist kein Prospekt. Sie ist ein Gebäude, in dem jede Frage eine Tür braucht.
        </Merksatz>
      </div>
      <PageNum n="10" />
      <PageFooter />
    </section>
  );
}

function Page11() {
  return (
    <section className="pp-page">
      <div className="pp-content">
        <Label>EBENE 03 · EVIDENZ</Label>
        <h2 className="pp-headline">Ebene 3: Evidenz</h2>
        <p className="pp-body">
          Hier liegt der größte Denkfehler der letzten Jahre: die Gleichung „mehr Content = mehr
          Sichtbarkeit”. Sie hat Blog-Friedhöfe hervorgebracht. Generischer Content ist in der neuen
          Suche fast wertlos.
        </p>
        <p className="pp-body">
          Was zitiert wird, ist Evidenz: Inhalte, die etwas zeigen, was sonst nirgends steht.
          Beweisflächen: Flächen, auf denen die Kompetenz einer Firma überprüfbar wird.
        </p>
        <p className="pp-body">Die wichtigsten Beweisflächen im B2B:</p>
        {[
          { label: "ERKLÄRSEITEN", body: "Die ein Kundenproblem wirklich durchdringen, mit dem Detailgrad eines Praktikers." },
          { label: "VERGLEICHE", body: "Die ehrlich sind: Ansätze, Optionen, Preismodelle, auch die Fälle, in denen man selbst nicht die beste Wahl ist." },
          { label: "FALLSTUDIEN", body: "Die einen echten Verlauf zeigen: Ausgangslage, Vorgehen, Hindernisse, Ergebnis. Keine Jubelmeldungen, sondern Dokumentation." },
          { label: "KOSTEN- UND PREISTRANSPARENZ", body: "Die meistgestellte und meistverweigerte Frage im B2B. Wer sie seriös beantwortet, besetzt eine Fläche, die Wettbewerber freiwillig räumen." },
          { label: "FAQs AUS ECHTEN FRAGEN", body: "Nicht ausgedacht im Meetingraum, sondern gesammelt aus Vertrieb, Support und Erstgesprächen." },
        ].map((item) => (
          <div key={item.label} className="pp-factor">
            <p className="pp-factor-label">{item.label}</p>
            <p className="pp-body">{item.body}</p>
          </div>
        ))}
        <Merksatz>
          Zitiert wird nicht, wer am meisten schreibt. Zitiert wird, wer etwas belegt.
        </Merksatz>
      </div>
      <PageNum n="11" />
      <PageFooter />
    </section>
  );
}

function Page12() {
  return (
    <section className="pp-page pp-page--soft">
      <div className="pp-content">
        <Label>EBENE 04 · QUELLEN</Label>
        <h2 className="pp-headline">Ebene 4: Quellen</h2>
        <p className="pp-body">
          Stell dir vor, jemand behauptet auf einer Party, ein hervorragender Koch zu sein. Niemand
          sonst im Raum hat je von ihm gehört. Wie glaubwürdig ist die Behauptung?
        </p>
        <p className="pp-body">
          Genau so wirkt eine Firma, die nur auf der eigenen Website existiert. Antwortsysteme
          arbeiten, wie gute Journalisten, mit Quellenvielfalt:
        </p>
        {[
          { label: "BRANCHENVERZEICHNISSE UND LISTEN", body: "„Die wichtigsten Anbieter für X”: solche Übersichten sind die Vergleichsstrukturen, aus denen Antwortsysteme schöpfen." },
          { label: "FACHARTIKEL UND GASTBEITRÄGE", body: "Echte Beiträge mit Substanz in Branchenmedien. Keine gekauften Advertorials." },
          { label: "PARTNERSEITEN", body: "Verbände, Hersteller, Technologiepartner, Hochschulen. Oft existieren diese Beziehungen längst, sie sind nur online nirgends dokumentiert." },
          { label: "BEWERTUNGEN UND KUNDENSTIMMEN", body: "Drei detaillierte, nachvollziehbare Stimmen schlagen dreißig Fünf-Sterne-Einzeiler." },
          { label: "ECHTE DISKUSSIONEN", body: "Foren, Communities, Fachgruppen: Orte, an denen unabhängige Menschen über Probleme und Anbieter sprechen." },
        ].map((item) => (
          <div key={item.label} className="pp-factor">
            <p className="pp-factor-label">{item.label}</p>
            <p className="pp-body">{item.body}</p>
          </div>
        ))}
        <Merksatz>
          Eine Firma, die nur auf der eigenen Website existiert, ist eine Behauptung.
        </Merksatz>
      </div>
      <PageNum n="12" />
      <PageFooter />
    </section>
  );
}

function Page13() {
  return (
    <section className="pp-page">
      <div className="pp-content">
        <Label>EBENE 05 · DIAGNOSE</Label>
        <h2 className="pp-headline">Ebene 5: Diagnose</h2>
        <p className="pp-body">
          Die fünfte Ebene ist eigentlich die erste. Sie steht am Ende des Modells, weil sie alle
          anderen voraussetzt, aber in der Praxis beginnt jede vernünftige Arbeit mit ihr.
        </p>
        <p className="pp-body">
          Bevor irgendetwas produziert wird, müssen vier Fragen beantwortet sein:
        </p>
        {[
          { q: "1. Wo bricht Sichtbarkeit technisch?", a: "Seiten, die Systeme nicht sauber lesen können? Zu langsam, fehlende strukturierte Auszeichnung, doppelte Inhalte?" },
          { q: "2. Wo bricht sie thematisch?", a: "Welche der Fragen, die Kunden tatsächlich stellen, haben keine Antwortseite?" },
          { q: "3. Wo bricht sie im Quellenraum?", a: "In welchen Listen kommen Wettbewerber vor, und die eigene Firma nicht?" },
          { q: "4. Wo bricht sie in der Positionierung?", a: "Oft liegt die Wurzel nicht in der Technik, sondern auf Ebene eins, und kein Content repariert eine unklare Identität." },
        ].map((item) => (
          <div key={item.q} className="pp-factor">
            <p className="pp-factor-label">{item.q}</p>
            <p className="pp-body">{item.a}</p>
          </div>
        ))}
        <Merksatz>
          Wer ohne Diagnose produziert, arbeitet fleißig am falschen Problem.
        </Merksatz>
      </div>
      <PageNum n="13" />
      <PageFooter />
    </section>
  );
}

function Page14() {
  return (
    <section className="pp-page pp-page--soft">
      <div className="pp-content">
        <Label>FALLBEISPIEL · TEIL 1/3</Label>
        <h2 className="pp-headline">Fallbeispiel: Firma A, die Ausgangslage</h2>
        <p className="pp-body">
          Wie das in der Praxis aussieht, zeigt ein Beispiel. Firma A ist fiktiv, aber aus typischen
          Mustern realer mittelständischer Anbieter zusammengesetzt.
        </p>
        <p className="pp-body">
          Firma A organisiert seit über zwanzig Jahren Klassenfahrten und Bildungsreisen für Schulen.
          ein erklärungsbedürftiges B2B-Geschäft mit langen Entscheidungswegen, vielen Beteiligten
          und hohem Absicherungsbedürfnis. Die Firma ist gut: erfahrene Mitarbeiter, eingespielte
          Abläufe, treue Stammkunden, kaum Reklamationen.
        </p>
        <p className="pp-body">
          Die Website existiert seit Jahren und ist gepflegt. Google hat alle Seiten im Index. Es gibt
          soliden Suchtraffic, vor allem von Menschen, die den Firmennamen bereits kennen. Auf Stufe
          eins und zwei des Sichtbarkeitsmodells steht Firma A stabil.
        </p>
        <p className="pp-body">
          Dann hört auf einer Messe ein Mitarbeiter, wie eine Lehrerin erzählt, sie habe eine KI
          gefragt: „Welche Anbieter für Klassenfahrten nach England sind empfehlenswert?” Zurück im
          Büro stellt das Team dieselbe Frage. Das Ergebnis: Die Antwortsysteme nennen zwei große
          Wettbewerber, ein Reisemagazin, zwei Vergleichsportale. Firma A kommt nicht vor. Nicht
          einmal falsch, gar nicht.
        </p>
        <p className="pp-body">
          Zwanzig Jahre Erfahrung, null zitierbare Flächen.
        </p>
        <p className="pp-body pp-footnote">
          Firma A ist ein fiktives, aus typischen Mustern zusammengesetztes Beispiel.
        </p>
        <Merksatz>
          Zwanzig Jahre Erfahrung, null zitierbare Flächen: das ist der Normalfall, nicht die Ausnahme.
        </Merksatz>
      </div>
      <PageNum n="14" />
      <PageFooter />
    </section>
  );
}

function Page15() {
  return (
    <section className="pp-page">
      <div className="pp-content">
        <Label>FALLBEISPIEL · TEIL 2/3</Label>
        <h2 className="pp-headline">Fallbeispiel: Die Strategie</h2>
        <p className="pp-body">
          Firma A beschließt, nicht „mehr Marketing zu machen”, sondern entlang der fünf Ebenen zu
          arbeiten. Über mehrere Monate, in dieser Reihenfolge:
        </p>
        {[
          { label: "IDENTITÄT SCHÄRFEN", body: "Die Firma legt fest, wofür sie abrufbar sein will: drei Schwerpunktziele, für weiterführende Schulen, mit Spezialisierung auf organisatorische Entlastung der Lehrkräfte." },
          { label: "STRUKTUR UMBAUEN", body: "Aus der Broschüre wird eine Architektur: eigene Seiten pro Zielregion, pro Schulform, pro Kernproblem, dazu eine ehrliche Kostenseite und ein FAQ-Bereich." },
          { label: "EVIDENZ AUFBAUEN", body: "Ein ausführlicher Planungs-Guide. Eine neutrale Vergleichsseite. Eine dokumentierte Fallstudie. Eine Kostenseite mit realistischen Spannen. Ein FAQ aus echten Fragen." },
          { label: "QUELLEN ENTWICKELN", body: "Aufnahme in zwei Branchenverzeichnisse. Ein Fachbeitrag über Aufsichtspflicht. Aktualisierung alter Partnerseiten. Pflege der Bewertungsprofile." },
          { label: "COMMUNITIES RICHTIG NUTZEN", body: "Foren und Reddit als Marktforschung: Welche Fragen kehren wieder? Firma A beteiligt sich offen als Anbieter, mit echter Hilfe statt Links. Keine Fake-Accounts, kein verdecktes Seeding." },
        ].map((item) => (
          <div key={item.label} className="pp-factor">
            <p className="pp-factor-label">{item.label}</p>
            <p className="pp-body">{item.body}</p>
          </div>
        ))}
        <Merksatz>
          Reddit und Foren sind keine Werbeflächen. Sie sind Frühwarnsysteme für echte Fragen.
        </Merksatz>
      </div>
      <PageNum n="15" />
      <PageFooter />
    </section>
  );
}

function Page16() {
  return (
    <section className="pp-page pp-page--soft">
      <div className="pp-content">
        <Label>FALLBEISPIEL · TEIL 3/3</Label>
        <h2 className="pp-headline">Fallbeispiel: Was sich verändert</h2>
        <p className="pp-body">
          Was hat Firma A nach diesen Monaten? Keine Garantie, in jeder KI-Antwort aufzutauchen.
          Was sich verändert hat, ist die Ausgangslage:
        </p>
        {[
          { label: "DIE FIRMA IST ERKLÄRBAR GEWORDEN", body: "Wer heute fragt, was Firma A macht und für wen, bekommt eine präzise Antwort: von der Website, von Mitarbeitern, und zunehmend von Systemen." },
          { label: "DIE WEBSITE BEANTWORTET ECHTE FRAGEN", body: "Kosten, Ablauf, Pflichten, Vergleichskriterien: die Fragen, die vorher in Erstgesprächen dreißig Minuten kosteten, haben jetzt Seiten." },
          { label: "EXTERNE QUELLEN BESTÄTIGEN DIE RELEVANZ", body: "Verzeichnisse, ein Fachbeitrag, gepflegte Bewertungen, dokumentierte Partnerschaften. Die Firma ist keine Selbstbehauptung mehr." },
          { label: "SYSTEME HABEN MATERIAL", body: "Wo vorher Marketingprosa stand, stehen jetzt Spannen, Abläufe, dokumentierte Fälle. Ob ein System daraus zitiert, entscheidet das System. Aber es kann es jetzt." },
        ].map((item) => (
          <div key={item.label} className="pp-factor">
            <p className="pp-factor-label">{item.label}</p>
            <p className="pp-body">{item.body}</p>
          </div>
        ))}
        <p className="pp-body">
          Der eigentliche Wandel ist ein Denkwandel: von „Wir haben eine Website” zu „Wir haben
          einen Beweisraum aufgebaut.”
        </p>
        <p className="pp-body pp-footnote">
          Bewusst fiktive Beispielwerte zur Illustration: Aus zwei beantworteten Kundenkernfragen
          wurden vierzehn. Aus null externen Fachkontexten wurden fünf.
        </p>
        <Merksatz>
          Von „Website vorhanden” zu „Beweisraum aufgebaut”: das ist der eigentliche Wandel.
        </Merksatz>
      </div>
      <PageNum n="16" />
      <PageFooter />
    </section>
  );
}

function Page17() {
  return (
    <section className="pp-page pp-page--dark">
      <div className="pp-content">
        <h2 className="pp-headline pp-headline--dark">Checkliste: Ist deine Firma abrufbar?</h2>
        <p className="pp-body pp-body--dark">
          Vierzehn Fragen. Ehrlich beantwortet, ergeben sie ein klares Bild. Jedes „Nein” ist kein
          Versagen, sondern eine gefundene Baustelle.
        </p>

        {[
          {
            label: "IDENTITÄT", items: [
              "Kann ein Außenstehender nach fünf Minuten auf eurer Website präzise sagen, was ihr anbietet und für wen?",
              "Habt ihr schriftlich festgelegt, für welche zwei bis drei Themen euer Name fallen soll?",
              "Lässt sich euer „Warum wir” in zwei konkreten Sätzen sagen, ohne die Worte „innovativ”, „Qualität” und „Partner”?",
            ]
          },
          {
            label: "STRUKTUR", items: [
              "Hat jede der zehn wichtigsten Kundenfragen eine eigene, auffindbare Seite mit echter Antwort?",
              "Gibt es Seiten für eure wichtigsten Zielgruppen oder Branchen, nicht nur für eure Leistungen?",
              "Führen interne Links logisch von Problemen zu Lösungen zu Belegen?",
            ]
          },
          {
            label: "EVIDENZ", items: [
              "Beantwortet eure Website die Kostenfrage, mit Spannen, Faktoren oder Beispielen?",
              "Gibt es mindestens eine dokumentierte, nachvollziehbare Fallstudie?",
              "Existiert ein ehrlicher Vergleich von Optionen, Ansätzen oder Anbietertypen?",
              "Stammen eure FAQ aus echten Kundenfragen oder aus einem Meetingraum?",
            ]
          },
          {
            label: "QUELLEN", items: [
              "Steht eure Firma in den relevanten Branchenverzeichnissen und Übersichten eures Feldes?",
              "Gibt es in den letzten zwei Jahren mindestens eine substanzielle externe Erwähnung?",
              "Sind eure Bewertungsprofile gepflegt und aussagekräftig?",
            ]
          },
          {
            label: "DIAGNOSE", items: [
              "Habt ihr in den letzten drei Monaten KI-Systemen die wichtigsten generischen Fragen eures Marktes gestellt und protokolliert, wer genannt wird?",
            ]
          },
        ].map((group) => (
          <div key={group.label} className="pp-check-group">
            <p className="pp-check-group-label">{group.label}</p>
            {group.items.map((item, i) => (
              <div key={i} className="pp-check-item">
                <span className="pp-check-box" />
                <p className="pp-body pp-body--dark pp-check-text">{item}</p>
              </div>
            ))}
          </div>
        ))}

        <Merksatz dark>
          Jedes „Nein” ist keine Niederlage. Es ist eine gefundene Baustelle.
        </Merksatz>
      </div>
      <PageNum n="17" dark />
      <PageFooter dark />
    </section>
  );
}

function Page18() {
  return (
    <section className="pp-page">
      <div className="pp-content">
        <h2 className="pp-headline">Was du ab morgen tun kannst</h2>
        <p className="pp-body">
          Zehn Schritte, geordnet nach Aufwand. Die ersten fünf kosten nur Zeit und Ehrlichkeit.
        </p>

        {[
          { n: "01", text: "Stelle die Fragen selbst. Frage drei bis vier KI-Systeme die zehn wichtigsten generischen Fragen deines Marktes. Protokolliere, wer genannt wird. Das ist deine Nulllinie." },
          { n: "02", text: "Analysiere, wer stattdessen genannt wird. Wettbewerber? Magazine? Verzeichnisse? Diese Liste zeigt dir, welche Quellentypen in deinem Feld Antworten speisen." },
          { n: "03", text: "Mache den Außenstehenden-Test. Lass jemanden außerhalb der Firma erklären, was ihr macht und für wen. Notiere wörtlich, was hängen bleibt." },
          { n: "04", text: "Sammle die echten Kundenfragen. Eine Woche lang: Jede Frage aus Vertrieb, Support und Erstgesprächen wird notiert. Am Ende hast du den ehrlichsten Redaktionsplan." },
          { n: "05", text: "Lies die Diskussionen deines Marktes. Foren, Reddit, Fachgruppen. Nicht um zu posten, sondern um zu verstehen." },
          { n: "06", text: "Schreibe die Identität auf. Was bieten wir an, für wen, wofür wollen wir genannt werden, warum wir, in zwei Sätzen. Ohne dieses Dokument ist alles Weitere Stückwerk." },
          { n: "07", text: "Baue die erste Beweisfläche. Eine einzige Seite, die die häufigste Kundenfrage vollständig beantwortet, oft ist es die Kostenfrage." },
          { n: "08", text: "Repariere die naheliegendste Quelle. Das fehlende Verzeichnis, die veraltete Partnerseite, das ungepflegte Bewertungsprofil. Eine Sache, diese Woche." },
          { n: "09", text: "Dokumentiere einen echten Fall. Ein Projekt, ehrlich aufgeschrieben: Ausgangslage, Vorgehen, Hindernisse, Ergebnis." },
          { n: "10", text: "Wiederhole Schritt 1 in drei Monaten. Gleiche Fragen, gleiches Protokoll. Erst die zweite Messung macht aus einem Foto eine Richtung." },
        ].map((step) => (
          <div key={step.n} className="pp-step">
            <span className="pp-step-n">{step.n}</span>
            <p className="pp-body pp-step-text">{step.text}</p>
          </div>
        ))}

        <Merksatz>
          Die ersten fünf Schritte kosten kein Geld. Nur Ehrlichkeit.
        </Merksatz>
      </div>
      <PageNum n="18" />
      <PageFooter />
    </section>
  );
}

function Page19() {
  const terms = [
    { term: "AI Search / KI-Suche", def: "Suchsysteme, die nicht Links auflisten, sondern Antworten formulieren, auf Basis vieler Quellen." },
    { term: "GEO (Generative Engine Optimization)", def: "Der Sammelbegriff für alles, was die Chance erhöht, in KI-generierten Antworten vorzukommen. Das Gegenstück zu SEO." },
    { term: "AIO (AI Overviews / AI Optimization)", def: "Die KI-Antwortboxen über klassischen Suchergebnissen, oder die Arbeit, in ihnen vorzukommen. Die Begriffe GEO und AIO werden oft synonym verwendet." },
    { term: "Query Fan-out", def: "Wenn ein KI-System aus einer Nutzerfrage intern mehrere Teilfragen macht und für jede einzeln Quellen sucht." },
    { term: "Citation Surface / Zitierfläche", def: "Jeder Inhalt, der konkret genug ist, um als Beleg in einer Antwort zu dienen: eine Kostenspanne, eine dokumentierte Fallstudie, ein präziser Vergleich." },
    { term: "Entity / Entität", def: "Ein eindeutig identifizierbares „Ding” für Maschinen: eine Firma, ein Ort, ein Produkt." },
    { term: "Retrieval / Abruf", def: "Der Vorgang, mit dem ein System passende Inhalte aus seinen Quellen holt, bevor es eine Antwort formuliert." },
    { term: "Source Surface / Quellenraum", def: "Die Gesamtheit aller Orte, an denen eine Firma außerhalb der eigenen Website vorkommt." },
    { term: "Listicle", def: "Ein Übersichtsartikel in Listenform. Redaktionell gemacht, sind solche Listen legitime Vergleichsstrukturen. Als verdeckte Eigenwerbung getarnt, sind sie das Gegenteil." },
    { term: "Diagnose", def: "Die systematische Prüfung, wo Sichtbarkeit bricht (technisch, thematisch, im Quellenraum, in der Positionierung), bevor produziert wird." },
  ];

  return (
    <section className="pp-page pp-page--soft">
      <div className="pp-content">
        <h2 className="pp-headline">Begriffe, einfach erklärt</h2>
        <div className="pp-glossary">
          {terms.map((t) => (
            <div key={t.term} className="pp-glossary-item">
              <p className="pp-glossary-term">{t.term}</p>
              <p className="pp-body">{t.def}</p>
            </div>
          ))}
        </div>
        <Merksatz>
          Wer die Begriffe versteht, kann mitreden. Wer das Prinzip versteht, kann handeln.
        </Merksatz>
      </div>
      <PageNum n="19" />
      <PageFooter />
    </section>
  );
}

function Page20() {
  return (
    <section className="pp-page pp-page--dark">
      <div className="pp-content">
        <h2 className="pp-headline pp-headline--dark">Schlussgedanke</h2>
        <p className="pp-body pp-body--dark">
          Jede Verschiebung in der Geschichte der Sichtbarkeit hat dieselbe Frage neu gestellt:
          Wie wird aus Qualität Wahrnehmung?
        </p>
        <p className="pp-body pp-body--dark">
          Die Antwort der alten Suche war: durch Position. Die Antwort der neuen Suche ist
          unbequemer und zugleich gerechter: durch Lesbarkeit. Durch die Fähigkeit, so klar zu
          sein, dass Menschen und Maschinen verstehen, wer man ist, was man kann und wann man die
          richtige Wahl ist.
        </p>
        <p className="pp-body pp-body--dark">
          Das ist keine Aufgabe für Tricks. Die Firmen, die in dieser neuen Schicht vorkommen
          werden, sind nicht die lautesten. Es sind die, die ihre eigene Substanz in eine abrufbare
          Form bringen: klare Identität, saubere Struktur, echte Belege, glaubwürdige Quellen,
          nüchterne Diagnose.
        </p>
        <p className="pp-body pp-body--dark pp-closing">
          Wer in Zukunft sichtbar sein will, muss nicht lauter werden.
          Er muss verständlicher, belegbarer und abrufbarer werden.
        </p>
        <p className="pp-body pp-body--dark">
          Der beste Zeitpunkt, damit anzufangen, war vor zwei Jahren. Der zweitbeste ist der Moment,
          in dem man zum ersten Mal eine KI nach dem eigenen Markt fragt, und der eigene Name
          nicht fällt.
        </p>

        <Merksatz dark>
          Nicht lauter. Verständlicher, belegbarer, abrufbarer.
        </Merksatz>

        <div className="pp-publisher">
          <div className="pp-publisher-rule" />
          <p className="pp-publisher-line">SEESZN</p>
          <p className="pp-publisher-line">Sichtbarkeitssysteme für Marken, die gefunden und verstanden werden wollen.</p>
          <p className="pp-publisher-line">BREMEN · BANGKOK · 2026</p>
        </div>
      </div>
      <PageNum n="20" dark />
      <PageFooter dark />
    </section>
  );
}

// ── Main print page ───────────────────────────────────────────────────────────

export default function PrintPage() {
  return (
    <>
      <div className="pp-root">
        <Page01Cover />
        <Page02 />
        <Page03 />
        <Page04 />
        <Page05 />
        <Page06 />
        <Page07 />
        <Page08 />
        <Page09 />
        <Page10 />
        <Page11 />
        <Page12 />
        <Page13 />
        <Page14 />
        <Page15 />
        <Page16 />
        <Page17 />
        <Page18 />
        <Page19 />
        <Page20 />
      </div>

      <div className="pp-instructions">
        <p>
          <strong>PDF exportieren:</strong> Drucke diese Seite (Strg/Cmd + P) und wähle
          „Als PDF speichern”. Seitengröße: A4. Ränder: Keine. Hintergrundgrafiken aktivieren.
        </p>
        <p>
          Oder öffne die Browser-Entwicklertools → „Mehr Tools” → „Rendern” → „Als PDF drucken”.
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #f0ece3;
          font-family: "Inter", "Helvetica Neue", sans-serif;
        }

        @media print {
          body { background: white; }
          .pp-instructions { display: none !important; }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }

        /* ── Instructions (screen only) ───────────────── */
        .pp-instructions {
          max-width: 640px;
          margin: 40px auto;
          padding: 24px 32px;
          background: #1f1e1a;
          color: #eee6d6;
          font-family: "Inter", sans-serif;
          font-size: 13px;
          line-height: 1.7;
        }
        .pp-instructions p { margin-bottom: 10px; }
        .pp-instructions p:last-child { margin-bottom: 0; }

        /* ── Page wrapper ─────────────────────────────── */
        .pp-root {
          width: 210mm;
          margin: 0 auto;
        }

        /* ── Individual page ──────────────────────────── */
        .pp-page {
          width: 210mm;
          min-height: 297mm;
          background: #ebe5d8;
          position: relative;
          padding: 32mm 26mm 28mm;
          page-break-after: always;
          break-after: page;
          display: flex;
          flex-direction: column;
        }
        .pp-page--soft { background: #f2eee5; }
        .pp-page--dark {
          background: #0f100d;
        }
        .pp-page:last-child {
          page-break-after: avoid;
          break-after: avoid;
        }

        /* ── Content ──────────────────────────────────── */
        .pp-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-width: 138mm;
        }

        /* ── Cover ────────────────────────────────────── */
        .pp-cover-inner {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          max-width: 138mm;
        }
        .pp-cover-edition {
          font-family: "IBM Plex Mono", monospace;
          font-size: 7pt;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #81796a;
          margin-bottom: 14pt;
        }
        .pp-cover-title {
          font-family: "Source Serif 4", serif;
          font-weight: 500;
          font-size: 28pt;
          line-height: 1.18;
          letter-spacing: -0.01em;
          color: #1f1e1a;
          margin: 0 0 18pt;
          max-width: 16ch;
        }
        .pp-cover-subtitle {
          font-family: "Source Serif 4", serif;
          font-style: normal;
          font-size: 12pt;
          line-height: 1.55;
          color: #4a463d;
          max-width: 46ch;
        }
        .pp-cover-publisher {
          font-family: "IBM Plex Mono", monospace;
          font-size: 7pt;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #81796a;
        }

        /* ── Rule ─────────────────────────────────────── */
        .pp-rule {
          height: 1px;
          background: #c9c0ae;
          margin: 14pt 0;
        }

        /* ── Label ────────────────────────────────────── */
        .pp-label {
          font-family: "IBM Plex Mono", monospace;
          font-size: 6.5pt;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 12pt;
        }

        /* ── Headline ─────────────────────────────────── */
        .pp-headline {
          font-family: "Source Serif 4", serif;
          font-weight: 500;
          font-size: 20pt;
          line-height: 1.22;
          letter-spacing: -0.01em;
          color: #1f1e1a;
          margin: 0 0 16pt;
        }
        .pp-headline--dark { color: #eee6d6; }

        /* ── Body text ────────────────────────────────── */
        .pp-body {
          font-family: "Inter", sans-serif;
          font-size: 9.5pt;
          line-height: 1.68;
          color: #4a463d;
          margin-bottom: 10pt;
          max-width: 63ch;
        }
        .pp-body--dark { color: #d8cfbd; }
        .pp-footnote {
          font-size: 8pt;
          color: #81796a;
          font-style: normal;
        }
        .pp-closing {
          font-family: "Source Serif 4", serif;
          font-style: normal;
          font-size: 11pt;
          line-height: 1.6;
          color: #eee6d6;
        }

        /* ── Strong ───────────────────────────────────── */
        .pp-strong--dark {
          color: #eee6d6;
          font-weight: 600;
        }

        /* ── Merksatz ─────────────────────────────────── */
        .pp-merksatz {
          font-family: "Source Serif 4", serif;
          font-style: normal;
          font-size: 12pt;
          line-height: 1.55;
          padding-top: 14pt;
          border-top: 1px solid;
          margin-top: auto;
          padding-bottom: 2pt;
        }

        /* ── Page number ──────────────────────────────── */
        .pp-pagenum {
          position: absolute;
          bottom: 22mm;
          right: 26mm;
          font-family: "Source Serif 4", serif;
          font-size: 72pt;
          font-weight: 400;
          line-height: 1;
          opacity: 0.18;
        }

        /* ── Page footer ──────────────────────────────── */
        .pp-footer {
          position: absolute;
          bottom: 12mm;
          left: 26mm;
          right: 26mm;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 6pt;
          border-top: 1px solid;
          font-family: "IBM Plex Mono", monospace;
          font-size: 6pt;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        /* ── Factor blocks ────────────────────────────── */
        .pp-factor {
          margin-bottom: 12pt;
          padding-bottom: 12pt;
          border-bottom: 1px solid #c9c0ae;
        }
        .pp-factor:last-of-type { border-bottom: none; }
        .pp-factor-label {
          font-family: "IBM Plex Mono", monospace;
          font-size: 6.5pt;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #81796a;
          margin-bottom: 5pt;
        }

        /* ── Staircase ────────────────────────────────── */
        .pp-staircase {
          margin: 16pt 0;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .pp-stair {
          padding: 8pt 0;
          border-bottom: 1px solid #c9c0ae;
        }
        .pp-stair:first-child { border-top: 1px solid #c9c0ae; }
        .pp-stair-header {
          display: flex;
          align-items: baseline;
          gap: 10pt;
          margin-bottom: 4pt;
        }
        .pp-stair-n {
          font-family: "IBM Plex Mono", monospace;
          font-size: 7pt;
          color: #81796a;
          width: 16pt;
          flex-shrink: 0;
        }
        .pp-stair-label {
          font-family: "IBM Plex Mono", monospace;
          font-size: 7pt;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #1f1e1a;
          font-weight: 500;
        }
        .pp-stair-mark {
          font-family: "Inter", sans-serif;
          font-size: 7pt;
          color: #8d8372;
          font-style: normal;
          margin-left: auto;
        }
        .pp-stair-desc {
          font-family: "Inter", sans-serif;
          font-size: 8.5pt;
          line-height: 1.55;
          color: #4a463d;
          padding-left: 26pt;
          margin: 0;
        }

        /* ── Layers ───────────────────────────────────── */
        .pp-layers {
          margin: 16pt 0;
          display: flex;
          flex-direction: column;
          gap: 8pt;
        }
        .pp-layer {
          padding: 8pt 0;
        }
        .pp-layer-header {
          display: flex;
          align-items: baseline;
          gap: 10pt;
          margin-bottom: 4pt;
        }
        .pp-layer-n {
          font-family: "IBM Plex Mono", monospace;
          font-size: 7pt;
          color: #8f897b;
          width: 16pt;
          flex-shrink: 0;
        }
        .pp-layer-label {
          font-family: "IBM Plex Mono", monospace;
          font-size: 7pt;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #eee6d6;
          font-weight: 500;
        }
        .pp-layer-desc {
          font-family: "Inter", sans-serif;
          font-size: 8.5pt;
          line-height: 1.55;
          color: #d8cfbd;
          padding-left: 26pt;
          margin-bottom: 6pt;
        }
        .pp-layer-bar {
          height: 1px;
          background: #343226;
          margin-left: 0;
        }

        /* ── Checklist ────────────────────────────────── */
        .pp-check-group {
          margin-bottom: 12pt;
        }
        .pp-check-group-label {
          font-family: "IBM Plex Mono", monospace;
          font-size: 6.5pt;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8f897b;
          margin-bottom: 8pt;
          padding-bottom: 4pt;
          border-bottom: 1px solid #343226;
        }
        .pp-check-item {
          display: flex;
          gap: 8pt;
          align-items: flex-start;
          margin-bottom: 6pt;
        }
        .pp-check-box {
          width: 7pt;
          height: 7pt;
          border: 1px solid #5a5544;
          flex-shrink: 0;
          margin-top: 1pt;
          display: block;
        }
        .pp-check-text {
          margin-bottom: 0;
          font-size: 8.5pt;
        }

        /* ── Steps ────────────────────────────────────── */
        .pp-step {
          display: flex;
          gap: 16pt;
          align-items: flex-start;
          padding: 8pt 0;
          border-bottom: 1px solid #c9c0ae;
        }
        .pp-step:first-of-type { border-top: 1px solid #c9c0ae; }
        .pp-step-n {
          font-family: "Source Serif 4", serif;
          font-size: 22pt;
          color: #c9c0ae;
          line-height: 1.1;
          flex-shrink: 0;
          width: 30pt;
          text-align: right;
        }
        .pp-step-text {
          margin-bottom: 0;
          padding-top: 2pt;
        }

        /* ── Glossary ─────────────────────────────────── */
        .pp-glossary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12pt 20pt;
          margin: 12pt 0;
        }
        .pp-glossary-item {}
        .pp-glossary-term {
          font-family: "IBM Plex Mono", monospace;
          font-size: 6.5pt;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #4a463d;
          margin-bottom: 4pt;
        }
        .pp-glossary .pp-body {
          font-size: 8pt;
          margin-bottom: 0;
        }

        /* ── Publisher ────────────────────────────────── */
        .pp-publisher {
          margin-top: auto;
          padding-top: 20pt;
        }
        .pp-publisher-rule {
          height: 1px;
          background: #343226;
          margin-bottom: 10pt;
        }
        .pp-publisher-line {
          font-family: "IBM Plex Mono", monospace;
          font-size: 7pt;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #8f897b;
          margin-bottom: 4pt;
          line-height: 1.5;
        }

        /* ── Screen preview ───────────────────────────── */
        @media screen {
          .pp-page {
            box-shadow: 0 2px 24px rgba(0,0,0,0.12);
            margin: 0 auto 20px;
          }
        }
      `}</style>
    </>
  );
}
