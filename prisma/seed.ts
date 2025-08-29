import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@skpd.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@skpd.com",
      password: await bcrypt.hash("123456", 10),
      role: "admin",
    },
  });

  // User biasa
  const user = await prisma.user.upsert({
    where: { email: "user@skpd.com" },
    update: {},
    create: {
      name: "User Biasa",
      email: "user@skpd.com",
      password: await bcrypt.hash("123456", 10),
      role: "user",
    },
  });

  console.log("✅ Admin & User berhasil dibuat:", { admin, user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
