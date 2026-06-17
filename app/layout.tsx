import type { Metadata } from "next";
import { Barlow_Condensed, Playfair_Display, IBM_Plex_Mono, Inter } from "next/font/google";
import { TranslationProvider } from "@/lib/i18n/context";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, organizationSchema, websiteSchema } from "@/lib/seo";
import "./globals.css";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

// Sets data-theme before first paint — prevents flash of wrong theme
const themeScript = `(function(){try{var t=localStorage.getItem('seeszn-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KI-Sichtbarkeit & SEO für B2B-Marken | SEESZN",
    template: "%s",
  },
  description:
    "SEESZN macht B2B-Marken sichtbar in Google, ChatGPT, Perplexity, Gemini und AI Overviews. SEO, GEO, AIO, Content-Architektur und KI-Sichtbarkeits-Audits.",
  applicationName: SITE_NAME,
  alternates: {
    canonical: SITE_URL,
    languages: {
      "de-DE": SITE_URL,
      "x-default": SITE_URL,
      en: `${SITE_URL}/en`,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "KI-Sichtbarkeit & SEO für B2B-Marken | SEESZN",
    description:
      "SEESZN macht B2B-Marken sichtbar in Google, ChatGPT, Perplexity, Gemini und AI Overviews.",
    siteName: SITE_NAME,
    locale: "de_DE",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KI-Sichtbarkeit & SEO für B2B-Marken | SEESZN",
    description:
      "SEESZN macht B2B-Marken sichtbar in Google, ChatGPT, Perplexity, Gemini und AI Overviews.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="de"
      data-theme="light"
      suppressHydrationWarning
      className={`${barlow.variable} ${playfair.variable} ${mono.variable} ${inter.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
      </head>
      <body>
        <TranslationProvider locale="de">{children}</TranslationProvider>
      </body>
    </html>
  );
}
