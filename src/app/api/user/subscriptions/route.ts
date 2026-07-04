import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
        endDate: { gt: new Date() } // Chỉ lấy các gói chưa hết hạn
      },
      include: {
        plan: true
      },
      orderBy: { endDate: "desc" }
    });

    return NextResponse.json(subscriptions);
  } catch (error: any) {
    console.error("Fetch User Subscriptions Error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
