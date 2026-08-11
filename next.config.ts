import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Der private Client Room wird nicht mehr über die öffentliche robots.txt
  // ausgeschlossen — das hätte den Kundennamen neben einer anonymisierten Case
  // Study genannt. Stattdessen trägt genau diese Route einen X-Robots-Tag,
  // zusätzlich zum robots-Meta der Seite selbst.
  //
  // Der Header ist rein additiv: er verändert weder Routing noch Auth, Session,
  // Cookies oder Redirects. Bestehende Zugänge bleiben unberührt.
  async headers() {
    return [
      {
        source: "/kluehspies-room",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      // Die interne Mockup Library und alle Detail-Mockups darunter. Gleiches
      // Prinzip wie beim Client Room: kein Eintrag in der öffentlichen
      // robots.txt (das würde den Kundennamen preisgeben), sondern ein
      // X-Robots-Tag auf genau diesen Routen, zusätzlich zum robots-Meta der
      // Seiten. Die Routen stehen ebenfalls nicht in app/sitemap.ts.
      {
        source: "/mockups/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        source: "/mockups",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // German moved from /de/* to the root. Permanently redirect the old
      // German URLs so existing links and indexed pages resolve cleanly.
      { source: "/de", destination: "/", permanent: true },
      { source: "/de/:path*", destination: "/:path*", permanent: true },

      // The legacy per-client case studies (/cases/rischo, /cases/sivius,
      // /cases/contentkueche) were retired when the Work architecture moved to
      // a single documented case. All three were live, indexed and listed in
      // the sitemap, so they carry link equity and branded rankings worth
      // preserving. The Work archive is the closest equivalent surface, so they
      // redirect there permanently rather than 410ing.
      //
      // They deliberately do NOT point at /work/tourismus: none of the three
      // clients is a tourism business, and sending a steel-fabrication or
      // real-estate query to the tourism case would be a topical mismatch.
      //
      // `statusCode: 301` rather than `permanent: true`: the latter emits 308,
      // which search engines treat identically but which reads as an anomaly in
      // rank trackers, log analysis and crawl reports. These URLs are GET-only
      // pages, so the method-preservation 308 buys us is irrelevant here.
      { source: "/cases/rischo", destination: "/work", statusCode: 301 },
      { source: "/cases/sivius", destination: "/work", statusCode: 301 },
      { source: "/cases/contentkueche", destination: "/work", statusCode: 301 },

      // Any other /cases/* URL that was never part of the new architecture —
      // including the bare /cases index — resolves to the archive as well, so a
      // stale external link can never produce a soft 404.
      { source: "/cases", destination: "/work", statusCode: 301 },
      { source: "/cases/:slug*", destination: "/work", statusCode: 301 },

      // Die Tourismus-Case-Study ist von /work/tourismus nach
      // /case-studies/seo-aio-tourismus umgezogen. Direkt auf das Ziel, nicht
      // über /work — sonst entstünde eine Redirect-Kette.
      {
        source: "/work/tourismus",
        destination: "/case-studies/seo-aio-tourismus",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
