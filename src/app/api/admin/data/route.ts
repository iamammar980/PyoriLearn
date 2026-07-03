import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') return null;

  return decoded;
}

export async function GET() {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch full data for admin control panel dashboard
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        progress: {
          select: {
            topicId: true,
            completed: true,
            watchedVideo: true,
            quizScore: true,
          },
        },
      },
    });

    const topics = await prisma.topic.findMany({
      include: {
        materials: true,
        quizzes: {
          include: {
            options: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ users, topics });
  } catch (error: any) {
    console.error('Admin GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
