import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/exams/[id] - Get full exam details
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const exam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json(exam);
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}

// PUT /api/admin/exams/[id] - Update exam properties
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, level, accessLevel, planIds, metadata, sections } = body;

    const updatedExam = await prisma.exam.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(level !== undefined && { level }),
        ...(accessLevel !== undefined && { accessLevel }),
        ...(planIds !== undefined && { planIds }),
        ...(metadata !== undefined && { metadata }),
        ...(sections !== undefined && { sections }),
      },
    });

    return NextResponse.json(updatedExam);
  } catch (error: any) {
    console.error("Admin Update Exam Error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật CSDL" }, { status: 500 });
  }
}

// DELETE /api/admin/exams/[id] - Delete an exam
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.exam.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Xóa đề thi thành công" });
  } catch (error: any) {
    console.error("Admin Delete Exam Error:", error);
    return NextResponse.json({ error: "Lỗi xóa dữ liệu" }, { status: 500 });
  }
}
