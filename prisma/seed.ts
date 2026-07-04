import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@jlpt.com";
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email }
  });

  if (existingAdmin) {
    console.log("Admin user already exists");
    return;
  }

  const passwordHash = await bcrypt.hash("admin123456", 10);

  await prisma.user.create({
    data: {
      name: "Admin",
      email,
      passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
    }
  });

  console.log("Admin user created!");
  console.log("Email: admin@jlpt.com");
  console.log("Password: admin123456");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
