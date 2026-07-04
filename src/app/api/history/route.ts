import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const body = await request.json();
    const { examId, mode, score, totalQuestions, answers, timeSpentSeconds } = body;

    const history = await prisma.examHistory.create({
      data: {
        examId,
        userId,
        mode,
        score,
        totalQuestions,
        answers,
        timeSpentSeconds,
      }
    });
    
    return NextResponse.json(history);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json([]); // Guests don't see history for now, or we can return only their local history
    }

    const history = await prisma.examHistory.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(history);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
