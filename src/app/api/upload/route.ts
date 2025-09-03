import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { collection, addDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const skpd = formData.get("skpd") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF allowed" }, { status: 400 });
    }

    // Pastikan folder public/uploads ada
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Simpan file dengan nama unik
    const uniqueName = `${uuidv4()}-${file.name}`;
    const filePath = path.join(uploadDir, uniqueName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Simpan metadata ke Firestore
    const fileData = {
      nama: file.name,
      size: formatFileSize(file.size),
      url: `/uploads/${uniqueName}`, // supaya tidak overwrite
      uploader: "User Biasa", // nanti ambil dari auth
      skpd: skpd ?? "Belum diisi",
      status: "Menunggu",
      createdAt: new Date().toISOString(),
      commentLink: null,
      catatan: null
    };

    const docRef = await addDoc(collection(db, "fileUploads"), fileData);

    const savedFile = {
      id: docRef.id,
      ...fileData
    };

    return NextResponse.json({ success: true, file: savedFile });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({
      error: "Upload failed: " + (error as Error).message
    }, { status: 500 });
  }
}

// Helper format ukuran file
function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function GET() {
  try {
    const q = query(
      collection(db, "fileUploads"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const files = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(files);
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({
      error: "Fetch failed: " + (error as Error).message
    }, { status: 500 });
  }
}
