import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, features, cycles, isActive, metadata } = body;

    const plan = await prisma.plan.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(cycles !== undefined && { cycles }),
        ...(features !== undefined && { features }),
        ...(isActive !== undefined && { isActive }),
        ...(metadata !== undefined && { metadata }),
      }
    });

    return NextResponse.json(plan);
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi cập nhật gói cước" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.plan.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Xóa thành công" });
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi xóa gói cước" }, { status: 500 });
  }
}
