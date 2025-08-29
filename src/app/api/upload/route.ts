import { NextResponse } from "next/server"; 
import { writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const skpd = formData.get("skpd") as string | null; // ⬅️ ambil SKPD dari input

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF allowed" }, { status: 400 });
    }

    // Simpan file ke public/uploads
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, file.name);

    await writeFile(filePath, buffer);

    // Simpan metadata ke database
    const savedFile = await prisma.fileUpload.create({
      data: {
        nama: file.name,
        size: formatFileSize(file.size),
        url: `/uploads/${file.name}`,
        uploader: "User Biasa", // nanti bisa ambil dari auth
        skpd: skpd ?? "Belum diisi", // ⬅️ simpan SKPD
        status: "Menunggu",
      },
    });

    return NextResponse.json({ success: true, file: savedFile });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// Helper format ukuran file
function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function GET() {
  const files = await prisma.fileUpload.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(files);
}
