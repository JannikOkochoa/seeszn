import { Resend } from "resend";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const { email, url, suspect, name, market, note, scanSummary, finding, freemail } =
    (body ?? {}) as {
      email?: unknown;
      url?: unknown;
      suspect?: unknown;
      name?: unknown;
      market?: unknown;
      // Newer Sichtbarkeitsprüfung fields. Optional, so old senders stay valid.
      note?: unknown;
      scanSummary?: unknown;
      finding?: unknown;
      freemail?: unknown;
    };

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Not configured" }, { status: 503 });
  }

  const str = (v: unknown, max: number) =>
    typeof v === "string" && v.trim() ? v.trim().slice(0, max) : "";

  const locale = str(market, 8) === "en" ? "en" : "de";
  const domain = str(url, 200);
  const findingLine = str(finding, 400);
  const isFreemail = freemail === true;

  const lines = [`New visibility diagnosis request from: ${email}`];
  if (str(name, 120)) lines.push(`Name: ${str(name, 120)}`);
  if (domain) lines.push(`Brand / website: ${domain}`);
  if (str(market, 120)) lines.push(`Market / language: ${str(market, 120)}`);
  lines.push(`Freemail address: ${isFreemail ? "yes" : "no"}`);
  if (str(suspect, 100)) lines.push(`Main concern: ${str(suspect, 100)}`);
  if (str(note, 600)) lines.push(`Note: ${str(note, 600)}`);
  // Attach the free-check reading so the reply can start from real findings.
  if (str(scanSummary, 2000)) lines.push("", "── Sichtbarkeitsprüfung ──", str(scanSummary, 2000));

  const resend = new Resend(apiKey);

  // 1) Internal lead — this one must succeed for the request to count.
  const { error } = await resend.emails.send({
    from: "SEESZN <hello@seeszn.com>",
    to: ["hello@seeszn.com"],
    subject: `Diagnosis request from ${email}`,
    text: lines.join("\n"),
  });

  if (error) {
    return Response.json({ error: "Send failed" }, { status: 500 });
  }

  // 2) Confirmation to the user — best effort. A failure here (e.g. sandbox
  //    sending limits) must not fail the lead, so we never await its result
  //    into the response path beyond a guarded try/catch. Honest content only:
  //    we confirm the analysis is on its way and restate the first finding.
  try {
    await resend.emails.send({
      from: "SEESZN <hello@seeszn.com>",
      to: [email],
      replyTo: "hello@seeszn.com",
      subject: confirmationSubject(locale, domain),
      text: confirmationBody(locale, { domain, finding: findingLine }),
    });
  } catch {
    // Outbound confirmation unavailable — the lead is still recorded.
  }

  return Response.json({ ok: true });
}

function confirmationSubject(locale: "de" | "en", domain: string): string {
  if (locale === "en") {
    return domain ? `Your visibility analysis for ${domain}` : "Your visibility analysis";
  }
  return domain ? `Deine Sichtbarkeitsprüfung für ${domain}` : "Deine Sichtbarkeitsprüfung";
}

function confirmationBody(
  locale: "de" | "en",
  { domain, finding }: { domain: string; finding: string },
): string {
  if (locale === "en") {
    const parts = [
      "Thanks for running the visibility check.",
      domain ? `We have your first reading for ${domain}.` : "We have your first reading.",
    ];
    if (finding) parts.push("", `First reading: ${finding}`);
    parts.push(
      "",
      "We review the results manually and get back to you with the prioritized next steps and the most useful first move.",
      "",
      "SEESZN",
      "hello@seeszn.com",
    );
    return parts.join("\n");
  }
  const parts = [
    "Danke für die Sichtbarkeitsprüfung.",
    domain ? `Deine erste Einordnung für ${domain} liegt vor.` : "Deine erste Einordnung liegt vor.",
  ];
  if (finding) parts.push("", `Erste Einordnung: ${finding}`);
  parts.push(
    "",
    "Wir prüfen die Ergebnisse zusätzlich manuell und melden uns mit den priorisierten nächsten Schritten und dem sinnvollsten ersten Schritt.",
    "",
    "SEESZN",
    "hello@seeszn.com",
  );
  return parts.join("\n");
}
