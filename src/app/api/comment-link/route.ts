import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // pastikan ada prisma client di /lib/prisma.ts

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

    const updated = await prisma.fileUpload.update({
      where: { id: Number(id) },
      data: { commentLink: url },
    });

    return NextResponse.json({ success: true, file: updated });
  } catch (err: any) {
    console.error("Error menambahkan link komentar:", err);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
