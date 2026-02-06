import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 12);

  const user = await prisma.user.upsert({
    where: { email: "admin@rally.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@rally.com",
      password: hashedPassword,
    },
  });

  console.log("✅ Seed completed");
  console.log("📧 Email: admin@rally.com");
  console.log("🔑 Senha: 123456");
  console.log("🆔 User ID:", user.id);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
