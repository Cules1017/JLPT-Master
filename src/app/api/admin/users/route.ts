import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/users - Get all users
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: { histories: true }
        },
        subscriptions: {
          where: { status: "ACTIVE" },
          include: { plan: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Admin Fetch Users Error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}

// PUT /api/admin/users - Update user role
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    // Không cho phép tự đổi quyền của chính mình
    if (userId === session.user.id) {
      return NextResponse.json({ error: "Bạn không thể tự thay đổi quyền của chính mình!" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role },
      select: { id: true, email: true, role: true }
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Admin Update User Role Error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật CSDL" }, { status: 500 });
  }
}
