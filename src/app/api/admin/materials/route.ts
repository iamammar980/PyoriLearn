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

    const { topicId, content, type } = await request.json();

    if (!topicId || !content || !type) {
      return NextResponse.json({ error: 'Topic ID, content, and type are required' }, { status: 400 });
    }

    const material = await prisma.educationalMaterial.upsert({
      where: { topicId: Number(topicId) },
      update: { content, type },
      create: { topicId: Number(topicId), content, type },
    });

    return NextResponse.json({ success: true, material });
  } catch (error: any) {
    console.error('Admin materials save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
