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

export async function POST(request: Request) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, topicId, questionText, explanation, options } = await request.json();

    if (!topicId || !questionText || !options || !Array.isArray(options) || options.length === 0) {
      return NextResponse.json({ error: 'Topic ID, question text, and options are required' }, { status: 400 });
    }

    // Verify exactly one option is marked correct (standard check, or at least one)
    const correctCount = options.filter(o => o.isCorrect).length;
    if (correctCount === 0) {
      return NextResponse.json({ error: 'At least one option must be correct' }, { status: 400 });
    }

    let question;

    if (id) {
      // Update: Delete existing options, then write new options and update question text
      await prisma.quizOption.deleteMany({
        where: { questionId: Number(id) },
      });

      question = await prisma.quizQuestion.update({
        where: { id: Number(id) },
        data: {
          questionText,
          explanation: explanation || null,
          options: {
            create: options.map((o: any) => ({
              optionText: o.optionText,
              isCorrect: !!o.isCorrect,
            })),
          },
        },
        include: { options: true },
      });
    } else {
      // Create new
      question = await prisma.quizQuestion.create({
        data: {
          topicId: Number(topicId),
          questionText,
          explanation: explanation || null,
          options: {
            create: options.map((o: any) => ({
              optionText: o.optionText,
              isCorrect: !!o.isCorrect,
            })),
          },
        },
        include: { options: true },
      });
    }

    return NextResponse.json({ success: true, question });
  } catch (error: any) {
    console.error('Admin quizzes save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
