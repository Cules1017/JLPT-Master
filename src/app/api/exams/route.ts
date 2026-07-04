import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const exams = await prisma.exam.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        level: true,
        accessLevel: true,
        planIds: true,
        title: true,
        metadata: true,
        createdAt: true,
      }
    });
    return NextResponse.json(exams);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
