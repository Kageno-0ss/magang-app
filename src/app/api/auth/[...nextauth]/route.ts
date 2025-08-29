import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // 1. Login ke Firebase Auth
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials!.email,
            credentials!.password
          );

          const user = userCredential.user;

          // 2. Ambil role dari Firestore
          const userDocRef = doc(db, "users", user.uid); // user.uid harus sama dgn docId di Firestore
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            throw new Error("User tidak ditemukan di Firestore");
          }

          const userData = userDoc.data();

          // 3. Return data user ke NextAuth
          return {
            id: user.uid,
            email: user.email,
            role: userData?.role || "user", // default role: user
          };
        } catch (err) {
          console.error("Login gagal:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // simpan role ke JWT token
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role; // inject role ke session
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // redirect ke /login kalau belum login
  },
});

export { handler as GET, handler as POST };
