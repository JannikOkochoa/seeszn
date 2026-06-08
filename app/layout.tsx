import type { Metadata } from "next";
import { Barlow_Condensed, Playfair_Display, IBM_Plex_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "SEESZN — For brands that intend to be found.",
  description:
    "Visibility systems for brands entering machine memory. GEO, AIO and SEO for the German market.",
  openGraph: {
    title: "SEESZN — For brands that intend to be found.",
    description: "You are not in the answer. This is a diagnosis.",
    siteName: "SEESZN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${playfair.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
