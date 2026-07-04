import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing exams or just update them?
  // Let's create some dummy exams to test the UI.
  
  const levels = ["N1", "N2", "N3", "N4", "N5"];
  
  for (const level of levels) {
    // 2 exams per level
    for (let i = 1; i <= 2; i++) {
      await prisma.exam.create({
        data: {
          level: level,
          title: `Đề thi JLPT ${level} - Tháng ${i === 1 ? '7/2023' : '12/2023'}`,
          isFree: level === "N5" || (level === "N4" && i === 1), // N5 always free, N4 has 1 free
          metadata: {
            exam: "JLPT",
            level: level,
            year: 2023,
            session: i === 1 ? "July" : "December",
            total_questions: 100,
            time_limit_minutes: 120
          },
          sections: [] // Empty sections just for UI testing
        }
      });
    }
  }

  console.log("Mock exams created!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
