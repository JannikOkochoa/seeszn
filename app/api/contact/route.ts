import { Resend } from "resend";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Not configured" }, { status: 503 });
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "SEESZN <hello@seeszn.com>",
    to: ["hello@seeszn.com"],
    subject: `Diagnosis request from ${email}`,
    text: `New diagnosis request submitted by: ${email}`,
  });

  if (error) {
    return Response.json({ error: "Send failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
