import { NextResponse } from "next/server";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const { id, status, catatan } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID wajib diisi" },
        { status: 400 }
      );
    }

    // Reference ke document di Firestore
    const docRef = doc(db, "fileUploads", id.toString());

    // Cek apakah document exists
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return NextResponse.json(
        { success: false, error: "File tidak ditemukan" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    // Hanya update field yang dikirim
    if (status !== undefined && status !== "") {
      updateData.status = status;
    }
    
    if (catatan !== undefined) {
      updateData.catatan = catatan || null;
    }

    // Update document
    await updateDoc(docRef, updateData);

    // Get updated document
    const updatedDocSnap = await getDoc(docRef);
    const updatedFile = {
      id: updatedDocSnap.id,
      ...updatedDocSnap.data()
    };

    return NextResponse.json({ success: true, file: updatedFile });

  } catch (error) {
    console.error("Error update file:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { success: false, error: "Update failed: " + errorMessage },
      { status: 500 }
    );
  }
}