import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { Role } from "@prisma/client";
import { isBlocked, recordFailure, resetAttempts } from "@/lib/security/rateLimit";
import { logger } from "@/lib/logger";

const authSecret = process.env.NEXTAUTH_SECRET;

function logAuthFailure(reason: string, email: string) {
  logger.warn("auth_connexion_refusee", { raison: reason, email });
}

function getHeaderValue(headers: unknown, name: string) {
  if (!headers) return undefined;

  if (headers instanceof Headers) {
    return headers.get(name) ?? undefined;
  }

  if (typeof headers === "object") {
    const value = (headers as Record<string, string | string[] | undefined>)[name];
    return Array.isArray(value) ? value[0] : value;
  }

  return undefined;
}

export const authOptions: NextAuthOptions = {
  pages: { signIn: "/connexion" },
  session: { strategy: "jwt" },
  secret: authSecret,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).trim().toLowerCase();
        const forwarded = getHeaderValue(request?.headers, "x-forwarded-for") ?? "";
        const ip = forwarded.split(",")[0]?.trim() || getHeaderValue(request?.headers, "x-real-ip") || "unknown";
        const key = `${email}|${ip}`;
        const blocked = isBlocked(key);
        if (blocked.blocked) {
          logAuthFailure("rate_limited", email);
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user || !user.password) {
          logAuthFailure("user_not_found_or_no_password", email);
          recordFailure(key);
          return null;
        }

        const isValid = await compare(credentials.password as string, user.password);
        if (!isValid) {
          logAuthFailure("invalid_password", email);
          recordFailure(key);
          return null;
        }

        // Bloque la connexion si l'utilisateur est soft-delete
        if ("isDeleted" in user && user.isDeleted) {
          logAuthFailure("soft_deleted", email);
          recordFailure(key);
          return null;
        }

        if (user.emailVerificationTokenHash && !user.emailVerifiedAt) {
          logAuthFailure("email_not_verified", email);
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        resetAttempts(key);

        return {
          id: String(user.id),
          email: user.email,
          name: user.pseudo ?? "",
          pseudo: user.pseudo ?? "",
          role: user.role as Role,
          createdAt: user.createdAt?.toISOString() ?? "",
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.pseudo = user.pseudo ?? user.name ?? "";
        token.role = user.role ?? "USER";
        token.createdAt = user.createdAt ?? "";
      }

      if (!token.role && token.email) {
        const dbUser = await prisma.user.findFirst({
          where: { email: token.email as string, isDeleted: false },
          select: { id: true, role: true, pseudo: true, createdAt: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.pseudo = dbUser.pseudo ?? "";
          token.createdAt = dbUser.createdAt?.toISOString() ?? "";
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ""; // NextAuth stocke l'id dans token.sub
        session.user.pseudo = (token.pseudo as string) ?? "";
        session.user.role = (token.role as Role) ?? "USER";
        session.user.createdAt = (token.createdAt as string) ?? "";
      }
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}

const handler = NextAuth(authOptions);

export const handlers = {
  GET: handler,
  POST: handler,
};
