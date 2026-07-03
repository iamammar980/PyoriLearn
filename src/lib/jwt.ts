import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'pylearn-super-secret-key-12345';

export function signToken(payload: { id: number; email: string; role: string; name: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { id: number; email: string; role: string; name: string } | null {
  try {
    return jwt.verify(token, SECRET) as any;
  } catch (error) {
    return null;
  }
}
