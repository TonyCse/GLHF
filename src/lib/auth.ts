import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { Role } from "@prisma/client";
import NextAuth from "next-auth";

export const authOptions: AuthOptions = {
  pages: { signIn: "/signin" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        // Bloquer la connexion si soft-deleted
        if ('isDeleted' in user && user.isDeleted) return null;

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
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
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
        session.user.id = token.sub ?? ""; // NextAuth met l'id dans token.sub
        session.user.pseudo = token.pseudo ?? "";
        session.user.role = token.role ?? "USER";
        session.user.createdAt = token.createdAt ?? "";
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export const { auth, signIn, signOut } = handler;
