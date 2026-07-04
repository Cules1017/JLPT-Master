import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plans = await prisma.plan.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(plans);
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, features, cycles, isActive, metadata } = body;

    const newPlan = await prisma.plan.create({
      data: {
        name,
        features,
        cycles,
        metadata: metadata || {},
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(newPlan, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi tạo gói cước" }, { status: 500 });
  }
}
