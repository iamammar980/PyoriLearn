import { Google } from 'arctic';

/**
 * Google OAuth client (arctic).
 * Credentials come from .env.local:
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
 * The redirect URI must exactly match one registered in the Google Cloud console.
 */
export const google = new Google(
  process.env.GOOGLE_CLIENT_ID ?? '',
  process.env.GOOGLE_CLIENT_SECRET ?? '',
  process.env.GOOGLE_REDIRECT_URI ?? 'http://localhost:3000/api/auth/callback/google'
);

/** Decode a Google ID token (already trusted — it came straight from Google's token endpoint over TLS). */
export function decodeIdToken(idToken: string): {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
} {
  const payload = idToken.split('.')[1];
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
}
