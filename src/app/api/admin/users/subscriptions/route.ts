import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, plans } = body;

    if (!userId || !plans || !Array.isArray(plans)) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    const createdSubscriptions = [];

    // Thêm hoặc Cập nhật các bản ghi Subscription
    for (const plan of plans) {
      const { planId, durationDays } = plan;

      const existingSub = await prisma.subscription.findFirst({
        where: { userId, planId }
      });

      if (existingSub) {
        let newEndDate = new Date(existingSub.endDate);
        const now = new Date();
        
        // Nếu gói đã hết hạn, tính lại ngày bắt đầu từ hôm nay
        if (newEndDate < now) {
          newEndDate = new Date(now);
        }
        
        // Cộng thêm ngày
        newEndDate.setDate(newEndDate.getDate() + Number(durationDays));

        const updatedSub = await prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            endDate: newEndDate,
            status: "ACTIVE"
          },
          include: { plan: true }
        });
        createdSubscriptions.push(updatedSub);
      } else {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + Number(durationDays));

        const sub = await prisma.subscription.create({
          data: {
            userId,
            planId,
            startDate,
            endDate,
            status: "ACTIVE"
          },
          include: { plan: true }
        });
        createdSubscriptions.push(sub);
      }
    }

    return NextResponse.json(createdSubscriptions);
  } catch (error: any) {
    console.error("Admin Grant Plan Error:", error);
    return NextResponse.json({ error: "Lỗi thêm gói cước" }, { status: 500 });
  }
}
