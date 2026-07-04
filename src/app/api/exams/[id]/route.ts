import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const exam = await prisma.exam.findUnique({
      where: { id }
    });
    
    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }
    
    // Access Control
    const session = await auth();
    const role = session?.user?.role;

    if (exam.accessLevel === "LOGIN" && role !== "ADMIN") {
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized: Vui lòng đăng nhập' }, { status: 401 });
      }
    } else if (exam.accessLevel === "PREMIUM" && role !== "ADMIN") {
      if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized: Vui lòng đăng nhập' }, { status: 401 });
      }

      const userSubs = await prisma.subscription.findMany({
        where: {
          userId: session.user.id,
          status: "ACTIVE",
          endDate: { gt: new Date() }
        }
      });

      let requiredPlanIds: string[] = [];
      try {
         requiredPlanIds = Array.isArray(exam.planIds) ? exam.planIds : JSON.parse(exam.planIds as string || "[]");
      } catch (e) {
         requiredPlanIds = [];
      }
      
      const hasAccess = userSubs.some(sub => requiredPlanIds.includes(sub.planId));
      
      if (!hasAccess) {
         return NextResponse.json({ error: 'Forbidden: Yêu cầu gói Premium' }, { status: 403 });
      }
    }

    return NextResponse.json(exam);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
