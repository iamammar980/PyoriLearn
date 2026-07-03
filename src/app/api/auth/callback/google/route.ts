import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { google, decodeIdToken } from '@/lib/oauth';
import { prisma } from '@/lib/db';
import { signToken } from '@/lib/jwt';

// Handles Google's redirect back: validates state, exchanges the code, upserts
// the user into our own User table, then mints the SAME `token` cookie the rest
// of the app already uses — so progress tracking, admin, and /me all just work.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const cookieStore = await cookies();
  const storedState = cookieStore.get('google_oauth_state')?.value;
  const codeVerifier = cookieStore.get('google_code_verifier')?.value;

  const fail = () => NextResponse.redirect(new URL('/login?error=google', request.url));

  if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
    return fail();
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const claims = decodeIdToken(tokens.idToken());
    const email = claims.email;

    if (!email) return fail();
    const name = claims.name || email.split('@')[0];

    // Upsert by email: links to an existing account if one exists, otherwise
    // creates a passwordless (Google-only) user.
    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: { email, name, password: null, role: 'USER' },
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Clean up the temporary OAuth cookies.
    cookieStore.delete('google_oauth_state');
    cookieStore.delete('google_code_verifier');

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return fail();
  }
}
