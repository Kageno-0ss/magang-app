import { NextResponse } from "next/server";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
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

    // Cek apakah user sudah ada
    const userDocRef = doc(db, "users", email);
    const existingUser = await getDoc(userDocRef);

    if (existingUser.exists()) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat unique ID
    const userId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    // Simpan user data ke Firestore dengan email sebagai document ID
    const userData = {
      id: userId,
      email: email,
      name: name,
      password: hashedPassword, // Simpan hashed password untuk credentials login
      role: "user",
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };

    await setDoc(userDocRef, userData);

    // Return user data (tanpa password)
    const responseUser = {
      id: userId,
      email: email,
      name: name,
      role: "user"
    };

    return NextResponse.json({ 
      success: true, 
      user: responseUser,
      message: "User berhasil dibuat dengan Firestore"
    });

  } catch (error: any) {
    console.error("Register error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json({ 
      error: "Register failed: " + errorMessage 
    }, { status: 500 });
  }
}