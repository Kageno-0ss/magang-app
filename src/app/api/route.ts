import { NextResponse } from "next/server";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, name, dan password wajib diisi" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Hash password untuk backup storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Simpan additional user data ke Firestore
    const userData = {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name: name,
      role: "user",
      emailVerified: false,
      createdAt: new Date().toISOString(),
      // Jangan simpan password di Firestore (Firebase Auth sudah handle)
    };

    await setDoc(doc(db, "users", firebaseUser.uid), userData);

    // Return user data (tanpa password)
    const responseUser = {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name: name,
      role: "user"
    };

    return NextResponse.json({ 
      success: true, 
      user: responseUser,
      message: "User berhasil dibuat dengan Firebase Auth"
    });

  } catch (error: any) {
    console.error("Register error:", error);
    
    // Handle Firebase Auth specific errors
    let errorMessage = "Register failed";
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "Email sudah terdaftar";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Format email tidak valid";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Password terlalu lemah";
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 500 });
  }
}