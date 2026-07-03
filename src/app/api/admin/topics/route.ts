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

    const { id, title, description, parentId, youtubeUrl, order } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const descriptionValue = description || '';

    const parentIdParsed = parentId ? Number(parentId) : null;
    const orderParsed = order ? Number(order) : 0;

    let topic;

    if (id) {
      // Update
      topic = await prisma.topic.update({
        where: { id: Number(id) },
        data: {
          title,
          description: descriptionValue,
          parentId: parentIdParsed,
          youtubeUrl: youtubeUrl || null,
          order: orderParsed,
        },
      });
    } else {
      // Create
      topic = await prisma.topic.create({
        data: {
          title,
          description: descriptionValue,
          parentId: parentIdParsed,
          youtubeUrl: youtubeUrl || null,
          order: orderParsed,
        },
      });
    }

    return NextResponse.json({ success: true, topic });
  } catch (error: any) {
    console.error('Admin topic save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
