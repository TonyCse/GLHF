import { DefaultSession } from "next-auth";


declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN" | "SUPER_ADMIN";
      pseudo?: string;
      createdAt?: string;
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    role: "USER" | "ADMIN" | "SUPER_ADMIN";
    pseudo?: string;
    createdAt?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "USER" | "ADMIN" | "SUPER_ADMIN";
    pseudo?: string;
    createdAt?: string;
  }
}
