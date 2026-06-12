interface BriefPayload {
  email: string;
  source: "ki-sichtbarkeits-brief-2026";
  page: "/brief/ki-sichtbarkeit";
  language: "de";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const { email } = (body ?? {}) as { email?: unknown };

  if (
    !email ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return Response.json(
      { error: "Bitte gib eine gültige E-Mail-Adresse ein." },
      { status: 400 }
    );
  }

  const payload: BriefPayload = {
    email: email.trim().toLowerCase(),
    source: "ki-sichtbarkeits-brief-2026",
    page: "/brief/ki-sichtbarkeit",
    language: "de",
  };

  const webhookUrl = process.env.BRIEF_REQUEST_WEBHOOK_URL;

  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.error(`[brief-request] Webhook returned ${res.status}`);
      }
    } catch (err) {
      console.error("[brief-request] Webhook error:", err);
      // Do not surface webhook errors to the user
    }
  } else if (process.env.NODE_ENV === "development") {
    console.log("[brief-request] Submission (dev, no webhook):", payload);
  } else {
    // TODO: Connect email delivery
    // Option A — Set BRIEF_REQUEST_WEBHOOK_URL to a Make or Zapier webhook
    //             that handles subscription + transactional PDF email.
    // Option B — Replace this block with a Brevo / MailerLite SDK call:
    //   await brevo.contacts.createContact({ email: payload.email, listIds: [YOUR_LIST_ID] });
    //   await brevo.transactional.sendTransacEmail({ ... }); // send PDF link
    // Option C — Use a Resend transactional email like the /api/contact route.
    console.log("[brief-request] Production submission (no webhook configured):", payload.email);
  }

  return Response.json({ ok: true });
}
