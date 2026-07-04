import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token không hợp lệ" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { verifyToken: token },
    });

    if (!user) {
      return NextResponse.json({ error: "Token không tồn tại hoặc đã hết hạn" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verifyToken: null, // clear token after use
      },
    });

    return NextResponse.json({ success: true, message: "Xác thực tài khoản thành công!" });
  } catch (error: any) {
    console.error("Verify Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
