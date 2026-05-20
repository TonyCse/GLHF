import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    pool: "threads",
    exclude: ["node_modules/**", "dist/**", ".next/**", "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      include: [
        "src/lib/security/**/*.ts",
        "src/lib/tokens.ts",
        "src/lib/paypal.ts",
        "src/lib/tournaments.ts",
        "src/app/api/auth/signup/route.ts",
        "src/app/api/auth/signup.ts",
        "src/app/api/payment/subscribe/route.ts",
        "src/app/api/payment/webhook/route.ts",
        "src/app/api/user/route.ts",
      ],
      exclude: ["**/*.test.*"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
