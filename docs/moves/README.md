# MOVES

Die kommerzielle Schicht: ausgewählte Umsetzung, direkt beauftragt, ohne Gespräch
davor. Sie ergänzt den bestehenden Kaufweg (First Move), sie ersetzt ihn nicht.

    First Move   Prüfung → Engpass → eine Umsetzung → Messung   (ein Preis)
    MOVES        Fläche wählen → Stufe wählen → kaufen → briefen (Katalog)

## Warum MOVES und nicht MARKET

Die Konzeption hieß MARKET. Der Name ist bewusst nicht übernommen worden:

1. "Market" liest sich als Marktplatz. Ein Marktplatz für Platzierungen ist genau
   das Bild, das diese Fläche nicht erzeugen darf, weil die Positionierung des
   Hauses den anonymen Linkkauf ausdrücklich ablehnt.
2. Die Startseite ist vollständig um "First Move" gebaut: eine abgegrenzte
   Umsetzung mit festem Preis. Ein Katalog abgegrenzter Umsetzungen heißt in
   diesem Vokabular MOVES und muss nicht erklärt werden.

`/market` und `/market/:slug` leiten per 301 auf `/moves`, damit ausgehende Mails
mit dem alten Pfad nicht ins Leere laufen.

## Routen

    /moves                  Übersicht, orientiert, verkauft nicht
    /moves/authority        Produktseite
    /moves/press            Produktseite
    /moves/mentions         Produktseite
    /moves/content          Produktseite
    /moves/briefing         Rückkehr aus Stripe, noindex

    POST /api/moves/checkout   legt Bestellung und Stripe-Sitzung an
    POST /api/moves/webhook    Stripe meldet den Abschluss
    POST /api/moves/brief      das Briefing nach der Zahlung

Nur deutscher Baum. Es gibt keine englische Fläche, aus demselben Grund, aus dem
es keine englische Produktseite gibt (siehe `lib/links.ts`). Die Navigation
blendet MOVES außerhalb von Deutsch aus.

## Wo was liegt

    lib/moves/catalog.ts    Preise, Umfang, Fristen, Qualifizierung, Grenzen
    lib/moves/copy.ts       Copy der Übersicht und des Startseitenbands
    lib/moves/proof.ts      Belege, abgeleitet aus bereits freigegebenen Zahlen
    lib/moves/stripe.ts     Stripe über REST, ohne zusätzliche Abhängigkeit
    lib/moves/orders.ts     Persistenz, wirft nie
    lib/moves/schema.ts     Structured Data, Service mit Offer, keine Bewertungen
    lib/moves/analytics.ts  Ereignisse, über dataLayer und gtag wie First Move

`catalog.ts` ist die einzige Stelle für kaufentscheidende Werte. Ändert sich dort
ein Preis, ändert sich die Seite, das Schema, der Checkout und die Bestätigung.

## Offen vor dem Livegang

1. **Preise bestätigen.** Die Zahlen in `catalog.ts` sind Platzhalter in
   marktüblicher Größenordnung und nicht abgestimmt.
2. **Stripe verbinden.** `STRIPE_SECRET_KEY` und `STRIPE_WEBHOOK_SECRET` in
   hPanel setzen, Endpunkt `/api/moves/webhook` auf `checkout.session.completed`
   registrieren. Ohne Key bleibt die Fläche sichtbar und der Kauf-Button meldet
   den Anfrageweg.
3. **Umsatzsteuer klären.** Der Checkout erhebt Adresse und USt-IdNr., berechnet
   aber keine Steuer. Für Stripe Tax muss `automatic_tax` in
   `createCheckoutSession` aktiviert werden, und erst dann darf die Copy sagen,
   die Steuer werde im Checkout ausgewiesen.
4. **Vertragsgrundlage.** Unter dem Kauf steht das Impressum. Für einen Verkauf
   an Unternehmen in DACH gehört dorthin eine eigene Seite mit Leistungs- und
   Zahlungsbedingungen.
5. **Migration einspielen.** `supabase/migrations/20260916100000_moves_orders.sql`.
