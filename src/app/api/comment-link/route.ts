import { NextResponse } from "next/server";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Import db langsung

// POST /api/comment-link
export async function POST(req: Request) {
  try {
    const { id, url } = await req.json();

    if (!id || !url) {
      return NextResponse.json(
        { success: false, error: "ID dan URL wajib diisi" },
        { status: 400 }
      );
    }

    // Update document di Firestore collection "fileUploads"
    const docRef = doc(db, "fileUploads", id.toString());
    
    // Cek apakah document exists
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return NextResponse.json(
        { success: false, error: "File tidak ditemukan" },
        { status: 404 }
      );
    }

    // Update commentLink field
    await updateDoc(docRef, {
      commentLink: url,
      updatedAt: new Date().toISOString()
    });

    // Get updated document
    const updatedDoc = await getDoc(docRef);
    const updatedData = { id, ...updatedDoc.data() };

    return NextResponse.json({ 
      success: true, 
      file: updatedData 
    });

  } catch (err: any) {
    console.error("Error menambahkan link komentar:", err);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}