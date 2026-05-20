/** @type {import('next').NextConfig} */

const requiredEnvVars = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "PAYPAL_CLIENT_ID",
  "PAYPAL_CLIENT_SECRET",
  "PAYPAL_BASE_URL",
  "PAYPAL_WEBHOOK_ID",
];

const isProdBuild = process.env.NODE_ENV === "production";
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    if (isProdBuild) {
      throw new Error(`Variable d'environnement manquante : ${key}`);
    } else {
      console.warn(`[next.config] Variable d'environnement manquante : ${key}`);
    }
  }
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    const securityHeaders = [
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "form-action 'self'",
          "object-src 'none'",
          "frame-ancestors 'none'",
          "img-src 'self' data: https:",
          "font-src 'self' data:",
          "style-src 'self' 'unsafe-inline' https://unpkg.com",
          [
            "script-src 'self'",
            "'unsafe-inline'",
            !isProd ? "'unsafe-eval'" : null,
            "https://www.paypal.com",
            "https://www.paypalobjects.com",
            "https://va.vercel-scripts.com",
            "https://www.googletagmanager.com",
            "https://unpkg.com",
          ]
            .filter(Boolean)
            .join(" "),
          "connect-src 'self' https://api-m.sandbox.paypal.com https://api-m.paypal.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net",
          "frame-src https://www.paypal.com https://www.googletagmanager.com",
        ].join("; "),
      },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: baseUrl },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
