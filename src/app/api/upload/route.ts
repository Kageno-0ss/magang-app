import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { v4 as uuidv4 } from "uuid";

// Init Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // ex: your-app.appspot.com
  });
}

const db = getFirestore();
const bucket = getStorage().bucket();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const skpd = formData.get("skpd") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF allowed" }, { status: 400 });
    }

    // Generate unique name
    const fileId = uuidv4();
    const fileName = `${session.user.id}_${fileId}_${file.name}`;

    // Upload file ke Firebase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = `uploads/${session.user.id}/${fileName}`;

    const fileRef = bucket.file(storagePath);
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Dapatkan URL download
    const [url] = await fileRef.getSignedUrl({
      action: "read",
      expires: "03-09-2030", // bisa diubah sesuai kebutuhan
    });

    // Simpan metadata ke Firestore
    const fileData = {
      nama: file.name,
      size: formatFileSize(file.size),
      url: url,
      uploader: session.user.name || "User",
      userId: session.user.id,
      skpd: skpd ?? "Belum diisi",
      status: "Menunggu",
      createdAt: new Date().toISOString(),
      commentLink: null,
      catatan: null,
    };

    const docRef = await db.collection("uploads").add(fileData);

    return NextResponse.json({ success: true, file: { id: docRef.id, ...fileData } });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed: " + (error as Error).message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let queryRef = db.collection("uploads").where("userId", "==", session.user.id);

    // Jika role admin → ambil semua file
    if ((session.user as any).role === "admin") {
      queryRef = db.collection("uploads");
    }

    const snapshot = await queryRef.orderBy("createdAt", "desc").get();
    const files = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(files);

  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Fetch failed: " + (error as Error).message }, { status: 500 });
  }
}

// Helper format ukuran file
function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
