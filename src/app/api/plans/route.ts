import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(plans);
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
