import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json();

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, name, password: hashed, role: "user" },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: "Register failed" }, { status: 500 });
  }
}
