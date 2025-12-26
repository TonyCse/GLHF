// src/middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => token?.role === "ADMIN",
  },
});

// src/middleware.ts
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
