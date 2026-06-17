import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // German moved from /de/* to the root. Permanently redirect the old
      // German URLs so existing links and indexed pages resolve cleanly.
      { source: "/de", destination: "/", permanent: true },
      { source: "/de/:path*", destination: "/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
