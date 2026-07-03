import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.id;
    const { topicId, watchedVideo, completed, quizScore } = await request.json();

    if (!topicId) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 });
    }

    // Find or create progress record
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_topicId: { userId, topicId: Number(topicId) },
      },
      update: {
        ...(watchedVideo !== undefined && { watchedVideo }),
        ...(completed !== undefined && { completed }),
        ...(quizScore !== undefined && {
          // Keep the highest quiz score
          quizScore: {
            set: Math.max(
              (await prisma.userProgress.findUnique({
                where: { userId_topicId: { userId, topicId: Number(topicId) } },
              }))?.quizScore || 0,
              Number(quizScore)
            ),
          },
        }),
      },
      create: {
        userId,
        topicId: Number(topicId),
        watchedVideo: watchedVideo || false,
        completed: completed || false,
        quizScore: quizScore || 0,
      },
    });

    // Re-check and update overall completion state
    // Let's say topic is fully completed if video is watched AND material is completed AND quiz is passed (score >= 70)
    const currentProgress = await prisma.userProgress.findUnique({
      where: { userId_topicId: { userId, topicId: Number(topicId) } },
    });

    if (currentProgress && currentProgress.watchedVideo && currentProgress.completed && currentProgress.quizScore >= 70) {
      // It is already completed, but we can verify it
    }

    return NextResponse.json({ success: true, progress });
  } catch (error: any) {
    console.error('Progress update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
