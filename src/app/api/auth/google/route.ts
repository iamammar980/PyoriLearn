import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateState, generateCodeVerifier } from 'arctic';
import { google } from '@/lib/oauth';

// Begins the Google sign-in flow: create state + PKCE verifier, stash them in
// short-lived cookies, then redirect the user to Google's consent screen.
export async function GET() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);

  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === 'production';
  // sameSite 'lax' is required so these cookies survive the top-level redirect back from Google.
  const opts = { httpOnly: true, secure, sameSite: 'lax' as const, maxAge: 60 * 10, path: '/' };
  cookieStore.set('google_oauth_state', state, opts);
  cookieStore.set('google_code_verifier', codeVerifier, opts);

  return NextResponse.redirect(url);
}
