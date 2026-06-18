import { Resend } from "resend";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const { email, url, suspect, name, market } = (body ?? {}) as {
    email?: unknown;
    url?: unknown;
    suspect?: unknown;
    name?: unknown;
    market?: unknown;
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

  const lines = [`New visibility diagnosis request from: ${email}`];
  if (str(name, 120)) lines.push(`Name: ${str(name, 120)}`);
  if (str(url, 200)) lines.push(`Brand / website: ${str(url, 200)}`);
  if (str(market, 120)) lines.push(`Market / language: ${str(market, 120)}`);
  if (str(suspect, 100)) lines.push(`Main concern: ${str(suspect, 100)}`);

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
