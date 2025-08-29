import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { id, status, catatan } = await req.json();

    // pastikan id dikonversi ke number (jaga-jaga)
    const updated = await prisma.fileUpload.update({
      where: { id: Number(id) },
      data: {
        status: status || undefined, // kalau kosong biarin ga diubah
        catatan: catatan || null,    // komentar bisa null
      },
    });

    return NextResponse.json({ success: true, file: updated });
  } catch (error) {
    console.error("Error update file:", error);
    return NextResponse.json(
      { success: false, error: "Update failed" },
      { status: 500 }
    );
  }
}
