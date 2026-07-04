import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email và mật khẩu là bắt buộc" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email này đã được sử dụng" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        verifyToken,
        role: "USER" // Default role
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verifyToken);
    } catch (emailError) {
      console.error("Lỗi gửi email:", emailError);
      // We still return success but maybe warn about email
    }

    return NextResponse.json({ 
      success: true, 
      message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản." 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Đã có lỗi xảy ra khi đăng ký" }, { status: 500 });
  }
}
