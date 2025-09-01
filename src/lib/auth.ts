// lib/auth.ts
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, User } from "next-auth";
import bcrypt from "bcrypt";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ✅ bikin type UserWithRole biar aman
type UserWithRole = {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "user";
};

export const authOptions: NextAuthOptions = {
  // ✅ Tidak pakai adapter, langsung JWT strategy
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Query user dari Firestore berdasarkan email
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", credentials.email));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            return null;
          }

          // Ambil user pertama yang match
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();

          // Verify password (jika ada)
          if (userData.password) {
            const isValid = await bcrypt.compare(credentials.password, userData.password);
            if (!isValid) return null;
          }

          // ✅ return dengan tipe jelas
          return {
            id: userDoc.id,
            email: userData.email,
            name: userData.name || null,
            role: userData.role as "admin" | "user" || "user",
          } satisfies UserWithRole;

        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as UserWithRole;
        token.id = u.id;
        token.role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub!;
        (session.user as any).role = token.role as "admin" | "user";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET
};