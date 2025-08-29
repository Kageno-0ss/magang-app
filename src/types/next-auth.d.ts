import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

// Extend User (di database)
declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: "admin" | "user";
  }

  interface Session {
    user: {
      id: string;
      role: "admin" | "user";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "user";
  }
}
