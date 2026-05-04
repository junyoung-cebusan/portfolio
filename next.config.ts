import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "@napi-rs/canvas"],
  turbopack: {
    root: __dirname,
  },
};

export default withNextIntl(nextConfig);
