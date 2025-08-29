import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "admin" | "user";
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      role: "admin" | "user";
    };
  }

  interface JWT {
    id: string;
    role: "admin" | "user";
  }
}
