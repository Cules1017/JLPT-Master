import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { examIds, level, accessLevel, planIds } = body;

    if (!Array.isArray(examIds) || examIds.length === 0) {
      return NextResponse.json({ error: "No exams selected" }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (level !== undefined) dataToUpdate.level = level;
    if (accessLevel !== undefined) dataToUpdate.accessLevel = accessLevel;
    if (planIds !== undefined) dataToUpdate.planIds = planIds;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await prisma.exam.updateMany({
      where: { id: { in: examIds } },
      data: dataToUpdate,
    });

    return NextResponse.json({ message: "Bulk update successful" });
  } catch (error: any) {
    console.error("Admin Bulk Update Error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật CSDL" }, { status: 500 });
  }
}
