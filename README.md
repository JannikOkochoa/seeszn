This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Sichtbarkeitsprüfung — environment

Copy `.env.example` to `.env.local` and fill in:

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend key for email delivery. |
| `SEESZN_LEAD_EMAIL` | Internal lead recipient, e.g. `hello@seeszn.com`. |
| `SEESZN_FROM_EMAIL` | From header for the user email, e.g. `Tobias von SEESZN <diagnosis@seeszn.com>`. |
| `SEESZN_REPLY_TO_EMAIL` | Reply-to for the user email, e.g. `tobias@seeszn.com`. |
| `AI_ANSWER_PROVIDER` | `none` (default) or `google_cse`. |
| `GOOGLE_CSE_API_KEY` / `GOOGLE_CSE_CX` | Google Custom Search credentials (only used when provider is `google_cse`). |

- `AI_ANSWER_PROVIDER=none` generates the 3 KI-Antwortfragen without live web checks.
- `AI_ANSWER_PROVIDER=google_cse` runs exactly 3 Google Custom Search checks per scan, one per question.
- This is a **Web-Signalcheck** of the visible web surface, not a live ChatGPT, Gemini, Perplexity or Google AI Overview ranking.

The free scan runs without any of these. Email delivery requires Resend; the
company-email requirement and the 3-query cap are enforced server-side.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
