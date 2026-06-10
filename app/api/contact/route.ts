import { Resend } from "resend";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const { email, url, suspect } = (body ?? {}) as {
    email?: unknown;
    url?: unknown;
    suspect?: unknown;
  };

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Not configured" }, { status: 503 });
  }

  const lines = [`New diagnosis request submitted by: ${email}`];
  if (typeof url === "string" && url.trim()) {
    lines.push(`Surface (URL): ${url.trim().slice(0, 200)}`);
  }
  if (typeof suspect === "string" && suspect.trim()) {
    lines.push(`Suspected leak: ${suspect.trim().slice(0, 100)}`);
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "SEESZN <hello@seeszn.com>",
    to: ["hello@seeszn.com"],
    subject: `Diagnosis request from ${email}`,
    text: lines.join("\n"),
  });

  if (error) {
    return Response.json({ error: "Send failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
