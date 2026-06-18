import type { MetadataRoute } from "next";

const BASE_URL = "https://prepforge-ten.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Disallow API routes and authenticated dashboard.
        // NOTE: /_next/ is intentionally NOT disallowed — crawlers need
        // render-critical CSS/JS to properly render and index your pages.
        disallow: ["/api/", "/app/", "/onboarding/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
