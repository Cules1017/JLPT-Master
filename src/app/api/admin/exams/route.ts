import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/exams - List all exams
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const exams = await prisma.exam.findMany({
      select: {
        id: true,
        title: true,
        level: true,
        accessLevel: true,
        planIds: true,
        createdAt: true,
        _count: {
          select: { histories: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(exams);
  } catch (error: any) {
    console.error("Admin Fetch Exams Error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}

// POST /api/admin/exams - Create a new exam from JSON
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, level, accessLevel, metadata, sections } = body;

    if (!metadata || !sections) {
      return NextResponse.json({ error: "Dữ liệu JSON không hợp lệ" }, { status: 400 });
    }

    const finalTitle = title || `${metadata.exam || "JLPT"} ${metadata.level || "N3"} - ${metadata.year || ""} ${metadata.session || ""}`.trim();
    const finalLevel = level || metadata.level || "N3";
    const finalAccessLevel = accessLevel || "FREE";
    const finalPlanIds = body.planIds || [];

    const newExam = await prisma.exam.create({
      data: {
        title: finalTitle,
        level: finalLevel,
        accessLevel: finalAccessLevel,
        planIds: finalPlanIds,
        metadata: metadata,
        sections: sections,
      },
    });

    return NextResponse.json(newExam, { status: 201 });
  } catch (error: any) {
    console.error("Admin Create Exam Error:", error);
    return NextResponse.json({ error: "Lỗi lưu đề thi vào CSDL" }, { status: 500 });
  }
}
