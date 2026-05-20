"use client";
import Script from "next/script";

export default function ApiDocsPage() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
        precedence="default"
      />
      <div id="swagger-ui" style={{ minHeight: "100vh" }} />
      <Script
        src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"
        strategy="afterInteractive"
        onLoad={() => {
          const w = window as unknown as {
            SwaggerUIBundle: (config: Record<string, unknown>) => void;
          };
          w.SwaggerUIBundle({
            url: "/openapi.json",
            dom_id: "#swagger-ui",
            deepLinking: true,
          });
        }}
      />
    </>
  );
}
