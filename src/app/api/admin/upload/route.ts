import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') return null;
  return decoded;
}

// Uploads a file for use inside educational materials (images, presentations, PDFs, etc.).
// - In production (BLOB_READ_WRITE_TOKEN set): stores in Vercel Blob and returns its public URL.
// - In local dev (no token): saves to /public/uploads and returns a local URL, so uploads
//   work immediately without any cloud setup.
export async function POST(request: Request) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const form = await request.formData();
    const file = form.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Timestamp + sanitized original name keeps URLs readable and avoids collisions.
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(safeName, file, { access: 'public', addRandomSuffix: false });
      return NextResponse.json({ url: blob.url, name: file.name, type: file.type });
    }

    // Local dev fallback.
    const bytes = Buffer.from(await file.arrayBuffer());
    const dir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, safeName), bytes);
    return NextResponse.json({ url: `/uploads/${safeName}`, name: file.name, type: file.type });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
