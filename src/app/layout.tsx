import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'PyLearn - Interactive Python Learning Platform',
  description: 'Learn Python programming through high-quality video explanations, interactive quizzes, and rich web materials.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  let user = null;

  if (token) {
    user = verifyToken(token);
  }

  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar user={user} />
        <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
